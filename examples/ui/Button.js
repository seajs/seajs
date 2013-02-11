/*
 * coup-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    ui/Button.js
 * desc:    按钮控件
 * author:  zhaolei,erik
 * date:    $Date: 2011-03-07 00:32:09 +0800 (星期一, 07 三月 2011) $
 */
define("ui/Button", function(require, exports, module){
require('./css/ui-button.css');
var Control = require('ui/Control');

/**
 * 按钮控件
 *
 * 支持Themes：不同样式、尺寸的按钮
 * 按钮状态：normal, over, down, active, disable
 * @constructor
 * @extends {Control}
 * @param {Object} options 控件初始化参数.
 * @exports
 */
function Button(options) {
  Control.call(this, options);
  // FIXME 避免被重写掉，最好修改成uitype之类的东东
  /**
   * 控件的类型
   * @type {string}
   */
  this.type = 'button';

  this.autoState = true;

  /**
   * 文本上的内容
   * @type {string}
   */
  this.content;
};
baidu.inherits(Button, Control);

/**
 * 生成控件的模版
 * @type {string}
 */
Button.prototype.tplButton = [
  '<div class="ui-button-bg-left"></div>',
  '<div id="{2}" class="{1}"><nobr>{0}</nobr></div>',
  '<div class="ui-button-bg-right"></div>'
].join('');


/**
 * 默认的onclick事件执行函数
 * 不做任何事，容错
 * @type {Function}
 */
Button.prototype.onclick;


/**
 * @private
 * @return {string} 控件的主题内容.
 */
Button.prototype.getMainHtml = function() {
  var me = this;

  return baidu.format(
      me.tplButton,
      me.content || '',
      me.getClass('label'),
      me.getId('label')
  );
};


/**
 * 设置为可用
 *
 * @protected
 */
Button.prototype.enable = function() {
  Button.superClass.enable.call(this);
  this.removeState('hover');
};


/**
 * 设置是否为Active状态
 *
 * @protected
 * @param {boolean} stat 状态.
 */
Button.prototype.active = function(stat) {
  var state = 'active';

  if (stat) {
    this.setState(state);
  } else {
    this.removeState(state);
  }
};


/** @inheritDoc */
Button.prototype.render = function(opt_main) {
  Button.superClass.render.call(this, opt_main);

  var me = this,
      main = me.main;

  if (main.tagName != 'DIV') {
    return;
  }

  var innerDiv = main.firstChild;
  if (!me.content && innerDiv && innerDiv.tagName != 'DIV') {
    me.content = main.innerHTML;
  }

  main.innerHTML = me.getMainHtml();

  // 设定最小宽度为60px
  if (main.offsetWidth < 60 && main.offsetWidth > 0) {
    baidu.dom.addClass(me.getId('label'), me.getClass('label-minwidth'));
  }

  // 初始化状态事件
  main.onclick = baidu.fn.bind(this.clickHandler, this);
};


/**
 * @protected
 */
Button.prototype.clickHandler = function() {
  if (!this.isDisabled()) {
    if (baidu.lang.isFunction(this.onclick)) {
      this.onclick();
    }
  }
};


/**
 * 设置按钮上面的文字内容
 * @param {string} label 需要显示的文字.
 */
Button.prototype.setLabel = function(label) {
  baidu.G(this.getId('label')).innerHTML = label;
};


/**
 * 获取按钮上面的文字
 * @return {string} 文本内容.
 */
Button.prototype.getLabel = function() {
  return baidu.G(this.getId('label')).innerHTML;
};


/** @inheritDoc */
Button.prototype.dispose = function() {
  this.main.onclick = null;
  this.onclick = null;
  Button.superClass.dispose.call(this);
};

return Button;
});
