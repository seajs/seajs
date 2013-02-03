/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: Control.js 4576 2011-03-25 11:31:51Z liyubei $
 *
 **************************************************************************/



/**
 * ui/Control.js ~ 2011/02/16 18:57:04
 * @author yuanhongliang
 * @version $Revision: 4576 $
 * @description
 * ui控件的基类
 **/
define(['base/EventDispatcher', 'er/template'],
function(EventDispatcher, template){
/**
 * ui的生命周期定义
 * @enum {number}
 */
var lifeCycle = {
    CONSTRUCTED: 0,
    INITIALIZED: 1,
    MODEL_BOUND: 2,
    RENDERED: 3,
    EVENT_BOUND: 4,
    DISPOSED: 5
};

/**
 * @constructor
 * FIXME 最好把基类更新为baidu.lang.Class
 * @param {Object} options 控件初始化参数.
 * @extends {EventDispatcher}
 * @export
 */
function Control(options) {
    EventDispatcher.call(this);

    /**
     * 使用的模板
     * @type {?string}
     */
    this.view;

    /**
     * 需要渲染的节点
     * @type {?Element}
     */
    this.main = null;

    /**
     * BaseModel
     * @type {?Object|BaseModel}
     */
    this.model = null;

    /**
     * 子控件
     * @private
     * @type {?Array.<Control>}
     */
    this.children = null;

    /**
     * 是否响应鼠标的状态变化，例如hover, press等等
     * @type {boolean}
     */
    this.autoState = false;//TBD:默认设置成false，防止在IE6、IE7下触发reflow

    baidu.object.extend(this, options);

    /**
     * 控件的生命周期.
     * @type {number}
     * @private
     */
    this.lifePhase = lifeCycle.CONSTRUCTED;

    /**
     * 样式前缀，用于生成class
     * @type {string}
     * @private
     */
    this.prefix;

    /**
     * 控件的类型，用来生成class的时候用到
     * @type {string}
     */
    this.type;

    /**
     * 控件的皮肤
     * @type {string}
     */
    this.skin;

    /**
     * 控件的ID，逻辑ID，并不是真正的DOM ID
     * @type {string}
     */
    this.id;

    /**
     * DOM节点的ID，一般由程序自动生成
     * @private
     * @type {string}
     */
    this.domId;

    /**
     * 控件的状态，例如readonly, disabled之类的.
     * @private
     * @type {Object}
     */
    this.state;
};
baidu.inherits(Control, EventDispatcher);


/**
 * 调用子控件的方法
 *
 * @private
 * @param {string} method 方法名.
 * @param {...*} var_args 方法参数.
 */
Control.prototype._callChildren = function(method, var_args) {
    if (!this.children) {
        return;
    }

    var args = [], i, child;
    if (arguments.length > 1) {
        for (i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
    }

    for (i = 0; i < this.children.length; i++) {
        child = this.children[i];
        if (child[method]) {
            child[method].apply(child, args);
        }
    }
};

/**
 * 初始化控件。对子控件的实例化处理可以放在这里。
 * @protected
 */
Control.prototype.init = function() {
    if (this.view) {
        this.instChildrenFromTpl();
    }

    this._callChildren('init');

    this.lifePhase = lifeCycle.INITIALIZED;
};

/**
 * 绑定数据模型。调用后模板上的绑定字段会被设置响应的值
 *
 * @protected
 * @param {(Object|BaseModel)=} opt_model 绑定的数据模型，可选。.
 */
Control.prototype.bindModel = function(opt_model) {
    if (opt_model) {
        this.model = opt_model;
    }

    if (!this.model) {
        return;
    }

    var me = this, key, value;
    if (this.refer) {
        baidu.object.each(this.refer, function(modelKey, key) {
            value = me.model[modelKey];
            if (typeof value !== 'undefined') { // 模型上未定义的不覆盖原值
                me[key] = value;
            }
        });
    }

    this._callChildren('bindModel', this.model);

    this.lifePhase = lifeCycle.MODEL_BOUND;
};

/**
 * 渲染控件
 *
 * @protected
 * @param {Element=} opt_main 控件挂载到的dom。为了原控件接口兼容，一般不需要设置。.
 */
Control.prototype.render = function(opt_main) {
    if (opt_main) {
        this.main = opt_main;
    }

    if (!this.main) {
        return;
    }

    if (this.domId) { // Page没有domId
        this.main.id = this.domId;
        this.main.removeAttribute('ui');
        this.main.setAttribute('control', this.id);
        baidu.addClass(this.main, this.getClass());
    }
    if (this.autoState) {
        this.initStateChanger();
    }

    this._callChildren('render');

    this.lifePhase = lifeCycle.RENDERED;
};

/**
 * 绑定内部控件或dom元素的事件处理
 */
Control.prototype.bindEvent = function() {
    this._callChildren('bindEvent');

    this.lifePhase = lifeCycle.EVENT_BOUND;
};

/**
 * 销毁控件
 */
Control.prototype.dispose = function() {
    // FIXME 如何保证每个控件都有dispose方法呢？没有的时候
    // 给出warning或者error信息
    this._callChildren('dispose');

    if (this.parent) {
        this.parent = null;
    }

    if (this.children) {
        for (var i = this.children.length - 1; i >= 0; i--) {
            this.children.splice(i, 1);
        }
        this.children = null;
    }

    if (this.main) {
        // 有的控件没有this.main，比如ui.FormTab
        if (this.main.childNodes.length) {
            this.main.innerHTML = '';
        }

        this.main.onmouseover = null;
        this.main.onmouseout = null;
        this.main.onmousedown = null;
        this.main.onmouseup = null;
    }

    this.unregisterListener();
    this.lifePhase = lifeCycle.DISPOSED;
};

/**
 * 重新绑定数据模型。如果是渲染前需要重新绑定，应使用bindModel方法。
 *
 * @param {Object|BaseModel} model 重新绑定的数据模型.
 */
Control.prototype.rebindModel = function(model) {
    if (this.lifePhase >= lifeCycle.DISPOSED) {
        return;
    }
    var orgLifePhase = this.lifePhase;
    this.bindModel(model);
    if (orgLifePhase >= lifeCycle.RENDERED) {
        this.render();
        // XXX：如果已绑定事件，有些控件可能需要重新绑定事件，而有些可能不需要，所以绑定事件自行处理。
    }
    if (this.lifePhase < orgLifePhase) {
        this.lifePhase = orgLifePhase;
    }
};

/**
 * 将子控件添加到父控件中
 * @param {Control} control 子控件.
 */
Control.prototype.addChild = function(control) {
    if (this.lifePhase >= lifeCycle.DISPOSED) {
        control.dispose();
        return;
    }

    if (!this.children) {
        this.children = [];
    }

    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].id === control.id) {
            throw 'A control with the same id [' + control.id + '] already exists';
        }
    }

    // Page没有domId，但如有id(frame)也可作为前缀
    var prefix = this.domId || this.id;
    control.domId = prefix ? (prefix + '_' + control.id) : control.id;
    this.children.push(control);
    control.parent = this;

    // 将子控件的生命状态和父控件同步
    if (this.lifePhase >= lifeCycle.INITIALIZED) {
        control.init();
        if (this.lifePhase >= lifeCycle.MODEL_BOUND) {
            control.bindModel(control.model || this.model);
            if (this.lifePhase >= lifeCycle.RENDERED) {
                control.render();
                if (this.lifePhase >= lifeCycle.EVENT_BOUND) {
                    control.bindEvent();
                }
            }
        }
    }
};

