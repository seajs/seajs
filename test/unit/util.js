define(function(require) {

  var test = require('../test');
  var util = seajs.pluginSDK.util;

  test.assert(util.dirname('a/b/c.js') === 'a/b/', 'dirname');
  test.assert(util.dirname('d.js') === './', 'dirname');
  test.assert(util.dirname('') === './', 'dirname');
  test.assert(util.dirname('xxx') === './', 'dirname');
  test.assert(util.dirname('http://cdn.com/js/file.js') === 'http://cdn.com/js/', 'dirname');
  test.assert(util.dirname('http://cdn.com/js/file.js?t=xxxxx') === 'http://cdn.com/js/', 'dirname');

  test.assert(util.realpath('./a//b/../c') === 'a/c', 'realpath');
  test.assert(util.realpath('file:///a//b/c') === 'file:///a/b/c', 'realpath');
  test.assert(util.realpath('http://a//b/c') === 'http://a/b/c', 'realpath');
  test.assert(util.realpath('a/b/c') === 'a/b/c', 'realpath');

  test.assert(util.normalize('a/b/c') === 'a/b/c.js', 'normalize');
  test.assert(util.normalize('a/b/c.js') === 'a/b/c.js', 'normalize');
  test.assert(util.normalize('a/b/c.css') === 'a/b/c.css', 'normalize');
  test.assert(util.normalize('a/b/c.d') === 'a/b/c.d.js', 'normalize');
  test.assert(util.normalize('c?t=20110525') === 'c?t=20110525', 'normalize');
  test.assert(util.normalize('c?t=20110525#') === 'c?t=20110525', 'normalize');
  test.assert(util.normalize('a/b/c.json#') === 'a/b/c.json', 'normalize');
  test.assert(util.normalize('a/b/') === 'a/b/', 'normalize');

  seajs.config({
        alias: {
          'jquery': 'jquery/1.6.1/jquery-debug'
          ,'app': 'app/1.2/app'
          ,'router': 'router.js?t=20110525'
        }
      });
  test.assert(util.parseAlias('jquery') === 'jquery/1.6.1/jquery-debug', 'parseAlias');
  test.assert(util.parseAlias('app') === 'app/1.2/app', 'parseAlias');
  test.assert(util.parseAlias('http://test.com/router') === 'http://test.com/router', 'parseAlias');
  test.assert(util.parseAlias('#jquery') === 'jquery', 'parseAlias');

  test.done();
});
