/**
 * ocean
 * A module loader with the same API of seajs(http://seajs.org/).
 * Copyright(c) 2010 ~ 2012 Alibaba.com, Inc.
 * MIT Licensed
 */

(function (GLOBAL, GLOBAL_VAR_NAME, UNDEFINED) {

// Shared configuration object.
var config = {
		alias: {},
		base: location.protocol + '//' + location.hostname + '/',
		charset: 'utf-8',
//		preload: [],
		vars: {}
	};

// Build-in utility functions.
var util = (function () {
	var PATTERN_HREF = /^(\w+:\/\/)([^\/]*)(\/.+)?$/,

		toString = Object.prototype.toString,

		slice = Array.prototype.slice,

		util = {
			/**
			 * Bind function execution context.
			 * @param fn {Function}
			 * @param context {Object}
			 * @return {Function}
			 */
			bind: function (fn, context) {
				return function () {
					fn.apply(context, arguments);
				};
			},

			/**
			 * Get own property names of an object.
			 * @param obj {Object}
			 * @return {Array}
			 */
			keys: Object.keys || function (obj) {
				var result = [],
					key;

				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						result.push(key);
					}
				}

				return result;
			},

			/**
			 * Test whether the given value is a normal object.
			 * @param value {*}
			 * @return {boolean}
			 */
			isObject: function (value) {
				return toString.call(value) === '[object Object]';
			},

			/**
			 * Deep-merge properties of the source to the target.
			 * @param target {Object}
			 * @param source {Object}
			 * @return {Object}
			 */
			merge: function (target, source) {
				var keys = util.keys(source),
					i = 0,
					len = keys.length,
					key;

				for (; i < len; ++i) {
					key = keys[i];
					if (util.isObject(target[key]) && util.isObject(source[key])) {
						util.merge(target[key], source[key]);
					} else {
						target[key] = source[key];
					}
				}

				return target;
			},

			/**
			 * Normalize a uri, resolving '.' and '..'.
			 * @param uri {string}
			 * @return {string}
			 */
			normalize: function (uri) {
				var re, protocol, hostname, pathname, parts, i;

				re = uri.match(PATTERN_HREF);
				protocol = re[1];
				hostname = re[2];
				pathname = re[3];

				parts = pathname.split('/');

				for (i = 0; i < parts.length; ++i) {
					if (parts[i] === '.' || parts[i] === '..' && i < 2) {
						parts.splice(i, 1);
						i = i - 1;
					} else if (parts[i] === '..') {
						parts.splice(i - 1, 2);
						i = i - 2;
					}
				}

				pathname = parts.join('/');

				return protocol + hostname + pathname;
			},

			/**
			 * Convert an array-like object to a real array.
			 * @param obj {Object}
			 * @return {Array}
			 */
			toArray: function (obj) {
				return slice.call(obj);
			}
		};

	return util;
}());

