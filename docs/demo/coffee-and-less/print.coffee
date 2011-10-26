define (require, exports) ->
  exports.print = (msg) ->
    document.getElementById('out').innerHTML += msg;
  return