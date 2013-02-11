/*
 * coup-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    Validator.js
 * desc:    验证器
 * author:  zhaolei,erik
 * date:    $Date$
 */

goog.provide('Validator');
goog.provide('Validator.batchHideErrors');
goog.provide('Validator.hideError');
goog.provide('Validator.showError');

/**
 * 验证器
 */
var Validator = (function() {

    function parse(text, type) {
        if (type === 'int') {
            return parseInt(text, 10);
        } else if (type === 'float') {
            return parseFloat(text);
        } else if (type === 'date') {
            return baidu.lang.isDate(text) ? text : baidu.date.parse(text);
        } else {
            return text;
        }
    }

    var urlLoose = /^((http|https|ftp|ftps):\/\/)?[A-Za-z0-9][A-Za-z0-9-@:]{0,}[A-Za-z0-9]?(\.[A-Za-z0-9]+)+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/i;
    var urlStrict = /^(http|https|ftp|ftps):\/\/[A-Za-z0-9][A-Za-z0-9-@:]{0,}[A-Za-z0-9]?(\.[A-Za-z0-9]+)+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/i;

    var errorClass = 'validate-error',
        validClass = 'validate',
        iconClass = 'validate-icon',
        textClass = 'validate-text',
        suffix = 'validate',
        iconSuffix = 'validateIcon',
        textSuffix = 'validateText',
        _type,
        _error,

        errorMsg = {
            SUCCESS: '',
            ERROR_EMPTY: '不能为空！',
            ERROR_REGEX: '格式错误',
            ERROR_INT: '格式不正确，请填写整数',
            ERROR_NUMBER: '格式不正确，请填写数字',
            ERROR_MIN: '不能小于{0}',
            ERROR_MIN_DATE: '不能早于{0}',
            ERROR_MAX: '不能大于{0}',
            ERROR_MAX_DATE: '不能晚于{0}',
            ERROR_GT: '必须大于{0}',
            ERROR_GT_DATE: '必须晚于{0}',
            ERROR_LT: '必须小于{0}',
            ERROR_LT_DATE: '必须早于{0}',
            ERROR_RANGE: '必须在{0}到{1}的范围内',
            ERROR_LENGTH: '长度必须等于{0}',
            ERROR_MIN_LENGTH: '长度不能小于{0}',
            ERROR_MAX_LENGTH: '长度不能大于{0}',
            ERROR_MAX_CNCHAR_LENGTH: '长度不能大于{0}个汉字(包含隐藏字符)',
            ERROR_MAX_TEXT_CNCHAR_LENGTH: '长度不能大于{0}个汉字',
            ERROR_LENGTH_RANGE: '长度必须在{0}到{1}的范围内',
            ERROR_CALENDAR: '格式不正确，请按2010-01-01的格式输入',
            ERROR_EXT: '后缀名不合法，只允许后缀名为{0}',
            ERROR_INVALID_CHAR: '含有不允许输入的字符：{0}',
            ERROR_PRECISION: '小数点后数字不能多于{0}位',
            ERROR_LAYOUT: '有如下单元格没有添加模块：{0}',
            ERROR_BACKEND: '{0}'
        },

        /**
         * 验证规则集合
         *
         * @private
         */
        ruleMap = {
            'required': {
                validate: function(value) {
                    return baidu.lang.isEmptyObject(value) ? 'ERROR_EMPTY' : 'SUCCESS';
                }
            },

            // FIXME 改天去掉这个规则
            'charge_name' : {
              /**
               * @param {string} text 需要检查的文本内容.
               * @return {string|Array.<string>} 成功或者失败.
               */
              validate: function(text) {
                if (baidu.trim(text) === '') {
                  return 'ERROR_EMPTY';
                }

                var notAllowedCharsPattern = /[=\s]/i;
                if (notAllowedCharsPattern.test(text)) {
                  return ['ERROR_INVALID_CHAR', '空格,Tab,等号'];
                } else {
                  return 'SUCCESS';
                }
              }
            },

            'ext' : {
                /**
                 * @param {string} text 需要检查的文本内容.
                 * @param {...*} var_args 合法的后缀名.
                 */
                validate: function(text, var_args) {
                  if (baidu.trim(text) === '') {
                    return 'ERROR_EMPTY';
                  }

                  var allowedExt = Array.prototype.slice.call(arguments, 1);
                  var dotIndex = text.lastIndexOf('.');
                  if (dotIndex == -1) {
                    return ['ERROR_EXT', allowedExt.join(',')];
                  }

                  var ext = text.substring(dotIndex + 1).toLowerCase();
                  for (var i = 0, j = allowedExt.length; i < j; i++) {
                    if (allowedExt[i].toLowerCase() == ext) {
                      return 'SUCCESS';
                    }
                  }

                  return ['ERROR_EXT', allowedExt.join(',')];
                }
            },

            'regex': {
                validate: function(text, pattern, modifiers) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (!new RegExp(pattern, modifiers).test(text)) {
                        return 'ERROR_REGEX';
                    }
                    return 'SUCCESS';
                }
            },

            'int': {
                validate: function(text) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (isNaN(text - 0) || text.indexOf('.') >= 0) {
                        return 'ERROR_INT';
                    }
                    return 'SUCCESS';
                }
            },

            'number': {
                validate: function(text) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (isNaN(text - 0)) {
                        return 'ERROR_NUMBER';
                    }
                    return 'SUCCESS';
                }
            },

            'min': {
                validate: function(text, minValue, type) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (parse(text, type) < parse(minValue, type)) {
                        return [type === 'date' ?
                                'ERROR_MIN_DATE' :
                                'ERROR_MIN', minValue];
                    }
                    return 'SUCCESS';
                }
            },

            'gt': {
                validate: function(text, minValue, type) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (parse(text, type) <= parse(minValue, type)) {
                        return [type === 'date' ?
                                'ERROR_GT_DATE' :
                                'ERROR_GT', minValue];
                    }
                    return 'SUCCESS';
                }
            },

            'max': {
                validate: function(text, maxValue, type) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (parse(text, type) > parse(maxValue, type)) {
                        return [type === 'date' ?
                                'ERROR_MAX_DATE' :
                                'ERROR_MAX', maxValue];
                    }
                    return 'SUCCESS';
                }
            },

            'lt': {
                validate: function(text, maxValue, type) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (parse(text, type) >= parse(maxValue, type)) {
                        return [type === 'date' ?
                                'ERROR_LT_DATE' :
                                'ERROR_LT', maxValue];
                    }
                    return 'SUCCESS';
                }
            },

            'range': {
                validate: function(text, minValue, maxValue, type) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (parse(text, type) > parse(maxValue, type) ||
                        parse(text, type) < parse(minValue, type)) {
                        return ['ERROR_RANGE', minValue, maxValue];
                    }
                    return 'SUCCESS';
                }
            },

            'length': {
                validate: function(text, length) {
                    if (text.length !== length) {
                        return ['ERROR_LENGTH', length];
                    }
                    return 'SUCCESS';
                }
            },

            'minLength': {
                validate: function(text, minLength) {
                    if (text.length < minLength) {
                        return ['ERROR_MIN_LENGTH', minLength];
                    }
                    return 'SUCCESS';
                }
            },

            'maxLength': {
                validate: function(text, maxLength) {
                    if (text.length > maxLength) {
                        return ['ERROR_MAX_LENGTH', maxLength];
                    }
                    return 'SUCCESS';
                }
            },

            'maxCNCharLength': {
                validate: function(text, maxCNCharLength) {
                    if (baidu.string.getByteLength(text) > maxCNCharLength * 2) {
                        return ['ERROR_MAX_CNCHAR_LENGTH', maxCNCharLength];
                    }
                    return 'SUCCESS';
                }
            },

            'maxTextCNCharLength': {
                validate: function(html, value) {
                    var text = html.replace(/<[^>]+>/g, '');
                    if (baidu.string.getByteLength(text) > value * 2) {
                        return ['ERROR_MAX_TEXT_CNCHAR_LENGTH', value];
                    }
                    return 'SUCCESS';
                }
            },

            'lengthRange': {
                validate: function(text, minLength, maxLength) {
                    if (text.length < minLength || text.length > maxLength) {
                        return ['ERROR_LENGTH_RANGE', minLength, maxLength];
                    }
                    return 'SUCCESS';
                }
            },

            'calendar': {
                validate: function(text) {
                    /* 日历控件改成不可写的了，不需要验证了
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (!baidu.date.parse(text)) {
                        return 'ERROR_CALENDAR';
                    }
                    */
                    return 'SUCCESS';
                }
            },

            'positiveNumber': {
                validate: function(text) {
                    if (baidu.trim(text) === '') {
                        return 0;
                    }
                    if (isNaN(parseInt(text, 10))) {
                        return 1;
                    }
                    if (parseInt(text, 10) <= 0 || text.indexOf('.') > -1) {
                        return 1;
                    }
                    return 0;
                },
                noticeText: {
                    1: '格式不正确，必须为正整数'
                }
            },

            'positiveFloat': {
                validate: function(text) {
                    if (!/^[0-9]\d*(\.\d+)?$/.test(text)) {
                        return 1;
                    }
                    if (text == '0' || text == 0) {
                        return 1;
                    }
                    return 0;
                },
                noticeText: {
                    1: '格式不正确，必须为正数'
                }
            },

            'email': {
                validate: function(text) {
                    var len = text.length;
                    if (len == 0) {
                        return 1;
                    }else if (len > 200) {
                        return 2;
                    } else if (!/^.+@.+$/.test(text)) {
                        return 3;
                    }
                    return 0;
                },
                notice: noticeInTail,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '不能为空',
                    2: '长度不能超过200',
                    3: '格式错误'
                }
            },
            'emailVerify': {
                validate: function(text, text2) {
                    var len = text.length;
                    if (len === 0) {
                        return 1;
                    } else if (len > 200) {
                        return 2;
                    } else if (!/^.+@.+$/.test(text)) {
                        return 3;
                    } else if (text != text2) {
                        return 4;
                    }

                    return 0;
                },
                notice: noticeInTailNoTitle,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '确认邮件不能为空',
                    2: '确认邮件长度不能超过200',
                    3: '确认邮件格式错误',
                    4: '您两次输入的邮件不一致，请重新输入'
                }
            },
            'phone': {
                validate: function(text) {
                    var f = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(text);
                    if (text != '' && !f) {
                        return 1;
                    }
                    return 0;
                },
                notice: noticeInTail,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '格式错误，请按区号-电话号码格式填写'
                }
            },
            'fax': {
                validate: function(text) {
                    var f = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(text);
                    if (text != '' && !f) {
                        return 1;
                    }
                    return 0;
                },
                notice: noticeInTail,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '格式错误，请按区号-电话号码格式填写'
                }
            },
            'mobile': {
                validate: function(text) {
                    var f = /^1[3,5,8]{1}[0-9]{1}[0-9]{8}$/.test(text);
                    if (text != '' && !f) {
                        return 1;
                    }

                    return 0;
                },
                notice: noticeInTailNoTitle,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '手机号码格式错误，手机号码为以13,15,18开头的11位数字'
                }
            },

            'password': {
                validate: function(text) {
                    var len = text.length;
                    if (len === 0) {
                        return 1;
                    } else if (len < 6) {
                        return 2;
                    } else if (!(/[a-z]/.test(text) &&
                                 /[A-Z]/.test(text) &&
                                 /\d/.test(text))) {
                        return 3;
                    }

                    return 0;
                },
                notice: noticeInTail,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '不能为空',
                    2: '不能少于6位',
                    3: '必须包含小写字母、大写字母和阿拉伯数字三种字符'
                }
            },
            'endTime': {
                validate: function(text, text1, endTime, orientObj) {

                    if (orientObj) {
                        var date = orientObj.date,
                            len = date instanceof Array && date.length;
                    }


                    if (text <= text1 && endTime != '9999010124') {
                        // endtime < begintime
                        return 1;
                    } else if (endTime != '9999010124' &&
                               orientObj &&
                               len &&
                               text < date[len - 1]) {
                        return 2;
                    }


                    return 0;
                },

                notice: noticeInTailNoTitle,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '结束时间必须晚于起始时间',
                    2: '结束日期必须晚或等于定向投放中选择的日期'
                }
            },
            'endTimeOrder': {
                validate: function(text, text1, endTime) {
                    if (text < text1 && endTime != '9999010124')
                        return 1;
                    return 0;
                },

                notice: noticeInTailNoTitle,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '结束日期不得早于起始日期'
                }
            },
            'passwordVerify': {
                validate: function(text, text1) {
                    var len = text.length;
                    if (len === 0) {
                        return 1;
                    } else if (text != text1) {
                        return 2;
                    }

                    return 0;
                },

                notice: noticeInTailNoTitle,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '密码不能为空',
                    2: '您两次输入的密码不一致，请重新输入'
                }
            },

            'link' : {
                validate: function(text) {
                    var len = text.length;
                    if (len === 0) {
                        return 1;
                    }else if (len > 1024) {
                        return 2;
                    }else if (!urlLoose.test(text)) {
                        return 3;
                    }
                },
                notice: noticeInTail,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '不能为空',
                    2: '不能超过1024个字符',
                    3: '格式错误'
                }
            },

            'imgUrl' : {
                validate: function(text) {
                    var len = text.length;
                    var s1 = text.substring(len - 4, len).toLowerCase();
                    var s2 = text.substring(len - 5, len - 4);
                    if (len === 0) {
                        return 1;
                    }else if (len > 1000) {
                        return 2;
                    }else if (!urlLoose.test(text)) {
                        return 3;
                    }else if (s1 != '.jpg' && s1 != '.gif' && s1 != '.png' || s2 == '/') {
                        return 4;
                    }

                },
                notice: noticeInTailNoTitle,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: '图片地址不能为空',
                    2: '图片地址不能超过256个字符',
                    3: '图片地址格式错误',
                    4: '图片格式必须为jpg, gif或png！'
                }
            },
            'flashUrl' : {
                validate: function(text) {
                    var len = text.length;
                    var s1 = text.substring(len - 4, len).toLowerCase();
                    var s2 = text.substring(len - 5, len - 4);
                    if (len === 0) {
                        return 1;
                    }else if (len > 1000) {
                        return 2;
                    }else if (!urlLoose.test(text)) {
                        return 3;
                    }else if (s1 != '.swf' || s2 == '/') {
                        return 4;
                    }

                },
                notice: noticeInTailNoTitle,
                cancelNotice: cancelNoticeInTile,
                noticeText: {
                    1: 'Flash地址不能为空',
                    2: 'Flash地址不能超过1000个字符',
                    3: 'Flash地址格式错误',
                    4: '请输入后缀为\"swf\"的Flash地址'
                }
            },

            'precision': {
                validate: function(text, maxLen, type) {
                    if (baidu.trim(text) === '') {
                        return 'SUCCESS';
                    }
                    if (!type) {
                        type = 'float';
                    }
                    var value = parse(text, type);
                    if (!isNaN(value) && value.toFixed(maxLen) != value) {
                        return ['ERROR_PRECISION', maxLen];
                    }
                    return 'SUCCESS';
                }
            },

            'validatePriceEditor': {
                validate: function(text) {
                    var price = text.price,
                        lowestPrice = text.lowestPrice,
                        maxPrice = text.maxPrice;
                    function internalValid(value) {
                        if (baidu.lang.isEmptyObject(value)) {
                            return 1;
                        }else if (isNaN(value - 0)) {
                            return 2;
                        }else if (!isNaN(lowestPrice - 0) && parse(value, 'float') < parse(lowestPrice, 'float')) {
                            return 3;
                        }else if (!isNaN(maxPrice - 0) && parse(value, 'float') > parse(maxPrice, 'float')){
                            return 4;
                        }else if (parse(value, 'float').toFixed(2) != parse(value, 'float')){
                            return 5;
                        }
                        return 0;
                    }
                    for (var i = 0; i < price.length; i++) {
                        var rtn = internalValid(price[i]);
                        if (rtn) { return rtn; }
                    }
                    return 0;
                },
                noticeText: {
                    1: '点击单价不能为空！',
                    2: '点击单价必须为数字！',
                    3: '点击单价不能小于合同中底价！',
                    4: '点击单价不能大于系统最大单价限制！',
                    5: '点击单价小数点后数字不能多于两位！'
                }
            },

            'validateLayout': {
                validate: function(value) {
                    var template = value,
                        rows = template.rows,
                        row, cols, col, indexs = [];
                    for(var i = 0; i < rows.length; i++){
                        row = rows[i];
                        cols = row.cols;
                        if(cols && cols.length > 0){
                            for(var j = 0; j < cols.length; j++){
                                col = cols[j];
                                if(!col.widgetId){
                                    indexs.push({
                                        'rowIndex' : (i + 1),
                                        'colIndex' : (j + 1)
                                    });
                                }
                            }
                        }else{
                            if(!row.widgetId){
                                indexs.push({
                                    'rowIndex' : (i + 1),
                                    'colIndex' : 1
                                });
                            }
                        }
                    }
                    if(indexs.length > 0){
                        var msgArr = [];
                        for(var i = 0; i < indexs.length; i++){
                            msgArr.push(baidu.format('第{0}行第{1}列', indexs[i]['rowIndex'], indexs[i]['colIndex']));
                        }
                        return ['ERROR_LAYOUT', msgArr.join(', ')];
                    }
                }
            },

            'backendError': {
                validate: function(text, control) {
                    return ['ERROR_BACKEND', control.errorMessage];
                },
                notice: noticeInTailNoTitle
            }
        };

    /**
     * 在父元素的末尾提示信息
     *
     * @private
     * @param {string} noticeText 错误信息.
     * @param {HTMLElement} input 控件元素.
     */
    function noticeInTail(noticeText, input, control) {
        showNoticeDom(input);
        var title = input.getAttribute('title') || '';
        getTextEl(input).innerHTML = title + noticeText;
    }

    /**
     * 在父元素的末尾提示信息
     *
     * @private
     * @param {string} noticeText 错误信息.
     * @param {HTMLElement} input 控件元素.
     */
    function noticeInTailNoTitle(noticeText, input, control) {
        showNoticeDom(input);
        getTextEl(input).innerHTML = noticeText;
    }

    /**
     * 在父元素的末尾提示信息
     *
     * @private
     * @param {number} errorCode 错误码.
     * @param {HTMLElement} input 控件元素.
     * @param {Object} control 触发提示的控件.
     */
    function noticeInTailNoTitleUploader(errorCode, input, control) {
        var noticeText = this.noticeText;
        if ('object' == typeof noticeText) {
            noticeText = noticeText[errorCode];
        }
        if (errorCode == 1 || errorCode >= 3) {
            if (control.getChild('preWidth')) {
                cancelNoticeInTile(control.getChild('preWidth').main);
            }else {
                cancelNoticeInTile(input);
            }
            showNoticeDom(input);

            getTextEl(input).innerHTML = noticeText;

        }else if (errorCode == 2) {
            cancelNoticeInTile(input);
            showNoticeDom(control.getChild('preWidth').main);
            getTextEl(control.getChild('preWidth').main).innerHTML = noticeText;
        }

    }


    /**
     * 显示notice的dom元素
     *
     * @private
     * @param {HTMLElement} input 对应的input元素.
     */
    function showNoticeDom(input) {
        var el = getEl(input),
            father = input.parentNode;

        if (!el) {
            el = createNoticeElement(input);
            father.appendChild(el);
        }

        el.style.display = '';

        baidu.addClass(father, errorClass);
    }

    /**
     * 创建notice元素
     *
     * @private
     * @param {Element} input 对应的input元素.
     * @return {Element} 显示错误信息的节点.
     */
    function createNoticeElement(input) {
        var inputId = input.id,
            el = getEl(input),
            icon, text;

        if (!el) {
            el = document.createElement('div');
            el.id = inputId + suffix;
            el.className = validClass;
            //el.style.width = (input.offsetWidth - 2) + 'px';

            icon = document.createElement('div');
            icon.id = inputId + iconSuffix;
            icon.className = iconClass;
            el.appendChild(icon);

            text = document.createElement('div');
            text.id = inputId + textSuffix;
            text.className = textClass;
            el.appendChild(text);
        }

        return el;
    }

    /**
     * 在父元素的末尾取消提示信息
     *
     * @private
     * @param {HTMLElement} input 控件元素.
     */
    function cancelNoticeInTile(input) {
        var el = getEl(input),
            father = input.parentNode,
            noError = true,
            child;

        if (el) {
            el.style.display = 'none';
        }

        // 只有所有的提示信息都隐藏了，父控件才能去掉背景框
        for (var i = 0; i < father.childNodes.length; i++) {
            child = father.childNodes[i];
            if (child.className === validClass &&
                child.style.display !== 'none') {
                noError = false;
                break;
            }
        }
        noError && baidu.removeClass(father, errorClass);
    }
    /**
     * 在父元素的末尾取消提示信息
     *
     * @private
     * @param {Element} input 控件元素.
     */
    function cancelNoticeInTileUploader(input, control) {
        var el = getEl(input),
            father = input.parentNode;
            if (control.getChild('preWidth')) {
                var el2 = getEl(control.getChild('preWidth').main);
                var father2 = control.getChild('preWidth').main.parentNode;
            }

        if (el) {
            el.style.display = 'none';
        }
        if (el2) {
            el2.style.display = 'none';
        }
        baidu.removeClass(father, errorClass);
        if (father2) {
            baidu.removeClass(father2, errorClass);
        }
    }



    /**
     * 获取info区域的元素
     *
     * @private
     * @param {Element} input 对应的input元素.
     * @return {Element}
     */
    function getTextEl(input) {
        return baidu.g(input.id + textSuffix);
    }

    /**
     * 获取提示元素
     *
     * @private
     * @param {Element} input 对应的input元素.
     * @return {Element}
     */
    function getEl(input) {
        return baidu.g(input.id + suffix);
    }

    function validateInnerControl(ctrl) {
        var inputControls = [],
            title,
            resultObj,
            errTextArr = [],
            errText = '',
            result = true;

        function collectInputControls(control, inputs) {
            if (control instanceof ui.InputControl) {
                inputs.push(control);
            } else if (control.children) {
                for (var i = 0; i < control.children.length; i++) {
                    collectInputControls(control.children[i], inputs);
                }
            }
        }

        collectInputControls(ctrl, inputControls);

        for (var i = 0; i < inputControls.length; i++) {
            // 不对disabled和readonly的控件进行验证
            if (inputControls[i].isDisabled() || inputControls[i].isReadOnly()) {
                continue;
            }
            if (inputControls[i].rule) {
                result &= Validator(inputControls[i], inputControls[i].rule, 'local');
                if (_error && !_error.result) {
                    title = inputControls[i].main.getAttribute('title') || '';
                    errTextArr.push(title + _error.errorText);
                }
            }
        }

        if (!result) {
            errText = errTextArr.join('<br />');
            ctrl.showError && ctrl.showError(errText);
        }else {
            ctrl.hideError && ctrl.hideError();
        }

        return !!result;
    }

    /**
     * 验证规则
     *
     * @private
     * @param {ui.Control} control 需要验证的控件.
     * @param {string} ruleName 验证规则的名称.
     */
    function applyRule(control, ruleName) {
        if (control.type == 'modFrame'
            || control.type == 'dialog') {
            return validateInnerControl(control);
        }

        // 判断控件是否具有获取value的方法
        if (!control.getValue || !ruleName) {
            return true;
        }

        var ruleSeg = baidu.lang.isArray(ruleName) ? ruleName : ruleName.split(','),
            text = control.getValue(true),
            rule = ruleMap[ruleSeg[0]],
            segLen = ruleSeg.length, i,
            args = [text], ctrl,
            error, errorText = '';

        // FIXME 采用control.isCheckBox()
        if (control.type == 'checkbox') {
            text = control.getChecked();
            args = [text];
        }

        if (segLen > 0) {
            for (i = 1; i < segLen; i++) {
                if (ruleSeg[i] == 'this') {
                    //pass control to validate function
                    args.push(control);
                } else {
                     // 控件不一定附在page上，try-catch一下
                    try {
                        ctrl = baidu.lang.isString(ruleSeg[i]) && ui.util.get(ruleSeg[i], control.getPage());
                    } catch(e) {
                        ctrl = null;
                    }
                    if (ctrl && ctrl.getValue && !ctrl.getState('disabled')) {
                        if (ctrl.type == 'checkbox') {
                            args.push(ctrl.getChecked());
                        }else {
                            args.push(ctrl.getValue());
                        }
                    } else {
                        args.push(ruleSeg[i]);
                    }
                }
            }
        }

        error = rule.validate.apply(rule, args);

        if (baidu.lang.isNumber(error) && error !== 0) { //TODO:这种形式是要被历史遗弃的
            errorText = rule.noticeText[error];
        } else if (baidu.lang.isString(error) && error !== '') {
            errorText = errorMsg[error];
        } else if (baidu.lang.isArray(error)) {
            error[0] = errorMsg[error[0]];
            errorText = baidu.format.apply(null, error);
        }

        _error = null;
        if (_type === 'alert' && errorText) {
            ui.Dialog.alert({
                title: '错误',
                content: errorText
            });
        } else if (_type === 'local' && errorText) {
            _error = {
                'result' : !errorText,
                'errorText' : errorText
            };
        } else if (_type === 'output' && errorText) {
            var title = control.getMain().getAttribute('title') || '';
            return {
                'result' : !errorText,
                'errorText' : title + errorText
            };
        } else if (errorText) {
            rule.notice = rule.notice || noticeInTail;
            rule.notice(errorText, control.main, control);
        } else {
            rule.cancelNotice = rule.cancelNotice || cancelNoticeInTile;
            rule.cancelNotice(control.main, control);
        }
        return !errorText;
    }

    /**
     * 验证器
     *
     * @param {ui.Control} control 需要验证的控件.
     * @param {string|Array.<string|Array>} ruleNames 验证规则的名称或名称数组.
     * @param {string} type 验证类型，取值如下：
     *    alert--错误不显示在控件上，通过ui.Dialog.alert显示
     *    local--用于ModFrame和dialog验证时使用，不显示错误，将错误保存到_error中
     *    output--错误不显示在控件上，将错误信息输出.
     */
    return function(control, ruleNames, type) {
        _type = type;
        if (baidu.lang.isArray(ruleNames)) {
            for (var i = 0; i < ruleNames.length; i++) {
                if (!applyRule(control, ruleNames[i])) {
                    return false;
                }
            }
            return true;
        }
        return applyRule(control, /** @type {string} */(ruleNames));
    };
})();

