/***************************************************************************
 * 
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * hello_button.js ~ 2013/01/27 22:36:29
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
seajs.use(['ui/Button'], function(Button){
  var btn = new Button({domId: 'btn'});
  btn.render(baidu.g("btn"));
  btn.onclick = function() {
    alert('hello_button');
  }
});




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
