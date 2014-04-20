
seajs.config({
  base: '../'
})

define(function(require) {

  var test = require('../../../test')

  //a->b->a
  var a = require('./a')
  //c->d->c, d->e
  var c = require('./c')
  //f->g->h->f, g->i
  var f = require('./f')
  //j->k->j, k->l, j->l->j
  var j = require('./j')
  //m->n->o->m, n->o->n, m->o->m
  var m = require('./m')
  //again
  var m2 = require('./m')
  //module in circular
  var o = require('./o')

  test.assert(a.a === 'a' && a.a2 === 'a2', 'a should be { a: "a", a2: "a2" }')
  test.assert(c.c === 'c' && c.c2 === 'c2', 'c should be { c: "c", c2: "c2" }')
  test.assert(f.f === 'f' && f.f2 === 'f2', 'f should be { f: "f", f2: "f2" }')
  test.assert(j.j === 'j' && j.j2 === 'j2', 'j should be { j: "j", j2: "j2" }')
  test.assert(m.m === 'm' && m.m2 === 'm2', 'm should be { m: "m", m2: "m2" }')
  test.assert(m2.m === 'm' && m2.m2 === 'm2', 'm2 should be { m: "m", m2: "m2" }')
  test.assert(o.o === 'o' && o.o2 === 'o2', 'o should be { o: "o", o2: "o2" }')
  test.next()

});

