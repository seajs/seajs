
 module.js
-----------

 - module.load 是否可以内嵌？内嵌和全局两种情况下，是否需要保证功能一致？
   比如 module.load('./a') 在全局和内嵌时，相对路径的确定。目前全局是相对页面，内嵌是相对
   模块文件路径。
 - module.declare 内嵌时的含义，是否需要支持？
 - module.prefix 和 module.load 的关系？
 - module.config, 让 timeout 等可配置，考虑是否有必要增加 globalPrefix.
 - handle JSONP onerror

 - 支持 combo 形式的 package
 - 子模块的最佳实践
 - build 工具：auto generate id / dependencies when building
 - node.js support
 - seajs 包的版本管理策略
 - 完善文档


  related
----------

 - compare module.js with BravoJS, FlyScript, RequireJS, YY etc.
 - 中文站实践 answer swainet's questions
 - seajs/tools
