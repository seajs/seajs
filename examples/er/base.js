/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: base.js 5156 2011-04-27 04:15:29Z liyubei $
 *
 **************************************************************************/



/**
 * base.js ~ 2011/03/25 00:18:21
 * @author leeight(liyubei@baidu.com)
 * @version $Revision: 5156 $
 * @description
 * er.base
 **/
define(function(require, exports, module){
/**
 * 判断变量是否有值。null或undefined时返回false
 *
 * @param {*} variable 需要检测的变量.
 * @return {boolean} true/false.
 */
exports.hasValue = function(variable) {
  return !(variable === null || typeof variable == 'undefined');
};

/**
 * @param {*} source 需要判断的类型.
 * @return {boolean} true/false.
 */
exports.isFunction = function(source) {
  return 'function' == typeof source;
};

/**
 * @param {string} id 需要获取的元素id.
 * @return {Element} DOM节点.
 */
exports.g = function(id) {
  return document.getElementById(id);
};

/**
 * 获取一个随机的字符串.
 * @return {string} uuid.
 */
exports.uid = function() {
  return Math.floor(Math.random() * 2147483648).toString(36);
};

/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |window|.
 * @return {Object} The object or, if not found, null.
 */
exports.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || window;
  for (var part; part = parts.shift(); ) {
    if (cur[part] != null) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * 将源对象的所有属性拷贝到目标对象中
 *
 * @param {Object} target 目标对象.
 * @param {Object} source 源对象.
 * @return {Object} 目标对象.
 */
exports.extend = function(target, source) {
  for (var p in source) {
    if (source.hasOwnProperty(p)) {
      target[p] = source[p];
    }
  }
  return target;
};

/**
 * @type {number}
 */
exports.ie = 0;

/**
 * @type {number}
 */
exports.firefox = 0;

var match = null;
if (match = /msie (\d+\.\d)/i.exec(navigator.userAgent)) {
  exports.ie = parseFloat(match[1]);
} else if (match = /firefox\/(\d+\.\d)/i.exec(navigator.userAgent)) {
  exports.firefox = parseFloat(match[1]);
}














});
/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
