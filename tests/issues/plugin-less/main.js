define(function(require) {

  var test = require('../../test');

  require('./a.less');
  test.assert(find('a_less'), 'a.less is ok');
  test.done();


  function find(flag) {
    var styles = document.getElementsByTagName('style');

    for (var i = 0, len = styles.length; i < len; i++) {
      var s = styles[i];
      var id = s.id;
      if (id && ~id.indexOf(flag)) {
        return s;
      }
    }
  }

});
