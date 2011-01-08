/**
 * Jasmine Lite
 * @author: lifesinger@gmail.com
 */
var JasmineLite = {
    Cases: [],
    Specs: []
};

function describe(name, fn) {
    JasmineLite.Cases.push({ name: name, fn: fn });
}

function it(desc, fn) {
    JasmineLite.Specs.push({ desc: desc, fn: fn });
}

function xit() {
}

function Expect(actual) {
    this.actual = actual;
}

Expect.prototype = {
    toBe: function(expected) {
        if (this.actual !== expected) {
            throw {
                type: 'Jasmine',
                msg: 'expected ' + this.actual + ' to be ' + expected
            };
        }
    }
};

function expect(actual) {
    return new Expect(actual);
}

function report(passed, desc, msg) {
    var pre = passed || '';
    if(typeof passed === 'boolean') {
        pre = passed ? '  [passed] ' : '  [failed] ';
    }
    console.log(pre + (desc || '') + (msg ? ': ' + msg : ''));
}

JasmineLite.excute = function() {
    var JL = this, i, j, cl, sl, c, spec;

    for (i = 0,cl = JL.Cases.length; i < cl; i++) {
        c = JL.Cases[i];

        // populate specs
        c.fn();

        // start run specs
        report(c.name);

        for (j = 0,sl = JL.Specs.length; j < sl; j++) {
            spec = JL.Specs[j];
            try {
                spec.fn();
                report(true, spec.desc);
            } catch(ex) {
                if (ex.type === 'Jasmine') {
                    report(false, spec.desc, ex.msg);
                } else {
                    throw ex;
                }
            }
        }

        // clear
        JL.Specs = [];
    }
};