// Error isolation sandbox.
var sandbox = (function () {
	var queue = [],

		head = document.getElementsByTagName('head')[0],

		base = head.getElementsByTagName('base')[0],

		exports = {
			/**
			 * Run function in sandbox.
			 * @param fn {Function}
			 * @param context {Object|null}
			 * @param args {Array}
			 */
			run: function (fn, context, args) {
				var el = document.createElement('script');

				el.text = GLOBAL_VAR_NAME + '._exec()';
				queue.push([ fn, context || null, args || [] ]);

				// Execute code synchronously.
				if (base) { // Avoid a known bug in IE6.
					head.insertBefore(el, base);
				} else {
					head.appendChild(el);
				}

				// Clean up.
				head.removeChild(el);
			},

			/**
			 * Trigger sandbox.
			 * This function will be registered in global object.
			 */
			_exec: function () {
				var meta = queue.pop();

				meta[0].apply(meta[1], meta[2]);
			}
		};

	return exports;
}());
// Asynchronous JS file loader.
var loader = (function () {
	var pending = {},

		head = document.getElementsByTagName('head')[0],

		base = head.getElementsByTagName('base')[0],

		/**
		 * Script element onload handler.
		 * @param el {Object}
		 * @callback {Function}
		 */
		onload = function (el, callback) {
			if ('onload' in el) { // For standard browsers.
				el.onload = function () {
					callback();
				};
			} else if ('onreadystatechange' in el) { // For legacy IE.
				el.onreadystatechange = function () {
					var state = this.readyState;

					if (state === 'loaded' || state === 'complete') {
						el.onreadystatechange = null;
						callback();
					}
				};
			}
		},

		exports = {
			/**
			 * Load a JS file.
			 * @param uri {string}
			 */
			load: function (uri) {
				var el;

				if (!pending[uri]) {
					// Avoid duplicated loading at the same time.
					pending[uri] = true;

					el = document.createElement('script');
					el.src = uri;
					el.charset = config.charset;
					el.async = 'async';

					onload(el, function () {
						// Clean useless DOM element.
						head.removeChild(el);
						delete pending[uri];
					});

					if (base) { // Avoid a known bug in IE6.
						head.insertBefore(el, base);
					} else {
						head.appendChild(el);
					}
				}
			}
		};

	return exports;
}());

