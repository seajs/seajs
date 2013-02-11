/***************************************************************************
 * 
 * Copyright (c) 2013 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * RemoteListDataSource.js ~ 2013/01/27 21:15:17
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
define(['base/ListDataSource'], function(ListDataSource){
/**
 * 远程数据源实现类
 * @constructor
 * @extends {ListDataSource}
 * @param {Function} requester 远程数据请求函数.
 * @param {Function=} opt_getExtraParam 其他参数获取函数，可选.
 */
function RemoteListDataSource(requester, opt_getExtraParam) {
    ListDataSource.call(this);

    this.requester = requester;
    if (opt_getExtraParam) {
        this.getExtraParam = opt_getExtraParam;
    }
};
RemoteListDataSource.prototype = function() {
    return {
        getDataInternal: function(pageSize, pageNo, orderBy, order, callback) {
            var params = [],
                extraParam = this.getExtraParam();
            params.push('page.pageSize=' + encodeURIComponent(pageSize));
            params.push('page.pageNo=' + encodeURIComponent(pageNo));
            params.push('page.orderBy=' + encodeURIComponent(orderBy));
            params.push('page.order=' + encodeURIComponent(order));
            extraParam && params.push(extraParam);
            this.requester(params.join('&'), callback);
        },

        getExtraParam: function() {
            return null;
        }
    };
}();
baidu.inherits(RemoteListDataSource, ListDataSource);

return RemoteListDataSource;

});



















/* vim: set ts=4 sw=4 sts=4 tw=100: */