/**
 * 从父控件中移除子控件
 *
 * @param {Control} control 子控件.
 * @param {boolean=} opt_keepLiving 是否保持控件的生命周期，否则销毁.
 */
Control.prototype.removeChild = function(control, opt_keepLiving) {
    if (!this.children) {
        return;
    }

    var keepLiving = opt_keepLiving || false;

    for (var i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i] === control) {
            if (keepLiving) {
                control.parent = null;
                if (control.main.childNodes.length) {
                    control.main.innerHTML = '';
                }
            } else {
                control.dispose();
            }
            this.children.splice(i, 1);
            break;
        }
    }
};

/**
 * 根据id获取子控件。只查找直接子控件，不递归
 *
 * @param {string} id 子控件id.
 * @return {?Control}
 */
Control.prototype.getChild = function(id) {
    if (!this.children) {
        return null;
    }

    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].id === id) {
            return this.children[i];
        }
    }
    return null;
};

/**
 * @param {number} index child的索引值.
 * @return {?Control}
 */
Control.prototype.getChildAt = function(index) {
    if (!this.children) {
        return null;
    }

    return this.children[index] || null;
};

/**
 * getChild的快捷方式
 *
 * @param {string} id 子控件id.
 * @return {?Control}
 */
Control.prototype.c = function(id) {
    return this.getChild(id);
};

/**
 * 按照广度优先根据id寻找子孙控件
 * @param {string} id 控件id.
 * @param {boolean=} opt_findAll 是否找出所有该id的控件.
 * @return {?Control|Array.<Control>}
 */
Control.prototype.findDescendant = function(id, opt_findAll) {
    var queue = [this],
        control,
        result = opt_findAll ? [] : null,
        i;
    while (queue.length) {
        control = queue.shift();
        if (control.children) {
            baidu.each(control.children, function(child) {
                if (child.id === id) {
                    if (opt_findAll) {
                        result.push(child);
                    } else {
                        result = child;
                        return false;
                    }
                }
                queue.push(child);
            });
        }
    }
    return result;
};

