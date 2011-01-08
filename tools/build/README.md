
Usage
-------

 1. Install Ant-Contrib Tasks <http://ant-contrib.sourceforge.net/>.
 2. Install Closure Linter <http://code.google.com/closure/utilities/docs/linter_howto.html>.
 3. Run Ant Build in IDE or commandline.


说明
------
  通常，一个模块有3个版本：

  1. src 目录下的 mod/a.js, 是开发版本，文件里可能含有 @VERSION@, 中文字符串。
  2. build 目录下的 mod-debug.js, 是调试版本，@VERSION@ 已替换为真实值，中文已 ASCII 化，
     但 S.DEBUG 依旧为 true. 这样，当页面编码和脚本编码不一致时，也不会报错。
  3. build 目录下的 mod.js, 是压缩版本，@VERSION@ 等已替换为真实值，中文已 ASCII 化，
     S.log 行已移除，S.DEBUG 为 false. 可直接部署到线上。
