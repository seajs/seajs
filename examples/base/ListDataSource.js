/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    base/ListDataSource.js
 * desc:    PagableList控件使用的数据源
 * author:  yuanhongliang
 * date:    $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */
define(['base/DataSource'], function(DataSource){
/**
 * PagableList控件使用的数据源抽象类
 * @constructor
 * @extends {DataSource}
 */
function ListDataSource() {
    DataSource.call(this);
};
ListDataSource.prototype = function() {
    return {
        getData: function(params, callback) {
            this.getDataInternal(params.pageSize, params.pageNo,
                params.orderBy, params.order, callback);
        },

        getDataInternal: function(pageSize, pageNo, orderBy, order, callback) {
            throw 'Not implemented';
        }
    };
}();
baidu.inherits(ListDataSource, DataSource);

return ListDataSource;
});
