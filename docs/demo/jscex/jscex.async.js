define(function(require, exports, module) {

  var Jscex = require('./jscex');

//if ((typeof Jscex) == "undefined") {
//    Jscex = { "builders": { } };
//}

Jscex.Async = { };
/** @constructor */
Jscex.Async.Task = function (delegate) {
    this._delegate = delegate;
    this.status = "ready";
}
Jscex.Async.Task.prototype = {
    start: function (options) {
        if (this.status != "ready") {
            throw "Cannot start in current status";
        }

        var _this = this;

        if (options && options.onSuccess)
            this.attachEvent("success", options.onSuccess);

        if (options && options.onFailure)
            this.attachEvent("failure", options.onFailure);

        if (options && options.onComplete) {
            this.attachEvent("complete", options.onComplete);
        }

        this.status = "running";
        this._delegate.start(function (type, value) {

            if (type == "success") {

                _this.result = value;
                _this.status = "succeeded";
                _this._raiseEvent("success");

            } else if (type == "failure") {

                _this.error = value;
                _this.status = "failed";
                _this._raiseEvent("failure");

            } else {
                throw "Unsupported type: " + type;
            }

            _this._raiseEvent("complete");
            
            this._eventHandlers = null;
        });
    },

    _raiseEvent: function (name) {
        var handlers = this._eventHandlers && this._eventHandlers[name];
        if (!handlers) return;

        for (var i = 0; i < handlers.length; i++) {
            try { handlers[i](this); } catch (ex) { }
        }
    },

    attachEvent: function (name, handler) {
        if (this.status != "ready" && this.status != "running") {
            throw "Cannot attach handler in current status.";
        }

        if (!this._eventHandlers) {
            this._eventHandlers = { };
        }

        if (!this._eventHandlers[name]) {
            this._eventHandlers[name] = [];
        }

        this._eventHandlers[name].push(handler);
    },

    detachEvent: function (name, handler) {
        if (this.status != "ready" && this.status != "running") {
            throw "Cannot detach handler in current status.";
        }

        if (!this._eventHandlers) return false;
        if (!this._eventHandlers[name]) return false;

        throw "Not implemented yet";
    }
};

(function () {

    Jscex.builders["async"] = {

        "binder": "$await",

        "Start": function (_this, task) {

            var delegate = {
                "start": function (callback) {
                    task.start(_this, function (type, value, target) {
                        if (type == "normal" || type == "return") {
                            callback("success", value);
                        } else if (type == "throw") {
                            callback("error", value);
                        } else {
                            throw "Unsupported type: " + type;
                        }
                    });
                }
            };

            return new Jscex.Async.Task(delegate);
        },

        "Bind": function (task, generator) {
            return {
                "start": function (_this, callback) {
                    
                    var onComplete = function (t) {
                        if (t.status == "succeeded") {
                            var nextTask;
                            try {
                                nextTask = generator.call(_this, task.result);
                            } catch (ex) {
                                callback("throw", ex);
                                return;
                            }

                            nextTask.start(_this, callback);
                        } else {
                            callback("throw", task.error);
                        }
                    }

                    if (task.status == "ready") {
                        task.start({ "onComplete": onComplete });
                    } else if (task.status == "running") {
                        task.attachEvent("complete", onComplete);
                    } else {
                        onComplete(task);
                    }
                }
            };
        },

        "Loop": function (condition, update, body, bodyFirst) {
            return {
                "start": function (_this, callback) {
                    
                    var startBody = function (skipUpdate) {
                        body.start(_this, function (type, value, target) {
                            if (type == "normal" || type == "continue") {
                                loop(skipUpdate);
                            } else if (type == "throw" || type == "return") {
                                callback(type, value);
                            } else if (type == "break") {
                                callback("normal");
                            } else {
                                throw 'Invalid type for "Loop": ' + type;
                            }
                        });
                    }
                
                    var loop = function (skipUpdate) {
                        try {
                            if (update && !skipUpdate) {
                                update.call(_this);
                            }

                            if (!condition || condition.call(_this)) {
                                startBody(false);
                            } else {
                                callback("normal");
                            }

                        } catch (ex) {
                            callback("throw", ex);
                        }
                    }
                    
                    if (bodyFirst) {
                        startBody(true);
                    } else {
                        loop(true);
                    }
                }
            };
        },
        
        "Delay": function (generator) {
            return {
                "start": function (_this, callback) {
                    try {
                        var task = generator.call(_this);
                        task.start(_this, callback);
                    } catch (ex) {
                        callback("throw", ex);
                    }
                }
            };
        },

        "Combine": function (t1, t2) {
            return {
                "start": function (_this, callback) {
                    t1.start(_this, function (type, value, target) {
                        if (type == "normal") {
                            try {
                                t2.start(_this, callback);
                            } catch (ex) {
                                callback("throw", ex);
                            }
                        } else {
                            callback(type, value, target);
                        }
                    });
                }
            };
        },

        "Return": function (result) {
            return {
                "start": function (_this, callback) {
                    callback("return", result);
                }
            };
        },

        "Normal": function () {
            return {
                "start": function (_this, callback) {
                    callback("normal");
                }
            };
        },

        "Break": function () {
            return {
                "start": function (_this, callback) {
                    callback("break");
                }
            };
        },

        "Continue": function () {
            return {
                "start": function (_this, callback) {
                    callback("continue");
                }
            };
        },

        "Throw": function (ex) {
            return {
                "start": function (_this, callback) {
                    callback("throw", ex);
                }
            };
        },

        "Try": function (tryTask, catchGenerator, finallyTask) {
            return {
                "start": function (_this, callback) {
                    tryTask.start(_this, function (type, value, target) {
                        if (type != "throw" || !catchGenerator) {
                            if (!finallyTask) {
                                callback(type, value, target);
                            } else {
                                finallyTask.start(_this, function (finallyType, finallyValue, finallyTarget) {
                                    if (finallyType == "normal") {
                                        callback(type, value, target);
                                    } else {
                                        callback(finallyType, finallyValue, finallyTarget);
                                    }
                                });
                            }
                        } else {

                            if (catchGenerator) {

                                var catchTask;
                                try {
                                    catchTask = catchGenerator.call(_this, value);
                                } catch (ex) {
                                    if (finallyTask) {
                                        finallyTask.start(_this, function (finallyType, finallyValue, finallyTarget) {
                                            if (finallyType == "normal") {
                                                callback("throw", ex);
                                            } else {
                                                callback(finallyType, finallyValue, finallyTarget);
                                            }
                                        });
                                    } else {
                                        callback("throw", ex);
                                    }
                                }
                                
                                if (catchTask) {
                                    catchTask.start(_this, function (catchType, catchValue, catchTarget) {
                                        if (catchType == "throw") {
                                            if (finallyTask) {
                                                finallyTask.start(_this, function (finallyType, finallyValue, finallyTarget) {
                                                    if (finallyType == "normal") {
                                                        callback(catchType, catchValue, catchTarget);
                                                    } else {
                                                        callback(finallyType, finallyValue, finallyTarget);
                                                    }
                                                });
                                            } else {
                                                callback(catchType, catchValue, catchTarget);
                                            }
                                        } else {
                                            if (finallyTask) {
                                                finallyTask.start(_this, function (finallyType, finallyValue, finallyTarget) {
                                                    if (finallyType == "normal") {
                                                        callback(catchType, catchValue, catchTarget);
                                                    } else {
                                                        callback(finallyType, finallyValue, finallyTarget);
                                                    }
                                                });
                                            } else {
                                                callback(catchType, catchValue, catchTarget);
                                            }
                                        }  
                                    });
                                }
                            } else {
                                finallyTask.start(_this, function (finallyType, finallyValue, finallyTarget) {
                                    if (finallyType == "normal") {
                                        callback(type, value, target);
                                    } else {
                                        callback(finallyType, finallyValue, finallyTarget);
                                    }
                                });
                            }
                        }
                    });
                }
            };
        }
    };

    var async = Jscex.Async;

    async.sleep = function (delay) {
        var delegate = {
            "start": function (callback) {
                setTimeout(function () { callback("success"); }, delay);
            }
        };

        return new Jscex.Async.Task(delegate);
    }

    async.onEvent = function (ele, ev) {
        var delegate = {
            "start": function (callback) {
                var eventName = "on" + ev;

                var handler = function (ev) {
                    ele[eventName] = null;
                    callback("success", ev);
                }

                ele[eventName] = handler;
            }
        };

        return new Jscex.Async.Task(delegate);
    }

    /*
    async.parallel = function (tasks) {
        var tasksClone = [];
        for (var i = 0; i < tasks.length; i++) {
            tasksClone.push(tasks[i]);
        }
        
        return {
            "start": function (callback) {
                var done = 1;
                var results = [];
                
                var checkFinished = function (index, r) {
                    if (index >= 0) {
                        results[index] = r;
                    }

                    done--;
                    if (done <= 0) {
                        callback("return", results);
                    }
                }
                
                var callbackFactory = function (index) {
                    return function (type, value, target) {
                        checkFinished(index, value);
                    };
                }
                
                for (var i = 0; i < tasksClone.length; i++) {
                    done++;
                    tasksClone[i].start(callbackFactory(i));
                }
                
                checkFinished(-1, null);
            }
        };
    }
    */
    
})();


  module.exports = Jscex;

});
