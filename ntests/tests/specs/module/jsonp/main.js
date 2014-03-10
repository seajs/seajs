define(function(require) {

  var test = require('../../../test');
  var tmpl = require('./tmpl.js?20110528')

  var a = require('./a.js?t=20110528')
  test.assert(a.name === 'a', 'It works!')

  require.async('./data.js', function(data) {
    var out = to_html(tmpl, data)
    test.assert(out === 'My name is Frank Wang, I love JavaScript', out)
    test.next()
  });


  function to_html(str, data) {
    return str.replace(/\{\{([^{}]+)\}\}/g, function(match, name) {
      return data[name] ? data[name] : match
    })
  }

});
