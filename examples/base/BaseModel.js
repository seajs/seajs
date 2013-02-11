/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    base/BaseModel.js
 * desc:    所有数据模型的基类，从PropertyChangeNotifier继承
 * author:  yuanhongliang
 * date:    $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */
define("base/BaseModel", 
['base/PropertyChangeNotifier'],
function(PropertyChangeNotifier){
/**
 * 所有数据模型的基类
 * @constructor
 * @extends {PropertyChangeNotifier}
 * @param {Object=} opt_data 用来进行初始化的数据.
 * @export
 */
function BaseModel(opt_data) {
    PropertyChangeNotifier.call(this);

    baidu.object.extend(this, opt_data || {});
};
baidu.inherits(BaseModel, PropertyChangeNotifier);

return BaseModel;
});