/**
 * 清除所有子控件
 */
Control.prototype.clearChildren = function() {
    if (!this.children) {
        return;
    }

    for (var i = this.children.length - 1; i >= 0; i--) {
        this.children[i].dispose();
        this.children.splice(i, 1);
    }
};

/**
 * 根据control.main中的模板内容创建子控件树。
 */
Control.prototype.instChildrenFromMain = function() {
    if (!this.main) {
        return;
    }
    require('ui/util').buildControlTree(this.main, this);
};

/**
 * 根据模板创建子控件树
 */
Control.prototype.instChildrenFromTpl = function() {
    if (!this.main || !this.view) {
        return;
    }

    var html = template.getMerged(this.view);
    this.main.innerHTML = html;
    require('ui/util').buildControlTree(this.main, this);
};

/**
 * 构造渲染容器，并作为最后一个子节点挂载到父dom节点中
 * @protected
 * @param {Element} wrap 父dom节点.
 */
Control.prototype.appendTo = function(wrap) {
    var main = document.createElement('div');
    wrap.appendChild(main);
    this.main = main;
};

/**
 * 构造渲染容器，并作为第一个子节点挂载到父dom节点中
 *
 * @param {Element} wrap 父dom节点.
 */
Control.prototype.prependTo = function(wrap) {
    var main = document.createElement('div');
    wrap.insertBefore(main, wrap.firstChild);
    this.main = main;
};

/**
 * 显示控件
 */
Control.prototype.show = function() {
    if (this.main) {
        baidu.show(this.main);
    }
};

/**
 * 隐藏控件
 */
Control.prototype.hide = function() {
    if (this.main) {
        baidu.hide(this.main);
    }
};

/**
 * 判断控件是否隐藏
 * @return {boolean} true隐藏，false没有隐藏.
 */
Control.prototype.isHidden = function() {
    return this.main.style.display === 'none';
};

/**
 * 显示/隐藏切换
 */
Control.prototype.toggle = function() {
    if (this.isHidden()) {
        this.show();
    } else {
        this.hide();
    }
};

/**
 * 启用控件
 */
Control.prototype.enable = function() {
    this.removeState('disabled');
};

/**
 * 启用所有子控件
 */
Control.prototype.enableChildren = function() {
    this._callChildren('enable');
};

/**
 * 禁用控件
 */
Control.prototype.disable = function() {
    this.setState('disabled');
};

/**
 * 禁用所有子控件
 */
Control.prototype.disableChildren = function() {
    this._callChildren('disable');
};

/**
 * 判断控件是否禁用
 * @return {boolean} true禁用状态,false非禁用状态.
 */
Control.prototype.isDisabled = function() {
    return this.getState('disabled');
};

/**
 * 获取dom子部件的css class
 *
 * @protected
 * @param {string=} opt_key 子控件的样式名称.
 * @return {string}
 */
Control.prototype.getClass = function(opt_key) {
    var me = this;
    if (!me.type) {
        return '';
    }

    var type = me.type.toLowerCase(),
        className = (me.prefix || 'ui-') + type.replace('.', '-'),
        skinName = 'skin-' + type + '-' + me.skin;

    if (opt_key) {
        className += '-' + opt_key;
        skinName += '-' + opt_key;
    }

    if (me.skin) {
        className += ' ' + skinName;
    }

    return className;
};

/**
 * @param {string} skin 添加的皮肤的名称.
 */
Control.prototype.addSkin = function(skin) {
  baidu.addClass(this.getRoot(), 'skin-' + skin);
};

/**
 * @param {string} skin 需要删除的皮肤名称.
 */
Control.prototype.removeSkin = function(skin) {
  baidu.removeClass(this.getRoot(), 'skin-' + skin);
};

/**
 * 获取dom子部件的id
 *
 * @protected
 * @param {string=} opt_key 后缀.
 * @return {string}
 */
Control.prototype.getId = function(opt_key) {
    var idPrefix = this.domId || '';
    if (opt_key) {
        return idPrefix + opt_key;
    }
    return idPrefix;
};

/**
 * 获取控件对象的全局引用字符串
 * TODO 解放ui.util.get
 * @deprecated
 * @protected
 * @return {string}
 */
Control.prototype.getStrRef = function() {
    throw new Error("Invalid call getStrRef");
};

/**
 * 获取控件对象方法的全局引用字符串
 * @deprecated
 * @protected
 * @param {string} fn 调用的方法名.
 * @param {...*} var_args 调用的参数.
 * @return {string}
 */
