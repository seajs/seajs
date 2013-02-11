/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    base/RSDataSource.js
 * desc:    PagableList控件使用的数据源
 * author:  yuanhongliang
 * date:    $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */
define(['base/DataSource'], function(DataSource){
/**
 * RichSelector使用的数据源抽象类
 * @constructor
 * @extends {DataSource}
 */
function RSDataSource() {
    DataSource.call(this);
};
RSDataSource.prototype = function() {
    return {
        getData: function(params, callback) {
            this.getDataInternal(params.keyword, params.pageSize,
                params.pageNo, callback);
        },

        getDataInternal: function(keyword, pageSize, pageNo, callback) {
            throw 'Not implemented';
        }
    };
}();
baidu.inherits(RSDataSource, DataSource);

/**
 * 远程数据源实现类
 * @constructor
 * @extends {RSDataSource}
 * @param {Function} requester 远程数据请求函数.
 */
function RemoteRSDataSource(requester) {
    RSDataSource.call(this);

    this.requester = requester;
};
RemoteRSDataSource.prototype = function() {
    return {
        getDataInternal: function(keyword, pageSize, pageNo, callback) {
            var params = [],
                extraParam = this.getExtraParam();
            params.push('keyword=' + encodeURIComponent(keyword));
            params.push('page.pageSize=' + encodeURIComponent(pageSize));
            params.push('page.pageNo=' + encodeURIComponent(pageNo));
            extraParam && params.push(extraParam);
            this.requester(params.join('&'), callback);
        },

        getExtraParam: function() {
            return null;
        }
    };
}();
baidu.inherits(RemoteRSDataSource, RSDataSource);

return RSDataSource;
});
