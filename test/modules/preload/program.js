
seajs.config({
  preload: ['./modules/preload/a']
});

seajs.use(['./test'], function(test) {
  test.assert(this.A === 'a', 'preload a.js is ok');
});


seajs.config({
  preload: ['./modules/preload/b']
});

seajs.use(['./test'], function(test) {
  test.assert(this.B === 'b', 'preload b.js is ok');
  test.done();
});
