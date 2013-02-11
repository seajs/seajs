/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: util.js 4610 2011-03-25 16:06:25Z liyubei $
 *
 **************************************************************************/



/**
 * src/ui/util.js ~ 2011/03/21 16:34:00
 * @author leeight(liyubei@baidu.com)
 * @version $Revision: 4610 $
 * @description
 **/
define(function(require, exports, module){
/**
 * @constructor
 */
var util = {
  /**
   * @type {?ui.Page}
   */
  pageMain: null,

  /**
   * @type {?ui.Page}
   */
  pagePopups: {},

  /**
   * @type {number}
   * @private
   */
  _uniqueId: 0
};

/**
 * 创建控件，保持接口兼容
 * @param {string} type UI控件的类型.
 * @param {Object|string} options UI控件的初始化参数.
 * @param {Element} main UI控件的根节点.
 * @deprecated
 * @return {ui.Control}
 */
util.create = function(type, options, main) {
  options.type = type;
  return this.createControl(options, main);
};

/**
 * 创建页面控件
 * @param {string} view 页面模板名称.
 * @param {Element} main 控件最终render到main内部.
 * @param {boolean} isPopup 是否嵌入popup中.
 * @return {ui.Page}
 */
util.createPage = function(view, main, isPopup) {
    var ctor = require('ui/Page'),
        page = new ctor({
        view: view,
        main: main,
        autoState: false
    });
    var me = this;
    if (isPopup) {
        var pageId = 'frame-' + this._uniqueId;
        page.id = pageId;
        page.ondispose = function() {
            delete me.pagePopups[pageId];
        };
        this.pagePopups[pageId] = page;
        this._uniqueId++;
    } else {
        this.pageMain = page;
    }
    return page;
};

/**
 * 根据ui属性字符串或ui属性对象创建一个控件。
 * @deprecated
 * @param {string|Object} attrs ui属性字符串或ui属性对象.
 * @param {Element} main 控件最终render到main内部.
 * @return {ui.Control}
 */
util.createControl = function(attrs, main) {
    var refer = {},
        key, id, attrValue;

    if (typeof attrs === 'string') {
        attrs = this.parseAttrStr(attrs);
    }

    // 创建控件
    id = attrs.id;
    if (!id) {
        throw 'UI Control must have an id';
    }

    // 解析引用属性
    baidu.object.each(attrs, function(value, key) {
        if (typeof value === 'string') {
            if (value.indexOf('@') === 0) {
                refer[key] = value.substr(1);
                delete attrs[key];
            } else if (value.indexOf('&') === 0) {
                attrs[key] = baidu.getObjectByName(value.substr(1));
            }
        }
    });

    attrs.refer = refer;
    if (main) {
        attrs.main = main;
    }

    var clazz = /** @type {Function} */ (require('ui/' + attrs.type));
    if (!clazz) {
        throw "Can't find constructor for [ui." + attrs.type + '] or [' + attrs.type + ']';
    }

    // 根据type生成css前缀
    attrs.prefix = attrs.type.replace(/(\.|^)[^.]+$/, '$1').replace(/\./g, '-').toLowerCase();

    // 在子控件构造函数内没有设置type的情况下，使用除去前缀后的部分作为type
    attrs.type = attrs.type.replace(/^.*\./, '');

    return new clazz(attrs);
};

/**
 * 构造控件树
 * @param {Element} domParent 包含html片段的dom父节点.
 * @param {ui.Control} ctrlParent 父控件，构造出的所有控件都是它的子孙.
 */
util.buildControlTree = function(domParent, ctrlParent) {
    if (!domParent || !domParent.childNodes ||
        !ctrlParent || !ctrlParent.addChild) {
        return;
    }

    var child, uiAttr, control;
    for (var i = 0; i < domParent.childNodes.length; i++) {
        child = domParent.childNodes[i];
        if (child.nodeType !== 1) {
            continue;
        }
        uiAttr = child.getAttribute('ui');
        if (uiAttr) {
            control = this.createControl(uiAttr, child);
            ctrlParent.addChild(control);
            // 递归构造控件树
            this.buildControlTree(child, control);
        } else {
            // 不是ui控件，继续往下查找
            this.buildControlTree(child, ctrlParent);
        }
    }
};

/**
 * 解析ui属性
 * @param {string} attrStr ui属性字符串.
 * @return {Object}
 */
util.parseAttrStr = function(attrStr) {
    var attrs = {},
        attrArr = attrStr.split(';'),
        attrArrLen = attrArr.length,
        attrItem, attrSegment,
        attr, attrValue;
    while (attrArrLen--) {
        // 判断属性是否为空
        attrItem = attrArr[attrArrLen];
        if (!attrItem) {
            continue;
        }

        // 获取属性
        attrSegment = attrItem.split(':');
        attr = attrSegment[0];
        attrValue = attrSegment[1];
        // 之前没有值，直接设值；否则将其转化成数组形式存放
        if (!attrs[attr]) {
            attrs[attr] = attrValue;
        } else {
            if (!baidu.lang.isArray(attrs[attr])) {
                attrs[attr] = [attrs[attr]];
            }
            attrs[attr].push(attrValue);
        }
    }
    return attrs;
};

/**
 * 获取控件对象
 *
 * @param {string} domId 控件的domId.
 * @param {ui.Page=} opt_page 包含该控件Page.
 * @return {?ui.Control}
 */
util.get = function(domId, opt_page) {
    var ids = domId.split('_'),
        popup = this.pagePopups[ids[0]],
        control = opt_page || popup || this.pageMain,
        i = control == this.pageMain ? 0 : 1;
    for (; i < ids.length; i++) {
        if (!control) {
            return null;
        }
        control = control.getChild(ids[i]);
    }
    return control;
};

/**
 * 析构函数
 */
util.dispose = function() {
    if (this.pageMain) {
        this.pageMain.dispose();
    }
};


/**
 * 寻找dom元素下的控件集合
 *
 * @param {HTMLElement} container 要查找的容器元素.
 * @return {Object}
 */
util.getControlsByContainer = function(container) {
    var els = container.getElementsByTagName('*'),
        len = els.length,
        controlId,
        domId,
        result = [];

    while (len--) {
        controlId = els[len].getAttribute('control');
        if (controlId) {
            domId = els[len].getAttribute('id');
            result.push(ui.util.get(domId));
        }
    }

    return result;
};

/**
 * 改变InputControl控件的disable状态
 *
 * @param {HTMLElement} container 容器元素.
 * @param {boolean} disabled disable状态.
 */
util.disableFormByContainer = function(container, disabled) {
    var controls = this.getControlsByContainer(container),
        key, control,
        ctor = require('ui/InputControl');

    for (var i = 0; i < controls.length; i++) {
        control = controls[i];
        if (control instanceof ctor) {
            if (disabled) {
                control.disable();
            } else {
                control.enable();
            }
        }
    }
};

/**
 * 为了
 *
 * @param {HTMLElement} ctrl 容器元素.
 * @param {HTMLElement} wrap disable状态.
 */
util.appendTo = function(ctrl, wrap) {
    var main = document.createElement('div');
    wrap.appendChild(main);
    ctrl.main = main;
};

baidu.on(window, 'unload', function() {
    util.dispose();
});


return util;















});
/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
