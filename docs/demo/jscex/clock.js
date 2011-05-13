define(function(require, exports) {

  var Jscex = require('./jscex.async.js');

  var drawHand = function(value, length) {
    ctx.beginPath();

    var angle = Math.PI * 2 * value / 60;
    var x = Math.sin(angle) * length;
    var y = Math.cos(angle) * length;

    ctx.moveTo(100, 100);
    ctx.lineTo(100 + x, 100 - y);
    ctx.stroke();
  }

  var drawClock = function(time) {
    if (!ctx) {
      var h = time.getHours();
      var m = time.getMinutes();
      var s = time.getSeconds();

      var text =
          ((h >= 10) ? h : "0" + h) + ":" +
              ((h >= 10) ? m : "0" + m) + ":" +
              ((h >= 10) ? s : "0" + s);

      document.getElementById("clockText").innerHTML = text;
      return;
    }

    ctx.clearRect(0, 0, 200, 200);

    ctx.beginPath();
    ctx.arc(100, 100, 90, 0, Math.PI * 2, false);
    for (var i = 0; i < 60; i += 5) {
      var angle = Math.PI * 2 * i / 60;
      var x = Math.sin(angle);
      var y = Math.cos(angle);
      ctx.moveTo(100 + x * 85, 100 - y * 85);
      ctx.lineTo(100 + x * 90, 100 - y * 90);
    }
    ctx.stroke();

    drawHand(time.getSeconds(), 80);
    drawHand(time.getMinutes() + time.getSeconds() * 1.0 / 60, 60);
    drawHand(time.getHours() % 12 * 5 + time.getMinutes() * 1.0 / 12, 40);
  }

  var drawClockAsync = eval(Jscex.compile("async", function(interval) {
    while (true) {
      drawClock(new Date());
      $await(Jscex.Async.sleep(interval));
    }
  }));


  var ctx;

  exports.renderTo = function(canvasId) {
    var canvas = document.getElementById(canvasId);

    ctx = canvas.getContext ? canvas.getContext("2d") : null;
    drawClockAsync(1000).start();
  }
});