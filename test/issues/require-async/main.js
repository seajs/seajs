define(function(require) {

  document.getElementById('test').onclick = function() {

    require.async(['./a.js', './a.css', './x.js'], function(A) {
      A.click();
    });

  };

});
