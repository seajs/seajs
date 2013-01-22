
seajs.config({
  preload: ['./modules/preload/a']
});


var count = 0;

function done(test) {
  if (++count === 2) {
    test.done();
  }
}


seajs.use(['./test'], function(test) {
  test.assert(this.A === 'a', 'preload a.js is ok');
  done(test);
});


seajs.config({
  preload: ['./modules/preload/b']
});

seajs.use(['./test'], function(test) {
  test.assert(this.B === 'b', 'preload b.js is ok');
  done(test);
});
