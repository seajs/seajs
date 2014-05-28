define(function(require) {

  var test = require('../../test')
  var assert = test.assert


  assert(dirname('./a/b/c.js') === './a/b/', 'dirname')
  assert(dirname('a/b/c.js') === 'a/b/', 'dirname')
  assert(dirname('/a/b/c.js') === '/a/b/', 'dirname')
  assert(dirname('/d.js') === '/', 'dirname')
  assert(dirname('/') === '/', 'dirname')
  assert(dirname('/xxx') === '/', 'dirname')
  assert(dirname('http://cdn.com/js/file.js') === 'http://cdn.com/js/', 'dirname')
  assert(dirname('http://cdn.com/js/file.js?t=xxx') === 'http://cdn.com/js/', 'dirname')
  assert(dirname('http://cdn.com/js/file.js?t=xxx#zzz') === 'http://cdn.com/js/', 'dirname')
  assert(dirname('http://example.com/page/index.html#zzz?t=xxx') === 'http://example.com/page/', 'dirname')
  assert(dirname('http://example.com/arale/seajs/1.2.0/??sea.js,seajs-combo.js') === 'http://example.com/arale/seajs/1.2.0/', 'dirname')
  assert(dirname('http://cdn.com/??seajs/1.2.0/sea.js,jquery/1.7.2/jquery.js') === 'http://cdn.com/', 'dirname')
  assert(dirname('http://seajs.com/docs/#/abc') === 'http://seajs.com/docs/', 'dirname')
  //assert(dirname('') === null, 'dirname')


  //assert(realpath('http://test.com/./a//b/../c') === 'http://test.com/a/c', 'realpath')
  assert(realpath('http://test.com/a/b/c/d/e/f/g/h/../../../../../../i') === 'http://test.com/a/b/i', 'realpath')
  assert(realpath('https://test.com/a/b/../../c') === 'https://test.com/c', 'realpath')
  assert(realpath('file:///a//b/c') === 'file:///a/b/c', 'realpath')
  assert(realpath('http://a//b/c') === 'http://a/b/c', 'realpath')
  assert(realpath('http://a/b/c//../d') === 'http://a/b/d', 'realpath')
  assert(realpath('http://a///b/c') === 'http://a/b/c', 'realpath')


  assert(normalize('a/b/c') === 'a/b/c.js', 'normalize')
  assert(normalize('a/b/c.js') === 'a/b/c.js', 'normalize')
  assert(normalize('a/b/c.css') === 'a/b/c.css.js', 'normalize')
  assert(normalize('a/b/c.d') === 'a/b/c.d.js', 'normalize')
  assert(normalize('a/b/c.json#') === 'a/b/c.json', 'normalize')
  assert(normalize('a/b/c.json') === 'a/b/c.json.js', 'normalize')
  assert(normalize('c?t=20110525') === 'c?t=20110525', 'normalize')
  assert(normalize('c?t=20110525#') === 'c?t=20110525', 'normalize')
  //assert(normalize('a/b/') === 'a/b/', 'normalize')


  seajs.config({
        alias: {
          'jquery-debug': 'jquery/1.8.0/jquery-debug',
          'app': 'app/1.2/app',
          'alias/a': 'path/to/biz/a.js',
          './alias/b': 'path/to/b.js',
          '/alias/c': 'c.js',
          'http://test.com/router': 'router.js?t=20110525'
        }
      })

  assert(parseAlias('jquery-debug') === 'jquery/1.8.0/jquery-debug', 'parseAlias')
  assert(parseAlias('app') === 'app/1.2/app', 'parseAlias')
  assert(parseAlias('alias/a') === 'path/to/biz/a.js', 'parseAlias')
  assert(parseAlias('./alias/b') === 'path/to/b.js', 'parseAlias')
  assert(parseAlias('/alias/c') === 'c.js', 'parseAlias')
  assert(parseAlias('http://test.com/router') === 'router.js?t=20110525', 'parseAlias')


  seajs.config({
    paths: {
      'xx-path': 'http://xx.com/path/to/',
      'xx/path': 'http://xx.com/path/to/',
      'http:': 'WRONG'
    }
  })

  assert(parsePaths('xx-path/a') === 'http://xx.com/path/to//a', 'parsePaths')
  assert(parsePaths('/xx-path/a') === '/xx-path/a', 'parsePaths')
  assert(parsePaths('xx/path/a') === 'xx/path/a', 'parsePaths')
  assert(parsePaths('http://xx/path/xx-path/') === 'http://xx/path/xx-path/', 'parsePaths')
  assert(parsePaths('/') === '/', 'parsePaths')
  assert(parsePaths('.') === '.', 'parsePaths')


  seajs.config({
    vars: {
      'locale': 'zh-cn',
      'biz': 'path/to/biz',
      'xx': './xx',
      'zz': 'zz.js',
      'a/b': 'path/to/a/b.js',
      'c': '{path}/to/c.js'
    }
  })

  assert(parseVars('./i18n/{locale}.js') === './i18n/zh-cn.js', 'parseVars')
  assert(parseVars('{biz}/js/x') === 'path/to/biz/js/x', 'parseVars')
  assert(parseVars('/js/{xx}/c.js') === '/js/./xx/c.js', 'parseVars')
  assert(parseVars('/js/{xx}/{zz}') === '/js/./xx/zz.js', 'parseVars')
  assert(parseVars('{a/b}') === 'path/to/a/b.js', 'parseVars')
  assert(parseVars('{not-existed}') === '{not-existed}', 'parseVars')
  assert(parseVars('{c}') === '{path}/to/c.js', 'parseVars')


  var CWR = cwd.match(/^.*?\/\/.*?\//)[0]

  assert(addBase('http://a.com/b.js') === 'http://a.com/b.js', 'addBase')
  assert(addBase('./a.js', 'http://test.com/path/b.js') === 'http://test.com/path/a.js', 'addBase')
  assert(addBase('/b.js', 'http://test.com/path/to/c.js') === CWR + 'b.js', 'addBase')
  assert(addBase('c', 'http://test.com/path/to/c.js') === cwd + 'c', 'addBase')


  seajs.config({
    map: [
      ['aa.js', 'aa-debug.js'],
      [/^jquery\/.*/, 'http://localhost/jquery.js'],
      [/^(.*)\/js\/(.*)$/, function(m, m1, m2) {
        return m1 + '/script/' + m2
      }],
      function(uri) {
        if (uri.indexOf('/function/') > -1) {
          return 'http://test.com/path/to/function.js'
        }
      },
      ['cc.js', './cc.js']
    ]
  })

  assert(parseMap('path/to/aa.js') === 'path/to/aa-debug.js', 'parseMap')
  assert(parseMap('jquery/2.0.0/jquery') === 'http://localhost/jquery.js', 'parseMap')
  assert(parseMap('jquery/2.0.0/jquery-debug') === 'http://localhost/jquery.js', 'parseMap')
  assert(parseMap('path/to/js/a') === 'path/to/script/a', 'parseMap')
  assert(parseMap('path/to/function/b') === 'http://test.com/path/to/function.js', 'parseMap')
  assert(parseMap('cc.js') === './cc.js', 'parseMap')


  assert(id2Uri('path/to/a') === cwd + 'path/to/a.js', 'id2Uri')
  assert(id2Uri('path/to/a.js') === cwd + 'path/to/a.js', 'id2Uri')
  assert(id2Uri('path/to/a.js#') === cwd + 'path/to/a.js', 'id2Uri')
  assert(id2Uri('path/to/z.js?t=1234') === cwd + 'path/to/z.js?t=1234', 'id2Uri')
  assert(id2Uri('path/to/z?t=1234') === cwd + 'path/to/z?t=1234', 'id2Uri')
  assert(id2Uri('./b', 'http://test.com/path/to/x.js') === 'http://test.com/path/to/b.js', 'id2Uri')
  assert(id2Uri('/c', 'http://test.com/path/x.js') === CWR + 'c.js', 'id2Uri')
  //assert(id2Uri('/root/', 'file:///Users/lifesinger/tests/specs/util/test.html') === CWR + 'root/', 'id2Uri')
  assert(id2Uri('http://test.com/x.js') === 'http://test.com/x.js', 'id2Uri')
  assert(id2Uri('http://test.com/x.js#') === 'http://test.com/x.js', 'id2Uri')
  assert(id2Uri('./z.js', 'http://test.com/x.js') === 'http://test.com/z.js', 'id2Uri')
  assert(id2Uri('') === '', 'id2Uri')
  assert(id2Uri() === '', 'id2Uri')
  assert(id2Uri('http://XXX.com.cn/min/index.php?g=commonCss.css') === 'http://XXX.com.cn/min/index.php?g=commonCss.css', 'id2Uri')
  assert(id2Uri('./front/jquery.x.queue.js#') === cwd + 'front/jquery.x.queue.js', 'id2Uri')
  assert(id2Uri('//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js') === location.protocol + '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', 'id2Uri')

  var _cwd = cwd
  seajs.config({ cwd: '/User/lifesinger/path/to/root/' })
  assert(id2Uri('/C/path/to/a') === '/C/path/to/a.js', 'id2Uri ' + id2Uri('/C/path/to/a'))
  seajs.config({ cwd: _cwd })


  /*
  assert(isAbsolute('http://test.com/') === true, 'isAbsolute')
  assert(isAbsolute('https://test.com/') === true, 'isAbsolute')
  assert(isAbsolute('file:///c/') === true, 'isAbsolute')

  assert(isRelative('./') === true, 'isRelative')
  assert(isRelative('../') === true, 'isRelative')

  assert(isRoot('/') === true, 'isRoot')
  assert(isRoot('//') === true, 'isRoot')
  assert(isRoot('/a') === true, 'isRoot')
  */

  /*
  assert(isTopLevel('xxx') === true, 'isTopLevel')
  assert(isTopLevel('./xxx') === false, 'isTopLevel')
  assert(isTopLevel('../xxx') === false, 'isTopLevel')
  assert(isTopLevel('/xxx') === false, 'isTopLevel')
  assert(isTopLevel('xxx:/zzz') === false, 'isTopLevel')
  assert(isTopLevel('$') === true, 'isTopLevel')
  assert(isTopLevel('_') === true, 'isTopLevel')
  assert(isTopLevel('$abc') === true, 'isTopLevel')
  assert(isTopLevel('_abc') === true, 'isTopLevel')
  */

  test.next()

});

