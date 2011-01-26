module.declare(function(require) {

  var inc = require('./biz/increment').increment;
  document.body.innerHTML = 'inc(1) = ' + inc(1);

});
