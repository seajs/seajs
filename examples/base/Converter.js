/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: Converter.js 5182 2011-04-28 15:44:45Z liyubei $
 *
 **************************************************************************/



/**
 * Converter.js ~ Mar 7, 2011 4:54:22 PM
 * @author yuanhongliang(yuanhongliang@baidu.com)
 * @version $Revision: 5182 $
 * @description IuputControl的值对象与字符串转换器
 **/
define(function(){
/**
 * 转换器接口
 * @interface
 */
function IConverter() {
};

/**
 * 将值转换成字符串
 * XXX: 因为转换后的会直接提交，所以必要时需要在此处encodeURIComponent
 * @param {Object|string} value 要转换的值.
 * @return {string} 转换之后的值.
 */
IConverter.prototype.convert = function(value) {};

/**
 * 将字符串转换成值
 * @param {string} text 要转换的值.
 * @return {Object|string} 转换之后的值.
 */
IConverter.prototype.convertBack = function(text) {};


/**
 * 日期范围转换器类('20110307000000,20110308235959'<->{begin:Date,end:Date}).
 * @constructor
 * @implements {IConverter}
 */
function DateRangeConverter() {
};
DateRangeConverter.prototype = {

    /**
     * @inheritDoc
     */
    convert: function(value) {
        var beginTime = value.begin,
            endTime = value.end;
        return baidu.date.format(beginTime, 'yyyyMMdd') + '000000,' +
            baidu.date.format(endTime, 'yyyyMMdd') + '235959';
    },

    /**
     * @inheritDoc
     */
    convertBack: function(text) {
        if (text) {
            var strDates = text.split(',');
            return {
                begin: baidu.date.parseToDate(strDates[0]),
                end: baidu.date.parseToDate(strDates[1])
            };
        }
    }
};

/**
 * 对于某些文本输入框，需要自动添加http之类的前缀信息.
 * @constructor
 * @implements {IConverter}
 * @param {string} defaultPrefix 默认需要补全的前缀.
 * @param {RegExp=} opt_prefixPattern 需要补充的前缀.
 */
function UrlPrefixConverter(defaultPrefix, opt_prefixPattern) {
  this._defaultPrefix = defaultPrefix;
  this._prefixPattern = opt_prefixPattern || /^(https?|ftps?):\/\//;
};

/**
 * @inheritDoc
 */
UrlPrefixConverter.prototype.convert = function(value) {
  if (!this._prefixPattern.test(value)) {
    value = this._defaultPrefix + value;
  }

  return encodeURIComponent(/** @type {string} */ (value));
};

/**
 * @inheritDoc
 */
UrlPrefixConverter.prototype.convertBack = function(value) {
  return value;
};

return {
    IConverter: IConverter,
    DateRangeConverter: DateRangeConverter,
    UrlPrefixConverter: UrlPrefixConverter
}

});
