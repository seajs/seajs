/***************************************************************************
 * 
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * plugins/plugin-tpl.js ~ 2013/02/01 10:37:36
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
define("seajs/plugin-tpl", ["./plugin-base"], function(require){
  var plugin = require('./plugin-base');
  var util = plugin.util;

  plugin.add({
    name: 'tpl',
    ext: ['.tpl', '.html'],
    fetch: function(url, callback) {
      util.xhr(url, function(data){
        console.log(data);
        callback();
      });
    }
  });
});


seajs.use("seajs/plugin-tpl");
















/* vim: set ts=4 sw=4 sts=4 tw=100: */
