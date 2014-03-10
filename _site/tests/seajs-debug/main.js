define(function(require) {

    var test = require('../test');

    // fake localstorage
    store.set('seajs-debug-config', {
        source: true,
        nocache: true,
        combo: true,
        log: true,
        health: true,
        custom: '{ alias: { "customAlias": "http://a.com/object2.js"}}',
        mapping: [
            ['map-debug', 'mapping-debug']
        ]
    });

    require.async(['seajs-debug'], function() {
        // load correct
        test.assert(document.getElementById('seajs-debug-console'), 'console div');


        // .js -> -debug.js
        test.assert(seajs.resolve('https://a.com/test.js') === 'https://a.com/test-debug.js', 'js -> -debug.js');
        test.assert(seajs.resolve('https://a.com/test-debug.js') === 'https://a.com/test-debug.js', 'js -> -debug.js');

        // .css -> -debug.css
        test.assert(seajs.resolve('https://a.com/test.css') === 'https://a.com/test-debug.css', 'css -> -debug.css');

        // nocache
        seajs.on('fetch', function(data) {
            test.assert(/\?t=\d+/g.test(data.requestUri), 'add timestamp when fetch');
        });
        seajs.on('define', function(data) {
            test.assert(!/\?t=\d+/g.test(data.uri), 'remove timestamp when define');
        });
        // mapping
        seajs.use(['./map-debug', './seajs-find/xx-1', './seajs-find/xx-2'], function(Map) {
            test.assert(Map.name === 'mapping', 'mapping  air');

            // custom alias
            test.assert(seajs.data.alias['customAlias'], 'custom correct');

            // load seajs.log
            test.assert(seajs.log, 'log correct');

            // todo: load seajs.health

            // has seajs.find
            test.assert(seajs.find('seajs-find/xx-1-debug.js').length === 1, 'seajs.find');
            test.assert(seajs.find('seajs-find/xx-1-debug.js')[0].name === '1', 'seajs.find');
            test.assert(seajs.find('seajs-find/xx').length === 2, 'seajs.find');
            test.assert(seajs.find('seajs-find/xx')[0].name === '1', 'seajs.find');
            test.assert(seajs.find('seajs-find/xx')[1].name === '2', 'seajs.find');
            test.assert(seajs.find('seajs-find/zz').length === 0, 'seajs.find');


            test.next();
        });
    });
});