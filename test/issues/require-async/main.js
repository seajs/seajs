define(function(require) {

  document.getElementById('test').onclick = function() {

    require.async('./a', function(A) {
      A.click();
    });

  };

});
