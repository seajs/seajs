// https://raw.github.com/army8735/Ai/master/base/fix.js
// https://raw.github.com/army8735/Ai/master/base/lang.js
// https://github.com/army8735/Ai/blob/master/base/amd.js

(function() {

	//补充ECMAScript5里的方法
	var arrayMethod = Array.prototype;
	if(!arrayMethod.filter) {
		arrayMethod.filter = function(fn, sc){
			var r = [], val;
			for(var i = 0, l = this.length >>> 0; i < l; i++) {
				if(i in this) {
					val = this[i];
					if(fn.call(sc, val, i, this)) {
						r.push(val);
					}
				}
			}
			return r;
		};
	}
	if(!arrayMethod.forEach) {
		arrayMethod.forEach = function(fn, sc){
			for(var i = 0, l = this.length >>> 0; i < l; i++){
				if (i in this)
					fn.call(sc, this[i], i, this);
			}
		};
	}
	if(!arrayMethod.map) {
		arrayMethod.map = function(fn, sc){
			for(var i = 0, copy = [], l = this.length >>> 0; i < l; i++){
				if (i in this)
					copy[i] = fn.call(sc, this[i], i, this);
			}
			return copy;
		};
	}
	if(!arrayMethod.indexOf) {
		arrayMethod.indexOf = function(value, from){
			var len = this.length >>> 0;

			from = Number(from) || 0;
			from = Math[from < 0 ? 'ceil' : 'floor'](from);
			if(from < 0) {
				from = Math.max(from + len, 0);
			}

			for(; from < len; from++) {
				if(from in this && this[from] === value) {
					return from;
				}
			}

			return -1;
		};
	}
	if(!arrayMethod.every) {
		arrayMethod.every = function(fn, context) {
			for(var i = 0, len = this.length >>> 0; i < len; i++) {
				if(i in this && !fn.call(context, this[i], i, this)) {
					return false;
				}
			}
			return true;
		}
	}
	if(!arrayMethod.some) {
		arrayMethod.some = function(fn, context) {
			for(var i = 0, len = this.length >>> 0; i < len; i++) {
				if(i in this && fn.call(context, this[i], i, this)) {
					return true;
				}
			}
			return false;
		}
	}
	if(!arrayMethod.reduce) {
		arrayMethod.reduce = function (fn /*, initial*/) {
			if(typeof fn !== 'function') {
				throw new TypeError(fn + ' is not an function');
			}

			var len = this.length >>> 0, i = 0, result;

			if(arguments.length > 1) {
				result = arguments[1];
			}
			else {
				do {
					if(i in this) {
						result = this[i++];
						break;
					}
					// if array contains no values, no initial value to return
					if(++i >= len) {
						throw new TypeError('reduce of empty array with on initial value');
					}
				}
				while(true);
			}

			for(; i < len; i++) {
				if (i in this) {
					result = fn.call(null, result, this[i], i, this);
				}
			}

			return result;
		}
	}
	if(!String.prototype.trim) {
		String.prototype.trim = function() {
			return String(this).replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}
	Array.isArray || (Array.isArray = function(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	});
	Date.now || (Date.now = function () {
		return +new Date;
	});
	Object.keys || (Object.keys = function(o) {
		if(o !== Object(o))
			throw new TypeError('Object.keys called on non-object');
		var ret=[],p;
		for(p in o)
			if(Object.prototype.hasOwnProperty.call(o,p))
				ret.push(p);
		return ret;
	});
	Object.create || (Object.create = function (o) {
		if(arguments.length > 1) {
			throw new Error('Object.create implementation only accepts the first parameter.');
		}
		function F() {}
		F.prototype = o;
		return new F();
	});
	Function.prototype.bind || (Function.prototype.bind = function(oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var fSlice = Array.prototype.slice,
			aArgs = fSlice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP
									 ? this
									 : oThis || window,
									 aArgs.concat(fSlice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	});

})();


var $$ = (function() {
	var lib = {},
		state = {},
		list = {},
		LOADING = 1,
		LOADED = 2,
		h = document.getElementsByTagName('head')[0];
	/**
	 * @public 设置script的url的映射关系，为版本自动化做准备
	 * @note url会类似xxx.8735.js形式，为版本控制发布工具产生，其中数字为版本号，将去除版本号的正确url对应到自身上
	 * @param {url} script的url
	 */
	function join(url) {
		lib[url.replace(/\.\d+\.js$/, '.js')] = url;
	}
	/**
	 * @public 可并行加载script文件，且仅加载一次
	 * @param {url} script的url
	 * @param {Function} 回调
	 * @param {String} script编码
	 */
	function load(url, cb, charset) {
		if(state[url] == LOADED) {
			cb();
		}
		else if(state[url] == LOADING) {
			list[url].push(cb);
		}
		else {
			state[url] = LOADING;
			list[url] = [cb];
			var s = document.createElement('script');
			s.async = true;
			if(charset)
				s.charset = charset;
			s.src = lib[url] || url;
			s.onload = s.onreadystatechange = function() {
				if(!this.readyState || /loaded|complete/.test(this.readyState)) {
					s.onload = s.onreadystatechange = null;
					//缓存记录
					state[url] = LOADED;
					list[url].forEach(function(cb) {
						cb();
					});
					list[url] = [];
					h.removeChild(s);
				}
			};
			h.appendChild(s);
		}
	}
	/**
	 * @public 获取映射库
	 * @return {Object} hashmap
	 */
	function map() {
		return lib;
	}
	return {
		join: join,
		load: load,
		map: map
	}
})();


var require,
	define;

(function() {

	var toString = Object.prototype.toString,
		lib = {},
		script = {},
		fac = {},
		baseUrl = 'http://' + location.host + location.pathname,
		defQueue,
		delay,
		delayCount = 0,
		delayQueue = [];

	function isString(o) {
        return toString.call(o) === "[object String]";
	}
	function isFunction(o) {
        return toString.call(o) === "[object Function]";
	}

	/**
	 * @public amd定义接口
	 * @param {string} 模块id，可选，省略为script文件url
	 * @param {array} 依赖模块id，可选
	 * @param {Function/object} 初始化工厂
	 */
	define = function(id, dependencies, factory) {
		if(!isString(id)) {
			factory = dependencies;
			dependencies = id;
			id = null;
		}
		if(!Array.isArray(dependencies)) {
			factory = dependencies;
			dependencies = null;
		}
		//在没有定义依赖的情况下，通过factory.toString()方式匹配正则，智能获取依赖列表
		if(!dependencies && isFunction(factory)) {
			var res = /(?:^|[^.])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g.exec(factory.toString().replace(/\/\/.*\n/g, ''));
			if(res)
				dependencies = res.slice(2);
		}
		var module = {
			id: id,
			dependencies: dependencies,
			factory: factory,
			exports: null,
			uri: null
		};
		//非匿名模块
		if(id)
			lib[id] = module;
		//存入def队列
		if(defQueue)
			defQueue.push(module);
		//记录factory和module的hash对应关系
		if(isFunction(factory))
			record(factory, module);
		return define;
	}
	define.amd = { jQuery: true };
	define.finish = function(url) {
		var mod = defQueue.pop();
		mod.uri = url;
		mod.id = mod.id || url;
		lib[mod.id] = lib[url] = mod;
	}
	function record(factory, mod) {
		var ts = genFacKey(factory);
		(fac[ts] = fac[ts] || []).push({
			f: factory,
			r: mod
		});
	}
	function genFacKey(factory) {
		return factory.toString().slice(0, 32);
	}
	/**
	 * @public 加载使用模块方法
	 * @param {string/array} 模块id或url
	 * @param {Function} 加载成功后回调
	 */
	function use(ids, cb) {
		defQueue = defQueue || []; //use之前的模块为手动添加在页面script标签的模块或合并在总库中的模块，它们需被排除在外
		var idList = isString(ids) ? [ids] : ids, wrap = function() {
			var keys = idList.map(function(v) {
				return lib[v] ? v : getAbsUrl(v);
			}), mods = [];
			keys.forEach(function(k) {
				var mod = getMod(k);
				if(!mod.exports) {
					var deps = [];
					mod.exports = {};
					//有依赖参数为依赖的模块，否则默认为require, exports, module3个默认模块
					if(mod.dependencies) {
						mod.dependencies.forEach(function(d) {
							//使用exports模块用作导出
							if(d == 'exports')
								deps.push(mod.exports);
							//使用module模块即为本身
							else if(d == 'module')
								deps.push(mod);
							else {
								var m = lib[d] || getMod(getAbsUrl(d, mod.uri));
								deps.push(m.exports);
							}
						});
					}
					else
						deps = [require, mod.exports, mod];
					mod.exports = isFunction(mod.factory) ? (mod.factory.apply(null, deps) || mod.exports) : (mod.factory || {});
					delete mod.factory;
				}
				mods.push(mod.exports);
			});
			cb.apply(null, mods);
		}, recursion = function() {
			var urls = idList.map(function(v) {
				return lib[v] ? v : getAbsUrl(v);
			}), deps = [];
			urls.forEach(function(url) {
				var mod = getMod(url),
					d = mod.dependencies;
				//尚未初始化的模块检测循环依赖和统计依赖
				if(!mod.exports) {
					checkCyclic(mod, {}, []);
					d && d.forEach(function(id) {
						deps.push(lib[id] ? id : getAbsUrl(id, mod.uri));
					});
				}
			});
			//如果有依赖，先加载依赖，否则直接回调
			if(deps.length)
				use(deps, wrap);
			else
				wrap();
		};
		if(isString(ids)) {
			if(lib[ids])
				recursion();
			else {
				var url = getAbsUrl(ids);
				$$.load(url, function() {
					//延迟模式下onload先于exec，进行2次幂延迟算法等待
					if(delay)
						delayQueue.push(cb);
					else
						cb();
					function cb() {
						//必须判断重复，防止2个use线程加载同一个script同时触发2次callback
						if(!script[url]) {
							if(defQueue.length) {
								script[url] = true;
								var mod = defQueue.shift();
								mod.id = mod.id || url;
								mod.uri = url;
								lib[url] = mod;
							}
							else {
								d2();
								return;
							}
						}
						recursion();
					}
					function d2() {
						if(defQueue.length) {
							delayCount = 0;
							cb();
							if(delayQueue.length)
								delayQueue.shift()();
							else
								delay = false;
						}
						else {
							delay = true;
							if(delayCount > 4)
								throw new Error('2^ delay mode is too long to wait');
							setTimeout(d2, Math.pow(2, delayCount++) << 4); //2 ^ n * 16的时间等比累加
						}
					}
				});
			}
		}
		else {
			var remote = ids.length;
			ids.forEach(function(id) {
				use(id, function() {
					if(--remote == 0)
						recursion();
				});
			});
		}
	}
	/**
	 * private 检测循环依赖
	 * @param {object} 模块
	 * @param {hashmap} 历史记录
	 * @param {array} 依赖顺序
	 */
	function checkCyclic(mod, history, list) {
		if(!mod)
			return;
		var id = mod.id;
		list.push(id);
		if(history[id])
			throw new Error('found cyclic dependencies:\n' + list.join('\n'));
		history[id] = true;
		mod.dependencies && mod.dependencies.forEach(function(dep) {
			checkCyclic(lib[dep] || lib[getAbsUrl(dep, mod.uri)], Object.create(history), Object.create(list));
		});
	}
	/**
	 * private 将id转换为url，如果模块url不存在，那么id本身就是url
	 * @param {string} 模块id
	 */
	function id2Url(id) {
		if(lib[id] && lib[id].uri)
			return lib[id].uri;
		return id;
	}
	/**
	 * private 根据传入的id或url获取模块
	 * @param {string} 模块id或url
	 */
	function getMod(s) {
		var mod = lib[s];
		if(!mod)
			throw new Error('module error: ' + s + ' is undefined');
		return mod;
	}
	/**
	 * 根据依赖script的url获取绝对路径
	 * @param {string} url 需要转换的url
	 * @param {string} 依赖的url
	 */
	function getAbsUrl(url, depend) {
		//自动末尾补加.js
		if(url.indexOf('.js') != url.length - 3)
			url += '.js';
		if(url.indexOf('http://') == 0)
			return url;
		depend = depend || baseUrl;
		var host = /(http:\/\/[^/]+)\/?(.*)/.exec(depend);
		depend = host[2].split('/');
		depend.unshift(host[1]);
		if(url.charAt(0) == '/')
			return depend[0] + url;
		else if(url.indexOf('../') == 0) {
			depend.pop();
			while(url.indexOf('../') == 0) {
				url = url.slice(3);
				depend.pop();
			}
			return depend.join('/') + '/' + url;
		}
		else if(url.indexOf('./') == 0)
			url = url.slice(2);
		depend.pop();
		return depend.join('/') + '/' + url;
	}

	//默认的require虚拟模块
	lib['require'] = {
		id: 'require',
		dependencies: null,
		exports: function(id) {
			if(lib[id])
				return lib[id].exports;
			var caller = arguments.callee.caller,
				ts = genFacKey(caller),
				mod;
			fac[ts] && fac[ts].forEach(function(o) {
				if(caller == o.f)
					mod = o.r;
			});
			return getMod(getAbsUrl(id, mod.uri)).exports;
		},
		uri: getAbsUrl('/require', baseUrl)
	};
	require = lib['require'].exports;

	$$.use = function(ids, cb) {
		use(ids, cb);
	};
	$$.modMap = function(id) {
		return id ? lib[id] : lib;
	};
	$$.base = function(url) {
		if(url) {
			baseUrl = url;
			lib['require'].uri = getAbsUrl('/require', baseUrl);
		}
		return baseUrl;
	};

})();