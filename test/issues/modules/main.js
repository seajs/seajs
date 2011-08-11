
seajs.config({
  alias: {
    // for backbone
    'jquery': 'jquery/1.6.2/jquery',
    'underscore': 'underscore/1.1.7/underscore'
  }
});


define(function(require) {

  var test = require('../../test');

  test.assert([].map, 'preload es5-safe');
  test.assert(this.JSON.parse, 'preload json2');


  var Backbone = require('backbone/0.5.3/backbone');
  test.assert(this.Backbone === undefined, 'dont pollute global');
  test.assert(Backbone.VERSION === '0.5.3', 'local variable');

  var Cookie = require('cookie/1.0.0/cookie');
  test.assert(this.Cookie === undefined, 'dont pollute global');
  test.assert(Cookie.version === '1.0.0', 'local variable');

  var $ = require('jquery');
  test.assert(this.$ === undefined, 'dont pollute global');
  test.assert($.fn.jquery === '1.6.2', 'local variable');

  var JSON = require('json/1.0.0/json');
  test.assert(JSON === this.JSON, 'JSON do pollute global');
  test.assert(JSON.parse, 'local variable');

  var Mustache = require('mustache/0.3.1/mustache');
  test.assert(this['Mustache'] === undefined, 'dont pollute global');
  test.assert(Mustache.version === '0.3.1-dev', 'local variable');

  var QueryString = require('querystring/1.0.0/querystring');
  test.assert(this['QueryString'] === undefined, 'dont pollute global');
  test.assert(QueryString.version === '1.0.0', 'local variable');

  var _ = require('underscore');
  test.assert(this['_'] === undefined, 'dont pollute global');
  test.assert(_.VERSION === '1.1.7', 'local variable');

  
  test.done();

});