// Module manager.
var manager = (function () {
	var PATTERN_EXTNAME = /\.\w+$/,

		PATTERN_FILENAME = /[^\/]+$/,

		PATTERN_PARAMS = /^(.*?)(\?.*)?$/,

		PATTERN_PROTOCOL = /\w+?:/,

		STATUS = {
			DEFINED: 1,
			COMPILED: 2,
			INITIALIZED: 3,
			BROKEN: 4
		},

		// id -> module map.
		cache = {},

		// id -> parameter map.
		params = {},

		// id -> reversing-dependencies map.
		hanging = {},

		// raw id -> resolved id map.
		idCache = {},

		exports = {
			/**
			 * Compile a module.
			 * @param module {Object}
			 */
			compile: function (module) {
					// Not initialized dependencies.
				var waiting = [],

					// Not loaded dependencies.
					missing = [],

					deps, i, len, id, meta;

				if (module.status >= STATUS.COMPILED) { // Avoid duplicated compiling.
					return;
				}

				module.status = STATUS.COMPILED;
				deps = this.require(module.dependencies);

				for (i = 0, len = deps.length; i < len; ++i) {
					if (!deps[i]) { // Found not initialized dependency.
						id = module.dependencies[i];
						waiting.push(id);
						if (deps[i] === UNDEFINED) { // Found not loaded dependency.
							// undefined means new face, null means loading.
							cache[id] = null;
							missing.push(id);
						}
					}
				}

				if (waiting.length > 0) { // Hang some-dependencies-unready module.
					meta = {
						module: module,
						count: waiting.length
					};

					for (i = 0, len = waiting.length; i < len; ++i) {
						id = waiting[i];
						if (hanging[id]) {
							hanging[id].push(meta);
						} else {
							hanging[id] = [ meta ];
						}
					}

					if (missing.length > 0) { // Load new faces.
						missing = this.load(missing);
						for (i = 0, len = missing.length; i < len; ++i) {
							loader.load(missing[i]);
						}
					}
				} else {
					// Initialize all-dependencies-ready module.
					this.initialize(module);
				}
			},

			/**
			 * Define a module.
			 * @param id {string}
			 * @param dependencies {Array}
			 * @param factory {Function}
			 * @return {Object}
			 */
			define: function (id, dependencies, factory) {
				var module = cache[id];

				if (!module) { // Avoid duplicated defining.
					module = {
						exports: null,
						factory: factory,
						id: id,
						status: STATUS.DEFINED
					};

					// Id is resolved base on current module.
					module.dependencies = this.resolve(dependencies);

					if (id) { // Save named module.
						cache[id] = module;
						if (hanging[id]) { // Compile reversing-depended module immediately.
							this.compile(module);
						}
					}
				}

				return module;
			},

			/**
			 * Initialize a module.
			 * @param module {Object}
			 */
			initialize: function (module) {
				var exports = module.exports = {},
					self = this,
					require;

				// Id is resolved base on current module.
				require = function (id) {
					id = self.resolve(id);
					return self.require([ id ])[0];
				};

				// Id is resolved base on current module.
				require.async = function (ids, callback) {
					ids = self.resolve(ids);
					return self.use(ids, callback);
				};

				// Isolate runtime error.
				sandbox.run(function () {
					try {
						if (typeof module.factory === 'function') {
							exports = module.factory.call(null, require, exports, module);
						} else { // Factory is an literal object.
							exports = module.factory;
						}

						if (exports) {
							module.exports = exports;
						}

						module.status = STATUS.INITIALIZED;

						// Try to initialize hanging modules
						// which are depended on current module.
						this.trigger(module.id);
					} catch (err) {
						// Rollback exports object when error occurred.
						module.exports = null;
						module.status = STATUS.BROKEN;
						throw err;
					}
				}, this);
			},

			/**
			 * Load new-face modules.
			 * @param ids {Array}
			 * @return {Array}
			 */
			load: function (ids) {
				var len = ids.length,
					i = 0,
					id;

				for (; i < len; ++i) {
					id = ids[i];
					// Load JS file with its own parameter.
					ids[i] = id + (params[id] || '');
				}

				return ids;
			},

			/**
			 * Get required modules.
			 * @param ids {Array}
			 * @return {Array}
			 */
			require: function (ids) {
				var result = [],
					i, len, id, module;

				for (i = 0, len = ids.length; i < len; ++i) {
					id = ids[i];
					module = cache[id];

					if (module) {
						if (!module.exports) { // Try to compile unready module.
							this.compile(module);
						}
						result[i] = module.exports;
					} else { // Id in cache means the module is loading.
						result[i] = (id in cache) ? null : UNDEFINED;
					}
				}

				return result;
			},

			/**
			 * Resolve id based on current module.
			 * @param ids {Array|string}
			 * @return {Array|string}
			 */
			resolve: function (ids) {
				var i, len, id, re, search,
					single = false;

				if (typeof ids === 'string') {
					single = true;
					ids = [ ids ];
				}

				for (i = 0, len = ids.length; i < len; ++i) {
					id = ids[i];

          /* This cache is WRONG! -- lifesinger
					if (idCache[id]) { // Use cached result.
						ids[i] = idCache[id];
						continue;
					}
					*/

					// Resolve alias.
					if (id.charAt(0) === '#') {
						id = id.substring(1);
					} else {
						id = ids[i].split('/');
						id[0] = config.alias[id[0]] || id[0];
						id = id.join('/');
					}

					// Resolve variable.
					id = id.replace(/\{(\w+)\}/g, function (all, name) {
						return config.vars[name] || all;
					});

					// Generate URI.
					if (!PATTERN_PROTOCOL.test(id)) { // Related to base.
						id = config.base + id;
					}

					// Append default extname.
					if (id.charAt(id.length - 1) === '#') {
						id = id.substring(0, id.length - 1);
					} else if (id.indexOf('?') === -1 && !PATTERN_EXTNAME.test(id)) {
						id += '.js';
					}

					// Trim parameters.
					re = id.match(PATTERN_PARAMS);
					id = re[1];
					search = re[2];

					// Normalize uri.
					id = util.normalize(id);

					// Save parameter.
					if (search) {
						params[id] = search;
					}

					ids[i] = idCache[ids[i]] = id;
				}

				return single ? ids[0] : ids;
			},

			/**
			 * Try to initialize hanging modules.
			 * @param id {string}
			 */
			trigger: function (id) {
				var meta;

				if (typeof hanging[id] === 'object') { // Has hanging modules of current id.
					while (meta = hanging[id].shift()) {
						if (--meta.count === 0) { // All depenencies ready.
							this.initialize(meta.module);
						}
					}
					delete hanging[id];
				}
			},

			/**
			 * Use modules.
			 * @param ids {Array|string}
			 * @param callback {Function}
			 */
			use: function (ids, callback) {
				var self = this,
					use = function () {
						// Using modules equals initializing an anonymous module
						// which depended on used modules.
						self.compile(self.define(null, ids, function () {
							if (callback) {
								callback.apply(null, self.require(ids));
							}
						}));
					};

				if (typeof ids === 'string') {
					ids = [ ids ];
				}

        use();

//				if (config.preload.length > 0) { // Need preloading.
//					this.compile(this.define(null, config.preload, function () {
//						config.preload = [];
//						use();
//					}));
//				} else {
//					use();
//				}
			}
		};

	return exports;
}());