/**
 * 在父元素的末尾提示错误信息
 *
 * @param {HTMLElement} ele dom元素.
 * @param {string} errorMsg 提示信息.
 * @param {number=} opt_width 若需显示的控件宽度超过父层宽度，
 *  可设置错误层显示的宽度，若使用请考虑对parentNode的宽度影响.
 */
Validator.showError = function(ele, errorMsg, opt_width) {
    var parent = ele.parentNode;
    baidu.addClass(parent, 'validate-error');
    if (parent.lastChild.className !== 'validate') {
        var errorNode = document.createElement('div');
        baidu.addClass(errorNode, 'validate');

        var idProvider = ele,
            idPrefix = idProvider.id;
        if (!idPrefix) {
          do {
            idProvider = idProvider.parentNode;
            idPrefix = idProvider.id;
          } while (!idPrefix && idProvider != document.body);
        }

        errorNode.innerHTML = baidu.format(
          '<div class="validate-icon"></div><div id="{1}" class="validate-text">{0}</div>',
          errorMsg,
          idPrefix + '_validatetext');
        if (opt_width && ele.parentNode) {
            ele.parentNode.style.width = opt_width + 'px';
        }
        // if ((ele.offsetWidth - 2) > 0) {
        //     errorNode.style.width = (ele.offsetWidth - 2) + 'px';
        // }
        parent.appendChild(errorNode);
    }
};

