/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    base/DataSource.js
 * desc:    DataSource接口定义
 * author:  yuanhongliang
 * date:    $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */
define(['base/Object'], function(Object){
/**
 * DataSource接口定义
 * @constructor
 * @extends {Object}
 */
function DataSource() {
    Object.call(this);
};
baidu.inherits(DataSource, Object);

/**
 * 从数据源获取数据.
 * @param {string|Object} params 参数.
 * @param {Function} callback 处理结果的回掉函数.
 * @protected
 */
DataSource.prototype.getData = function(params, callback) {
  throw 'Not implemented';
};

return DataSource;
});
