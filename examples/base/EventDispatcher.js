/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:        EventDispatcher.js
 * desc:        事件派发器
 * author:    yuanhongliang
 * date:        $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */

define(['base/Object'], function(Object){
/**
 * 事件派发器，需要实现事件的类从此类继承
 * @constructor
 * @extends {Object}
 */
function EventDispatcher() {
    Object.call(this);

    this._listeners = [];
};
baidu.inherits(EventDispatcher, Object);


/**
 * 添加监听器
 * @param {string} eventType 事件类型.
 * @param {Function} listener 监听器.
 */
EventDispatcher.prototype.addListener = function(eventType, listener) {
    if (!this._listeners[eventType]) {
        this._listeners[eventType] = [];
    }
    this._listeners[eventType].push(listener);
};


/**
 * 移除监听器
 *
 * @param {string} eventType 事件类型.
 * @param {Function} listener 监听器.
 */
EventDispatcher.prototype.removeListener = function(eventType, listener) {
    if (!this._listeners[eventType]) {
        return;
    }
    for (var i = this._listeners[eventType].length - 1; i >= 0; i--) {
        if (this._listeners[eventType][i] === listener) {
            //this._listeners[eventType].splice(i, 1);
            //将被删除的回调置空代替删除，删除会引起_listeners[eventType]长度的变化，在trigger的时候执行remove可能会导致问题
            this._listeners[eventType][i] = null;
            break;
        }
    }
};


/**
 * 触发事件
 *
 * @param {string} eventType 事件类型.
 * @param {...*} var_args 自定义参数.
 * @return {boolean} 返回值.
 */
EventDispatcher.prototype.trigger = function(eventType, var_args) {
    if (!this._listeners[eventType]) {
        return true;
    }
    var i, args = Array.prototype.slice.call(arguments, 1), result = true;
    for (i = 0; i < this._listeners[eventType].length; i++) {
        var fn = this._listeners[eventType][i];
        if(fn){
            if (false === fn.apply(this, args)) {
                result = false;
            }
        }
    }
    return result;
};

EventDispatcher._registry = [];


/**
 * 注册全局事件监听器
 *
 * @param {string} eventType 事件类型.
 * @param {Function} listener 监听器.
 */
EventDispatcher.prototype.registerListener = function(eventType, listener) {
    var registry = EventDispatcher._registry;
    registry.push({
        'eventType' : eventType,
        'subscriber' : this,
        'listener' : listener
    });
};

/**
 * 注销全局事件监听器
 *
 * @param {string} eventType 事件类型.
 * @param {Function} listener 监听器.
 */
EventDispatcher.prototype.unregisterListener = function(eventType, listener) {
    var registry = EventDispatcher._registry;
    for (var i = registry.length - 1; i >= 0; i--) {
        var item = registry[i];
        if (item['subscriber'] === this &&
            (!eventType || eventType && item['eventType'] === eventType) &&
            (!listener || listener && item['listener'] === listener)) {
            registry.splice(i, 1);
        }
    }
};


/**
 * 向已注册的全局监听器发布事件
 *
 * @param {string} eventType 事件类型.
 * @param {...*} var_args 自定义参数.
 * @return {boolean} 返回值.
 */
EventDispatcher.prototype.publish = function(eventType, var_args) {
    var registry = EventDispatcher._registry,
        i, args = Array.prototype.slice.call(arguments, 1), result = true, item;
    for (i = 0; i < registry.length; i++) {
        if (registry[i]['eventType'] === eventType &&
            false === registry[i]['listener'].apply(registry[i]['subscriber'], args)) {
            result = false;
        }
    }
    return result;
};

return EventDispatcher;

});
