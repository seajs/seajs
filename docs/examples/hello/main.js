seajs.config({
    alias: {
        'jquery': 'http://modules.seajs.org/jquery/1.7.2/jquery.js'
    }
});

seajs.use(['./hello'], function(Hello) {
    new Hello()
});