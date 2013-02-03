/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    PropertyChangeNotifier.js
 * desc:    属性变化会通知所有监听器的类
 * author:  yuanhongliang
 * date:    $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */
define(['base/EventDispatcher'], function(EventDispatcher){
/**
 * @constructor
 * @extends {EventDispatcher}
 */
function PropertyChangeNotifier() {
    EventDispatcher.call(this);

    this._settersInitialized = false;
};
PropertyChangeNotifier.prototype = (function() {
    /**
     * 所有set方法最终被代理到这个方法
     *
     * @private
     * @param {*} value 属性值.
     * @param {string} propertyName 属性名.
     */
    function baseSet(value, propertyName) {
        var oldValue = this[propertyName];
        if (oldValue === value) {
            return;
        }
        this[propertyName] = value;
        this.trigger(PropertyChangeNotifier.PropertyChangedEvent,
          propertyName, value, oldValue);
    }

    /**
     * 所有get方法最终被代理到这个方法
     *
     * @private
     * @param {string} propertyName 属性名.
     * @return {*} 属性值.
     */
    function baseGet(propertyName) {
        return this[propertyName];
    }

    /**
     * 生成属性方法。如属性名为abc，则生成的属性方法为setAbc。
     *
     * @private
     */
    function initSetters() {
        var me = this,
            propertyName,
            upperCase;

        for (propertyName in this) {
            if (typeof this[propertyName] !== 'function' &&
                propertyName.charAt(0) !== '_') {
                upperCase = propertyName.charAt(0).toUpperCase() +
                            propertyName.substring(1);
                this['set' + upperCase] = function(p) {
                    return function(value) {
                        baseSet.call(me, value, p);
                    };
                }(propertyName);
                this['get' + upperCase] = function(p) {
                    return function() {
                        return baseGet.call(me, p);
                    };
                }(propertyName);
            }
        }
    }

    /**
     * @lends PropertyChangeNotifier.prototype
     */
    return {
        /**
         * 设置新的值，如果两个值不同，就会触发PropertyChangedEvent.
         * @param {string} propertyName 需要设置的属性.
         * @param {*} value 属性的值.
         */
        set: function(propertyName, value) {
            baseSet.call(this, value, propertyName);
        },

        /**
         * @param {string} propertyName 属性名.
         * @return {*} 属性的值.
         */
        get: function(propertyName) {
            return baseGet.call(this, propertyName);
        },

        /**
         * 添加属性监听器。当属性值通过set方法发生变化时会触发监听器。
         * @param {function(string,*,*)} listener 监听器，
         * 参数表为(propertyName, newValue, oldValue)。.
         */
        addPropertyChangedListener: function(listener) {
            if (!this._settersInitialized) {
                initSetters.call(this);
                this._settersInitialized = true;
            }

            this.addListener(PropertyChangeNotifier.PropertyChangedEvent, listener);
        },

        /**
         * 移除属性监听器
         * @param {Function} listener 监听器.
         */
        removePropertyChangedListener: function(listener) {
            this.removeListener(PropertyChangeNotifier.PropertyChangedEvent, listener);
        },

        /**
         * 手动触发PropertyChanged事件。
         * @param {string} propertyName 属性名.
         */
        triggerPropertyChanged: function(propertyName) {
            this.trigger(PropertyChangeNotifier.PropertyChangedEvent,
              propertyName, this[propertyName], this[propertyName]);
        }
    };
})();

/**
 * @type {string}
 * @const
 */
PropertyChangeNotifier.PropertyChangedEvent = 'PROPERTY_CHANGED';
baidu.inherits(PropertyChangeNotifier, EventDispatcher);

return PropertyChangeNotifier;
});
