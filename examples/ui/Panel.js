/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: Panel.js 2737 2011-03-08 07:33:37Z yuanhongliang $
 *
 **************************************************************************/



/**
 * ui/Panel.js ~ 2011/02/16 18:57:04
 * @author yuanhongliang
 * @version $Revision: 2737 $
 * @description
 * ui控件的基类
 **/

define(['ui/Control'], function(Control){
/**
 * ui.Panel
 * @constructor
 * @extends {Control}
 * @param {Object} options 控件初始化参数.
 */
function Panel(options) {
    Control.call(this, options);
    this.type = 'panel';
};
baidu.inherits(Panel, Control);

/**
 * 设置innerHTML
 * @param content
 */
Panel.prototype.setContent = function(content) {
    this.main.innerHTML = content;
};

return Panel;
});