// A simple AOP lib.
var aspect = (function () {
	var headHandler = {},

		tailHandler = {},

		/**
		 * Wrap a member function to enable adding head&tail handlers.
		 * @param obj {Object}
		 * @param fnName {string}
		 */
		hijack = function (obj, fnName) {
			var origin = obj[fnName];

			headHandler[fnName] = [];
			tailHandler[fnName] = [];

			obj[fnName] = function () {
				var args = util.toArray(arguments),
					ret;

				args = runHandlers(headHandler[fnName], obj, args, true);
				ret = origin.apply(obj, args);
				return runHandlers(tailHandler[fnName], obj, [ ret ], false);
			};
		},

		/**
		 * Run head&tail handlers serially.
		 * @param queue {Array}
		 * @param context {Object}
		 * @param isHead {boolean}
		 * @param ret {*}
		 */
		runHandlers = function (queue, context, args, isHead) {
			var len = queue.length,
				i = 0,
				tmp;

			for (; i < len; ++i) {
				tmp = queue[i].apply(context, args);
				if (tmp !== UNDEFINED) {
					args = isHead ? tmp : [ tmp ];
				}
			}

			return isHead ? args : args[0];
		},

		exports = {
			/**
			 * Add a head handler.
			 * @param fnName {string}
			 * @param fn {Function}
			 */
			before: function (fnName, fn) {
				if (!headHandler[fnName]) {
					hijack(this, fnName);
				}

				headHandler[fnName].push(fn);
			},

			/**
			 * Add a tail handler.
			 * @param fnName {string}
			 * @param fn {Function}
			 */
			after: function (fnName, fn) {
				if (!tailHandler[fnName]) {
					hijack(this, fnName);
				}

				tailHandler[fnName].push(fn);
			}
		};

	return exports;
}());

// Prepare public APIs.
(function () {
	var	exports = {
			/**
			 * Sandbox trigger
			 */
			_exec: sandbox._exec,

			/**
			 * Add a tail handler to a manager object member function.
			 * @param fnName {string}
			 * @param fn {Function}
			 */
			after: util.bind(aspect.after, manager),

			/**
			 * Add a head handler to a manager object member function.
			 * @param fnName {string}
			 * @param fn {Function}
			 */
			before: util.bind(aspect.before, manager),

			/**
			 * Change configuration.
			 * @param [option] {Object}
			 * @return {Object}
			 */
			config: function (option) {
				if (option) {
					util.merge(config, option);
				}

				return config;
			},

			/**
			 * Use modules.
			 * @param ids {Array|string}
			 * @param callback {Function}
			 */
			use: function (ids, callback) {
				ids = manager.resolve(ids);
				manager.use(ids, callback);
			}
		};

	// Define global loader object.
	GLOBAL[GLOBAL_VAR_NAME] = exports;

	/**
	 * Define a module.
	 * @param id {string}
	 * @param dependencies {Array}
	 * @param factory {Function}
	 */
	GLOBAL.define = function (id, dependencies, factory) {
		id = manager.resolve(id);
		manager.define(id, dependencies, factory);
	};
}());

}(window, 'seajs'));
