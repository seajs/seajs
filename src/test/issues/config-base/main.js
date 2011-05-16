define(function(require) {

  console.log('main factory');

  var a = require('a');
  var b = require('biz/b');
  var c = require('biz/sub/c');

  console.log('a.a = ' + a.a);
  console.log('b.b = ' + b.b);
  console.log('c.c = ' + c.c);

  document.body.appendChild(document.createTextNode('It works!'));
});
