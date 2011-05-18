var k = 'uid', n = 1;
$.plug = function(fn) {
  var t = fn[k];
  if (!t) {
    t = fn[k] = new Date().getTime() + '' + n++;
  }
  if (!this.plug[t]) {
    fn(this);
    this.plug[t] = 1;
  }
};