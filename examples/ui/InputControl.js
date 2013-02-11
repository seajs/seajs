/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: InputControl.js 4628 2011-03-26 13:58:44Z liyubei $
 *
 **************************************************************************/



/**
 * ui/InputControl.js ~ 2011/02/16 10:46:31
 * @author yuanhongliang(yuanhongliang@baidu.com), leeight(liyubei@baidu.com)
 * @version $Revision: 4628 $
 * @description
 *
 **/
define(['ui/Control'], function(Control){
/**
 * @constructor
 * @extends {Control}
 * @param {Object} options 控件的初始化参数.
 */
InputControl = function(options) {
  Control.call(this, options);

  /**
   * 验证规则，所有InputControl类型的控件都可以有这个属性.
   * @type {?string|Array.<string>}
   */
  this.rule;


  /**
   * 转换器，表单的值和提交时候参数的值进行双向转化的工具.
   * @private
   * @type {?base.IConverter}
   */
  this.converter;

  /**
   * FIXME 貌似只有order/list这个地方用到了
   * @type {string}
   * @private
   */
  this.paramValue;

  /**
   * 表单控件的名字.
   * @type {string}
   */
  this.formName;
};
baidu.inherits(InputControl, Control);


/** @inheritDoc */
InputControl.prototype.bindModel = function(model) {
  InputControl.superClass.bindModel.call(this, model);

  // FIXME 此时是不合适的，bindModel是在render之前调用的
  // 因为不能确定调用setValue的影响面，因为调用这个控件的
  // setValue的时候，控件的资源并没有真正的初始化完毕，
  // 例如ui.Calendar的这个问题。
  // if (typeof this.paramValue !== 'undefined') {
  //  this.setParamValue(this.paramValue);
  // }
};


/** @inheritDoc */
InputControl.prototype.render = function(opt_main) {
  InputControl.superClass.render.call(this, opt_main);

  this.formName = this.main.getAttribute('name');
  if (typeof this.paramValue !== 'undefined') {
    this.setParamValue(this.paramValue);
  }
};


/**
 * 获取控件的值
 * @param {boolean=} opt_raw 是否获取原始用户输入数据.
 * @return {string|Object} 控件的值.
 */
InputControl.prototype.getValue = function(opt_raw) {
  return this.value;
};


/**
 * 设置控件的值
 * @param {Object|string} value 控件的值.
 */
InputControl.prototype.setValue = function(value) {
  this.value = value;
};

/**
 * @param {base.IConverter} converter 转化器.
 */
InputControl.prototype.setConverter = function(converter) {
  this.converter = converter;
};

/**
 * 获取表单提交时，控件值的字符串参数表现形式
 * @return {string} encodeURIComponent编码之后的值.
 */
InputControl.prototype.getParamValue = function() {
  var value = this.getValue();
  if (this.converter) {
    value = this.converter.convert(value);
    return value;
  }
  return encodeURIComponent(/** @type {string} */(value));
};


/**
 * 表单回绑时，控件所绑定的参数值
 * @param {string} paramValue 参数值.
 */
InputControl.prototype.setParamValue = function(paramValue) {
  var value = paramValue;
  if (this.converter) {
    value = this.converter.convertBack(value);
  }
  this.setValue(value);
};


/**
 * 设置验证规则
 * 对于相同名称的验证规则，会被覆盖
 * @param {string} ruleName 验证规则的名称
 * @param {Array=} opt_ruleArgs 验证规则的参数
 */
InputControl.prototype.setRule = function(ruleName, opt_ruleArgs) {
  var ruleArgs = opt_ruleArgs || [],
      rule = [ruleName].concat(ruleArgs);
  if (!this.rule) {
    this.rule = [];
  }
  if (baidu.lang.isString(this.rule)){
    this.rule = [this.rule];
  }
  for(var i = 0; i < this.rule.length; i++){
    if(ruleName == getRuleName(this.rule[i])){
        this.rule[i] = rule;
        return;
    }
  }
  this.rule.push(rule);
  
  /**
   * 返回rule的名称
   * @param {string|Array} rule 验证规则
   * @return {string} 验证规则名称
   */
  function getRuleName(rule){
    return baidu.lang.isString(rule) ? rule.split(',')[0] : rule[0];
  }
};


/**
 * 验证控件的值
 * @return {boolean} true验证通过，false验证失败.
 */
InputControl.prototype.validate = function() {
  if (!this.rule) {
    return true;
  }

  return ui.util.validate(this, this.rule);
};


/**
 * 显示错误信息，常用于后端验证错误显示
 * @param {string} errorMessage 需要显示的错误信息.
 */
InputControl.prototype.showError = function(errorMessage) {
  this.errorMessage = errorMessage;
  ui.util.validate(this, 'backendError,this');
  this.errorMessage = null;
};

/**
 * FIXME 和全局的函数hideError有以来关系了...
 * 隐藏验证错误信息.
 */
InputControl.prototype.hideError = function() {
  ui.util.validate.hideError(this.main);
};

/**
 * 设置控件为readOnly
 * @param {*} readOnly 是否设置为只读.
 */
InputControl.prototype.setReadOnly = function(readOnly) {
  readOnly = !!readOnly;
  this.readOnly = readOnly;

  if (readOnly) {
    this.setState('readonly');
  } else {
    this.removeState('readonly');
  }
};


/**
 * 判断控件是否只读
 * @return {boolean} true只读状态,false不是.
 */
InputControl.prototype.isReadOnly = function() {
  return this.getState('readonly');
};

return InputControl;
});
