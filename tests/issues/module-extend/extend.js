define(function(require, exports, module) {

  var Module = module.constructor;

  Module.prototype.extend = function(r, s, px, sx) {
    if (!s || !r) return r;

    var sp = s.prototype, rp = create(sp);
    r.prototype = rp;

    rp.constructor = r;
    r['superclass'] = sp;
    r['file'] = this.uri;

    // assign constructor property
    if (s !== Object && sp.constructor === Object.prototype.constructor) {
      sp.constructor = s;
    }

    // add prototype overrides
    if (px) {
      mix(rp, px);
    }

    // add object overrides
    if (sx) {
      mix(r, sx);
    }

    return r;
  };


  function mix(r, s) {
    for (var p in s) {
      if (s.hasOwnProperty(p)) {
        r[p] = s[p];
      }
    }
  }

  function F() {
  }

  function create(o) {
    F.prototype = o;
    return new F();
  }

});
