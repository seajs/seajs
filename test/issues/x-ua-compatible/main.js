define(function(require) {

  var test = require('../../test');

  var compatibleElement = document.getElementsByTagName('meta')[1];
  var baseElement = document.getElementsByTagName('base')[0];

  var firstScript = document.getElementsByTagName('script')[0];
  var secondScript = document.getElementsByTagName('script')[1];

  var nextElement = compatibleElement.nextSibling.nextSibling;
  test.assert(nextElement === firstScript, 'script after compatible meta');


  var prevElement = baseElement.previousSibling;
  test.assert(prevElement === secondScript, 'script before base element');

  test.done();

});
