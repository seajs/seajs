(function() {
    var report = top.report
    var id = location.href.match(/runner\/([^/]+)\//)[1]
    var stats = {
        suites : 0,
        tests : 0,
        passes : 0,
        pending : 0,
        failures : 0
    }

    var baseResult = {pass: 0, fail: 0, error: 0}
    var start

    window.publish = function(type, name, result) {
        // 计算 result
        if (type === 'testEnd') {
            typeMapping.testEnd(getSuiteResult(result));
            baseResult = result;
            return
        }

        if (type === 'test') {
            baseResult.suiteName = name;
            return
        }

        typeMapping[type](baseResult)
    };


    function sendMessage(action, info) {
        report({
            orderId: id,
            action: action,
            info: info
        })
    }


    function getSuiteResult(result) {
        return {
            suiteName: baseResult.suiteName,
            pass: result.pass - baseResult.pass,
            fail: result.fail - baseResult.fail,
            error: result.error - baseResult.error
        };
    }


    var typeMapping = {
        'start': function(suite) {
            start = (+new Date())
        },

        'test': function(suite) {
        },

        'testEnd': function(suite) {
            stats.tests++
            var passed = suite.fail === 0

            if (passed) {
                stats.passes += suite.pass
                status = 'pass'
            } else {
                stats.failures += suite.fail
                status = 'fail'
            }

            sendMessage(status, {
                parent: suite.suiteName,
                title: suite.suiteName,
                speed: 'fast',
                duration: '100ms'
            });
        },

        'end': function(suite) {
            stats.duration = new Date() - start

            report({
                orderId: id,
                action: 'end',
                info: stats
            })
        }
    };
}());
