/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: permission.js 5156 2011-04-27 04:15:29Z liyubei $
 *
 **************************************************************************/



/**
 * permission.js ~ 2011/03/25 00:25:55
 * @author leeight(liyubei@baidu.com)
 * @version $Revision: 5156 $
 * @description
 * er.permission
 **/
define(function(require, exports, module){
/**
 * 权限控制器
 */
var permission = {
  permissible: {}
};

/**
 * 初始化权限控制器
 * @param {Object} data 权限初始化数据.
 */
permission.init = function(data) {
  var key, item;
  for (key in data) {
    item = data[key];
    if ('object' == typeof item) {
      this.init(item);
    } else if (item) {
      this.permissible[key] = item;
    }
  }
};

/**
 * 判断是否拥有权限
 *
 * @param {string} name 权限名.
 * @return {boolean} true有权限，false没有权限.
 */
permission.isAllow = function(name) {
  var items = [name],
    isallow = false;
  if (name.indexOf('|') != -1) {
    items = name.split('|');
  }
  for (var i = 0; i < items.length; i++) {
    isallow = isallow || !!this.permissible[items[i]];
  }
  return isallow;
};

exports = permission;
















});
/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
