/***************************************************************************
 *
 * Copyright (c) 2011 Baidu.com, Inc. All Rights Reserved
 * $Id: locator.js 5156 2011-04-27 04:15:29Z liyubei $
 *
 **************************************************************************/



/**
 * locator.js ~ 2011/03/24 18:36:18
 * @author leeight(liyubei@baidu.com)
 * @version $Revision: 5156 $
 * @description
 * er.locator
 **/
define(['er/base', 'er/config', 'er/pdc', 'er/controller'],
function(base, config, pdc, controller){
var FLAGS_enable_hm = false;

/**
 * Hash定位器
 * <pre>
 * Locator = [ path ] [ ~ query ]
 * path    = "/" [ *char *( "/" *char) ]
 * query   = *qchar
 * char    = ALPHA | DIGIT
 * qchar   = char | "&" | "=".
 * <pre>
 * @constructor
 */
var locator = {
  /**
   * @private
   * @type {string}
   */
  currentPath: '',

  /**
   * @private
   * @type {string}
   */
  currentQuery: '',

  /**
   * @private
   * @type {string}
   */
  referer: '',

  /**
   * setInterval的定时器
   * @type {number}
   */
  _timer: 0
};

/**
 * onredirect event
 */
locator.onredirect = function() {
  // empty
};

/**
 * 获取action的path信息，也就是hash中的部分
 * @return {string} 当前页面action的地址.
 */
locator.getLocation = function() {
    var hash;

    // firefox下location.hash会自动decode
    // 体现在：
    //   视觉上相当于decodeURI，
    //   但是读取location.hash的值相当于decodeURIComponent
    // 所以需要从location.href里取出hash值
    if (base.firefox > 0) {
        hash = document.location.href.match(/#(.*)$/);
        hash && (hash = hash[1]);
    } else {
        hash = document.location.hash;
    }

    if (hash) {
        return hash.replace(/^#/, '');
    }

    return '';
};

/**
 * 控制定位器转向
 *
 * @param {string} loc location位置.
 * @param {boolean=} preventDefault 不进入action的enter.
 * @param {string=} type 跳转的类型：assign/replace/reload.
 */
locator.redirect = function(loc, preventDefault, type) {
    type = type || 'assign';

    // 未设置path时指向当前path
    if (/^~/.test(loc)) {
        loc = (this.currentPath || '/') + loc;
    }

    // 将location写入hash
    // 写入相同的hash在firefox和chrome下不会记录成2个历史记录项
    if (type === 'assign') {
        document.location.hash = loc ? loc : '/';
    } else if (type === 'replace') {
        //如果是replace，那直接replace掉hash
        document.location.replace('#' + loc ? loc : '/');
    }

    loc = document.location.hash.replace(/^#/, '');
    var locResult = this.parseLocation(loc),
        path = locResult.path,
        query = locResult.query;

    // 与当前location相同时不进行转向
    if (type !== 'reload'
        && path === this.currentPath
        && query === this.currentQuery
    ) {
        return;
    }

    if (FLAGS_enable_hm) {
        // Used for _setReferrerOverride
        var referer = this.currentPath;
        if (!referer) {
            referer = location.pathname;
        }
        if (this.currentQuery) {
            referer += '?' + this.currentQuery;
        }
    }

    // 存储当前信息
    this.currentPath = path;
    this.currentQuery = query;

    // 触发onredirect事件
    this.onredirect();

    // ie下使用iframe保存历史
    if (base.ie) {
        if (type === 'assign') {
            base.g(config.CONTROL_IFRAME_ID).src =
              config.CONTROL_IFRAME_URL + '?' + loc;
        } else if (type === 'replace') {
            base.g(config.CONTROL_IFRAME_ID).contentWindow
                .document.location.replace(
                    config.CONTROL_IFRAME_URL + '?' + loc
                );
        }
    }
    if (!preventDefault) {
        if (FLAGS_enable_hm) {
            pdc.hm.push(['_setReferrerOverride', referer]);
        }
        controller.forward(this.currentPath,
          this.parseQuery(this.currentQuery), this.referer);
        if (FLAGS_enable_hm) {
            pdc.hm.push(['_trackPageview', this.currentPath + 
                (this.currentQuery ? '?' + this.currentQuery : '')]);
        }
    }

    if (type === 'assign') {
        this.referer = loc;
    }
};

/**
 * 控制定位器读取新内容替换当前内容.
 *
 * @param {string} loc location位置.
 * @param {boolean=} preventDefault 不进入action的enter.
 */
locator.replace = function(loc, preventDefault) {
    this.redirect(loc, preventDefault, 'replace');
};

/**
 * 控制定位器刷新当前内容.
 *
 * @param {string} loc location位置.
 * @param {boolean=} preventDefault 不进入action的enter.
 */
locator.reload = function(preventDefault) {
    this.redirect(null, preventDefault, 'reload');
};

/**
 * 解析location
 * @private
 * @param {string} loc 需要解析的url地址.
 * @return {{path:string,query:string}} path&query.
 */
locator.parseLocation = function(loc) {
    var pair = loc.match(/^([^~]+)(~(.*))?$/),
        re = {};
    if (pair) {
        re.path = pair[1];
        re.query = (pair.length === 4 ? pair[3] : '');
    } else {
        re.path = '';
        re.query = '';
    }

    return re;
};

/**
 * 获取参数集合
 * @return {Object} url参数的集合.
 */
locator.getParameterMap = function() {
    return this.parseQuery(this.currentQuery);
};

/**
 * 将参数解析为Map
 * @param {string=} opt_query 参数字符串.
 * @return {Object} 参数对象.
 */
locator.parseQuery = function(opt_query) {
    var query = opt_query || '';
    var params = {},
        paramStrs = query.split('&'),
        len = paramStrs.length,
        item,
        key,
        value;

    while (len--) {
        item = paramStrs[len].split('=');
        key = item[0];
        value = item[1];
        if (key) {
            // firefox在读取hash时，会自动把encode的uri片段进行decode
            if (!base.firefox) {
                value = decodeURIComponent(value);
            }

            params[key] = value;
        }
    }

    return params;
};

/**
 * 获取action的path
 * @return {string} 当前页面的action的path.
 */
locator.getPath = function() {
    return this.currentPath;
};

/**
 * 获取location的query
 * @return {string} 当前页面的url中的参数.
 */
locator.getQuery = function() {
    return this.currentQuery;
};

/**
 * 初始化er.Locator
 */
locator.init = function() {
    if (this._timer) {
        // 定时器已经启动了
        return;
    }

    var me = this,
        prevLocation;

    function changeListener() {
        var loc = me.getLocation();

        if (prevLocation !== loc) {
            prevLocation = loc;
            me.redirect(loc);
        }
    }

    if (base.ie) {
        var iframe = document.createElement('iframe'),
            style = iframe.style,
            size = 200,
            pos = '-1000px';

        iframe.id = config.CONTROL_IFRAME_ID;
        iframe.width = size;
        iframe.height = size;
        style.position = 'absolute';
        style.top = pos;
        style.left = pos;
        document.body.insertBefore(iframe, document.body.firstChild);
        iframe = null;
    }

    this._timer = setInterval(changeListener, 100);
};

return locator;
















});
/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
