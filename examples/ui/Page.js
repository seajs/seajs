/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: Page.js 2737 2011-03-08 07:33:37Z yuanhongliang $
 *
 **************************************************************************/



/**
 * ui/Page.js ~ 2011/02/16 18:57:04
 * @author yuanhongliang
 * @version $Revision: 2737 $
 * @description
 * ui控件的基类
 **/
define(['ui/Control'], function(Control){
/**
 * Page
 * @constructor
 * @extends {Control}
 * @param {Object} options 控件初始化参数.
 * @export
 */
function Page(options) {
  Control.call(this, options);
};
baidu.inherits(Page, Control);

/**
 * @inheritDoc
 */
Page.prototype.dispose = function() {
    Page.superClass.dispose.call(this);
    this.ondispose();
};

/**
 * 在销毁时的接口.
 * @type {Function}
 */
Page.prototype.ondispose = baidu.fn.blank;

return Page;
});