Control.prototype.getStrCall = function(fn, var_args) {
    var argLen = arguments.length,
        params = [],
        i, arg;
    if (argLen > 1) {
        for (i = 1; i < argLen; i++) {
            arg = arguments[i];
            if (typeof arg === 'string') {
                arg = "'" + arg + "'";
            }
            params.push(arg);
        }
    }

    return this.getStrRef() +
           '.' + fn + '(' +
           params.join(',') + ');';
};

/**
 * 初始化状态事件
 *
 * @protected
 * @desc
 *      默认为控件的主dom元素挂载4个mouse事件
 *      实现hover/press状态切换的样式设置.
 */
Control.prototype.initStateChanger = function() {
    var me = this,
        main = me.main;

    me.state = {};
    if (main) {
        main.onmouseover = baidu.fn.bind(me.mainOverHandler, me);
        main.onmouseout = baidu.fn.bind(me.mainOutHandler, me);
        main.onmousedown = baidu.fn.bind(me.mainDownHandler, me);
        main.onmouseup = baidu.fn.bind(me.mainUpHandler, me);
    }
};

/**
 * 获取主元素over的鼠标事件handler
 *
 * @protected
 */
Control.prototype.mainOverHandler = function() {
    var me = this;
    if (!me.state['disabled'] && !me.state['readonly']) {
        me.setState('hover');
    }
};

/**
 * 获取主元素out的鼠标事件handler
 *
 * @protected
 */
Control.prototype.mainOutHandler = function() {
    var me = this;
    if (!me.state['disabled'] && !me.state['readonly']) {
        me.removeState('hover');
        me.removeState('press');
    }
};

/**
 * 获取主元素down的鼠标事件handler
 *
 * @protected
 */
Control.prototype.mainDownHandler = function() {
    var me = this;
    if (!me.state['disabled']) {
        me.setState('press');
    }
};

/**
 * 获取主元素up的鼠标事件handler
 *
 * @protected
 */
Control.prototype.mainUpHandler = function() {
    var me = this;
    if (!me.state['disabled']) {
        me.removeState('press');
    }
};

/**
 * 设置控件的当前状态
 *
 * @protected
 * @param {string} state 要设置的状态.
 */
Control.prototype.setState = function(state) {
    if (!this.state) {
        this.state = {};
    }

    this.state[state] = 1;
    baidu.addClass(this.main, this.getClass(state));
};

/**
  * 移除控件的当前状态
  *
  * @protected
  * @param {string} state 要移除的状态.
  */
Control.prototype.removeState = function(state) {
    if (!this.state) {
        this.state = {};
    }

    this.state[state] = null;
    baidu.removeClass(this.main, this.getClass(state));
};

/**
 * 获取控件状态
 *
 * @protected
 * @param {string} state 要获取的状态.
 * @return {boolean}
 */
Control.prototype.getState = function(state) {
    if (!this.state) {
        this.state = {};
    }

    return !!this.state[state];
};

/**
 * 获取顶层Page控件实例
 * @return {?ui.Page} Page控件.
 */
Control.prototype.getPage = function() {
    var ctrl = this;
    while (ctrl.parent) {
        ctrl = ctrl.parent;
    }
    return ctrl;
};

/**
 * 获取当前控件的根节点.
 * @return {?Element}
 */
Control.prototype.getRoot = function() {
  return this.main;
};

/**
 * 初始化单一参数
 *
 * @protected
 * @param {string} name 参数名称.
 * @param {*} opt_defaultValue 默认值.
 * @param {string} opt_configName 对应的控件配置名.
 */
Control.prototype.__initOption = function(name, opt_defaultValue, opt_configName) {
    if (!baidu.lang.hasValue(this[name])) {
        if ('string' == typeof opt_configName) {
            this[name] = this.constructor[opt_configName];
        }

        if (!baidu.lang.hasValue(this[name]) &&
            baidu.lang.hasValue(opt_defaultValue)) {
            this[name] = opt_defaultValue;
        }
    }
};

/**
 * 初始化配置参数.
 * 从构造函数的DEFAULT_OPTIONS属性中读取默认的配置，赋值给每个实例.
 */
Control.prototype.initOptions = function() {
    var ctor = this.constructor;
    if (ctor['DEFAULT_OPTIONS']) {
        var cfg = ctor['DEFAULT_OPTIONS'];
        for (var p in cfg) {
            if (cfg.hasOwnProperty(p) && typeof this[p] == 'undefined') {
                this[p] = cfg[p];
            }
        }
    }
};

/**
 * 获取控件主区域的dom元素
 *
 * @return {?Element}
 */
Control.prototype.getMain = function() {
    return this.main || null;
};

return Control;
});
