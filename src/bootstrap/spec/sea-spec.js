describe('sea.js', function() {

  var global = S.global,
      doc = global['document'],
      isWeb = !!global['setInterval'],
      noop = function() {
      };

  it('should not deprive existed members in S.', function() {
    expect(S['existed']).toBe(1);
  });

  it('has basic information.', function() {
    expect(typeof S.version).toBe('string');
    expect(typeof S.global).toBe('object');
  });

  it('has some debug helpers.', function() {
    expect(S.DEBUG).toBe(true);
    expect(typeof S.log).toBe('function');
    expect(typeof S.error).toBe('function');

    S.log('test log');
    S.log('test warn', 'warn');

    try {
      S.error('test error');
      expect('dead code').toBe('reachable');
    } catch(e) {
    }
  });

  it('has function S.type.', function() {

    expect(S.type(null)).toBe('null');

    expect(S.type(undefined)).toBe('undefined');
    expect(S.type()).toBe('undefined');

    expect(S.type(true)).toBe('boolean');
    expect(S.type(false)).toBe('boolean');
    expect(S.type(Boolean(true))).toBe('boolean');

    expect(S.type(1)).toBe('number');
    expect(S.type(0)).toBe('number');
    expect(S.type(Number(1))).toBe('number');

    expect(S.type('')).toBe('string');
    expect(S.type('a')).toBe('string');
    expect(S.type(String('a'))).toBe('string');

    expect(S.type({})).toBe('object');

    expect(S.type(/foo/)).toBe('regexp');
    expect(S.type(new RegExp('asdf'))).toBe('regexp');

    expect(S.type([1])).toBe('array');

    expect(S.type(new Date())).toBe('date');

    expect(S.type(new Function('return;'))).toBe('function');
    expect(S.type(noop)).toBe('function');

    expect(S.type(global)).toBe('object');

    if (isWeb) {
      expect(S.type(doc)).toBe('object');
      expect(S.type(doc.body)).toBe('object');
      expect(S.type(doc.createTextNode('foo'))).toBe('object');
      expect(S.type(doc.getElementsByTagName('*'))).toBe('object');
    }
  });
});
