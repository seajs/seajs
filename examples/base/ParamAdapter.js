/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * ParamAdapter.js ~ Mar 8, 2011 4:17:16 PM
 * @author yuanhongliang(yuanhongliang@baidu.com)
 * @version $Revision$
 * @description 参数适配器
 **/
define(['base/Object'], function(Object){
/**
 * 参数适配器接口，在请求参数与返回JSON的时候做参数数量适配.
 * XXX：因为前后端接口的形式(请求是扁平参数，返回是JSON对象)，两个方法不可能互为反向操作.
 * @interface
 */
function IParamAdapter() {
};
IParamAdapter.prototype = {

    /**
     * 处理参数，根据已有参数增删。
     * @param {string} param 参数字符串.
     * @return {string} 处理完的参数.
     */
    processParam: function(param) {
        return '';
    },

    /**
     * 处理JSON对象，根据已有字段增删。
     * @param {Object} obj JSON对象.
     */
    processObject: function(obj) {}
};

/**
 * 一转多的参数适配器
 * @constructor
 * @implements {IParamAdapter}
 * @param {string} delimiter 需要转换的参数的分隔符.
 * @param {string} fromParam 需要转换的参数名称.
 * @param {Array.<string>} toParams 转换后的参数.
 */
function OneToManyParamAdapter(delimiter, fromParam, toParams) {
    this.delimiter = delimiter;
    this.fromParam = fromParam;
    this.toParams = toParams;
};

/**
 * @inheritDoc
 */
OneToManyParamAdapter.prototype.processParam = function(param) {
    var regex = new RegExp(this.fromParam + '=(.+)', 'g'),
        params = param.split('&'),
        match, value, values, i;
    for (i = params.length - 1; i >= 0; i--) {
        match = regex.exec(params[i]);
        if (match && match.length === 2) {
            value = match[1];
            params.splice(i, 1);
            break;
        }
    }
    if (!value) {
        return param;
    }
    values = value.split(this.delimiter);
    if (values.length !== this.toParams.length) {
        throw 'Value count and param count dont match';
    }
    for (i = 0; i < values.length; i++) {
        params.push(this.toParams[i] + '=' + values[i]);
    }
    return params.join('&');
};

/**
 * @inheritDoc
 */
OneToManyParamAdapter.prototype.processObject = function(obj) {
    var newValue = [], value;
    for (var i = 0; i < this.toParams.length; i++) {
        value = obj[this.toParams[i]];
        if (typeof value !== 'undefined') {
            newValue.push(value);
            delete obj[this.toParams[i]];
        }
    }
    obj[this.fromParam] = newValue.join(this.delimiter);
};

/**
 * 将一个参数拆分成数组参数的参数适配器
 * @constructor
 * @implements {IParamAdapter}
 * @param {string} delimiter 需要转换的参数的分隔符.
 * @param {string} fromParam 需要转换的参数名称.
 */
function OneToArrayParamAdapter(delimiter, fromParam) {
    this.delimiter = delimiter;
    this.fromParam = fromParam;
};

/**
 * @inheritDoc
 */
OneToArrayParamAdapter.prototype.processParam = function(param) {
    var regex = new RegExp(this.fromParam + '=(.+)', 'g'),
        params = param.split('&'),
        match, value, values, i;
    for (i = params.length - 1; i >= 0; i--) {
        match = regex.exec(params[i]);
        if (match && match.length === 2) {
            value = match[1];
            params.splice(i, 1);
            break;
        }
    }
    // 如果没有value, 直接丢弃掉fromParam
    if (!value) {
        return params.join('&');
    }
    values = value.split(this.delimiter);
    for (i = 0; i < values.length; i++) {
        params.push(baidu.format('{0}[{1}]={2}',
            this.fromParam,
            i,
            values[i]
        ));
    }
    return params.join('&');
};

/**
 * @inheritDoc
 */
OneToArrayParamAdapter.prototype.processObject = function(obj) {
    var newValue = [],
        value,
        arr = obj[this.fromParam] || [];
    obj[this.fromParam] = arr.join(this.delimiter);
};


return {
    IParamAdapter: IParamAdapter,
    OneToManyParamAdapter: OneToManyParamAdapter,
    OneToArrayParamAdapter: OneToArrayParamAdapter
};
// TODO: implement ManyToOneParamAdapter
});