/**
 * 隐藏错误提示
 *
 * @param {HTMLElement} ele dom元素.
 */
Validator.hideError = function(ele) {
    var parent = ele.parentNode;
    if (parent && parent.lastChild.className === 'validate') {
        parent.removeChild(parent.lastChild);
    }
    baidu.removeClass(ele.parentNode, 'validate-error');
};

/**
 * 隐藏错误提示
 *
 * @param {Array.<Element>} eleArr dom元素.
 */
Validator.batchHideErrors = function(eleArr) {
  var parent, ele;
  for (var i = 0, len = eleArr.length; i < len; i++) {
    ele = eleArr[i];
    if (ele) {
      parent = ele.parentNode;
      if (parent && parent.lastChild.className === 'validate') {
          parent.removeChild(parent.lastChild);
      }
      baidu.removeClass(ele.parentNode, 'validate-error');
    }
  }
};

Validator.getValidateMessage = function(control, ruleNames) {
    if (!baidu.lang.isArray(ruleNames)) {
        ruleNames = [ruleNames];
    }
    for (var i = 0; i < ruleNames.length; i++) {
        var result = Validator(control, ruleNames[i], 'output');
        if (result && result.errorText) {
            return result;
        }
    }
    return {
        'result' : true,
        'errorText' : ''
    };
};
