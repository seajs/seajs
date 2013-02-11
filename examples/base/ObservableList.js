/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    base/ObservableList.js
 * desc:    内部元素数量发生变化会通知所有监听器的Array
 * author:  yuanhongliang
 * date:    $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */
define(['base/EventDispatcher'], function(EventDispatcher){
/**
 * ObservableList的action枚举
 * @enum {number}
 */
var listAction = {
    MIXED: 0,
    ADD: 1,
    REMOVE: 2,
    REPALCE: 3,
    MOVE: 4,
    RESET: 5
};

/**
 * 内部元素数量发生变化会通知所有监听器的List
 * @constructor
 * @extends {EventDispatcher}
 * @param {Array} array 初始数组.
 */
function ObservableList(array) {
    EventDispatcher.call(this);

    if (array) {
        for (var i = 0; i < array.length; i++) {
            this[i] = array[i];
        }
    }
    this.length = array ? array.length : 0;
};
ObservableList.prototype = (function() {
    /**
     * @param {listAction} action 类型.
     * @param {*} newItems 新的值.
     * @param {*} olditems 老的值.
     */
    function triggerListeners(action, newItems, olditems) {
        this.trigger(ObservableList.ListChangedEvent,
            action, newItems, olditems);
    }

    var proto = {

        /**
         * 添加属性监听器
         *
         * @param {Function} listener 监听器，参数表为(action, newItems, oldItems)。.
         */
        addListChangedListener: function(listener) {
            this.addListener(ObservableList.ListChangedEvent, listener);
        },

        /**
         * 移除属性监听器
         *
         * @param {Function} listener 监听器.
         */
        removeListChangedListener: function(listener) {
            this.removeListener(ObservableList.ListChangedEvent, listener);
        },

        /**
         * 手动触发ListChanged事件。往往是在先调base的方法suppress后手动调用该方法。
         */
        triggerListChanged: function() {
            triggerListeners.call(this, listAction.MIXED, undefined, undefined);
        },

        /**
         * @see Array.sort
         */
        sort: function() {
            return Array.prototype.sort.apply(this, arguments);
        },

        /**
         * @see Array.push
         */
        push: function() {
            var ret = Array.prototype.push.apply(this, arguments);
            triggerListeners.call(this, listAction.ADD, arguments, []);
            return ret;
        },

        /**
         * @see Array.pop
         */
        pop: function() {
            var ret = Array.prototype.pop.apply(this, arguments);
            triggerListeners.call(this, listAction.REMOVE, [], [ret]);
            return ret;
        },

        /**
         * @see Array.splice
         */
        splice: function() {
            var ret = Array.prototype.splice.apply(this, arguments);
            if (arguments.length > 2) {
                var newItems = [];
                for (var i = 2; i < arguments.length; i++) {
                    newItems.push(arguments[i]);
                }
                if (arguments[1] === 0) {
                    triggerListeners.call(this, listAction.ADD, newItems, []);
                } else {
                    triggerListeners.call(this, listAction.REPALCE,
                        newItems, ret);
                }
            } else {
                triggerListeners.call(this, listAction.REMOVE, [], ret);
            }
            return ret;
        },

        /**
         * 清除所有元素
         */
        clear: function() {
            var ret = Array.prototype.splice.call(this, 0, this.length);
            triggerListeners.call(this, listAction.RESET, [], ret);
        }
    };

    // 以"_"开头方法不触发Change事件，如_push, _pop等。
    var methods = ['push', 'pop', 'splice'];
    for (var i in methods) {
        var method = methods[i];
        proto['_' + method] = (function(p) {
            return function() {
                Array.prototype[p].apply(this, arguments);
            };
        })(method);
    }

    return proto;
})();

/**
 * @type {string}
 * @const
 */
ObservableList.ListChangedEvent = 'LIST_CHANGED';
baidu.inherits(ObservableList, EventDispatcher);

return ObservableList;
});
