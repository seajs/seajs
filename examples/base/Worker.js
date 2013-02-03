/*
 * dn-web
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    base/Worker.js
 * desc:    串/并行同步模块
 * author:  yuanhongliang
 * date:    $Date: 2011-04-28 23:44:45 +0800 (Thu, 28 Apr 2011) $
 */
define(['base/EventDispatcher'], function(EventDispatcher){
/**
 * @constructor
 * @extends {EventDispatcher}
 */
function AbstractWorker() {
    EventDispatcher.call(this);
    this.isDone = false;
};
baidu.inherits(AbstractWorker, EventDispatcher);

/**
 * @type {string}
 * @const
 */
AbstractWorker.DoneEvent = 'DONE';

/**
 * work的启动函数，每个work都需要重新实现这个函数.
 */
AbstractWorker.prototype.start = function() {
    throw 'Not implemented';
};

/**
 * 工作完成
 */
AbstractWorker.prototype.done = function() {
    this.isDone = true;
    this.trigger(AbstractWorker.DoneEvent, this);
};

/**
 * 添加完成事件的处理函数
 * @param {Function} listener 处理函数.
 */
AbstractWorker.prototype.addDoneListener = function(listener) {
    this.addListener(AbstractWorker.DoneEvent, listener);
};

/**
 * 删除完成事件的处理函数
 * @param {Function} listener 处理函数.
 */
AbstractWorker.prototype.removeDoneListener = function(listener) {
    this.removeListener(AbstractWorker.DoneEvent, listener);
};

/**
 * 访问本地的变量
 * @constructor
 * @extends {AbstractWorker}
 * @param {*} data 本地的变量.
 * @param {Function} callback 回调函数，用来处理这个变量.
 */
function LocalWorker(data, callback) {
  AbstractWorker.call(this);

  /**
   * @private
   * @type {*}
   */
  this._data = data;

  /**
   * @private
   * @type {Function}
   */
  this._callback = callback;
};
baidu.inherits(LocalWorker, AbstractWorker);

/**
 * @inheritDoc
 */
LocalWorker.prototype.start = function() {
  this._callback(this._data);
  this.done();
};

/**
 * 异步函数工作器
 * @constructor
 * @extends {AbstractWorker}
 * @param {Function} func 异步函数.
 * @param {...*} var_args 请求参数.
 */
function FuncWorker(func, var_args) {
    AbstractWorker.call(this);

    var me = this;
    me.func = func;
    me.callback = arguments[arguments.length - 1];
    me.args = [];
    for (var i = 1; i < arguments.length - 1; i++) {
        me.args.push(arguments[i]);
    }
    me.args.push(function() {
        me.callback.apply(window, arguments);
        me.done();
    });
};
FuncWorker.prototype = function() {
    return {
        start: function() {
            this.func.apply(window, this.args);
        }
    };
}();
baidu.inherits(FuncWorker, AbstractWorker);


/**
 * @constructor
 * @extends {AbstractWorker}
 * @param {number} ms 毫秒级别.
 * @param {Function} callback 回调函数.
 */
function TimeoutWorker(ms, callback) {
    AbstractWorker.call(this);

    this.ms = ms;
    this.callback = callback;
};
baidu.inherits(TimeoutWorker, AbstractWorker);

/** @inheritDoc */
TimeoutWorker.prototype.start = function() {
    var me = this;
    setTimeout(function() {
        me.callback();
        me.done();
    }, me.ms);
};

/**
 * AbstractWorkerManager
 * @constructor
 * @extends {AbstractWorker}
 */
function AbstractWorkerManager() {
    AbstractWorker.call(this);

    /** @type {Array} */
    this.workers = [];
};
baidu.inherits(AbstractWorkerManager, AbstractWorker);

/**
 * 给WorkerManager添加一个Worker
 * @param {AbstractWorker} worker 要添加的worker.
 */
AbstractWorkerManager.prototype.addWorker = function(worker) {
    this.workers.push(worker);
    worker.addDoneListener(baidu.fn.bind(this._workerDone, this));
};

/**
 * 删除一个Worker
 * @param {AbstractWorker} worker 要删除的worker.
 */
AbstractWorkerManager.prototype.removeWorker = function(worker) {
    for (var i = this.workers.length - 1; i >= 0; i--) {
        if (this.workers[i] === worker) {
            this.workers.splice(i, 1);
            break;
        }
    }
};

/**
 * @private
 * @param {AbstractWorker} worker 已经完成工作的worker.
 */
AbstractWorkerManager.prototype._workerDone = function(worker) {
    throw 'Not implemented';
};


/**
 * ParallelWorkerManager
 * @constructor
 * @extends {AbstractWorkerManager}
 */
function ParallelWorkerManager() {
    AbstractWorkerManager.call(this);
};
ParallelWorkerManager.prototype = function() {
    return {
        start: function() {
            this.counter = this.workers.length;
            if (this.counter === 0) {
                this.done();
                return;
            }
            for (var i = 0; i < this.workers.length; i++) {
                if (!this.workers[i].isDone) {
                    this.workers[i].start();
                } else {
                    this._workerDone(this.workers[i]);
                }
            }
        },

        _workerDone: function(worker) {
            this.counter--;
            if (this.counter === 0) {
                this.done();
            }
        }
    };
}();
baidu.inherits(ParallelWorkerManager, AbstractWorkerManager);

/**
 * @constructor
 * @extends {AbstractWorkerManager}
 */
function SerialWorkerManager() {
    AbstractWorkerManager.call(this);
};
SerialWorkerManager.prototype = function() {
    return {
        start: function() {
            if (this.workers.length === 0) {
                this.done();
                return;
            }
            for (var i = 0; i < this.workers.length; i++) {
                if (!this.workers[i].isDone) {
                    this.workers[i].start();
                    break;
                }
            }
        },

        _workerDone: function(worker) {
            var len = this.workers.length, i;
            if (worker === this.workers[len - 1]) {
                this.done();
            } else {
                // 找出完成worker的index。
                for (i = 0; i < len - 1; i++) {
                    if (this.workers[i] === worker) {
                        break;
                    }
                }

                // 查找完成worker的下一个未完成worker，找到则start，找不到说明已全部完成。
                for (i = i + 1; i < len; i++) {
                    if (!this.workers[i].isDone) {
                        this.workers[i].start();
                        break;
                    } else if (i === len - 1) {
                        this.done();
                    }
                }
            }
        }
    };
}();
baidu.inherits(SerialWorkerManager, AbstractWorkerManager);

return {
  AbstractWorker: AbstractWorker,
  LocalWorker: LocalWorker,
  FuncWorker: FuncWorker,
  TimeoutWorker: TimeoutWorker,
  AbstractWorkerManager: AbstractWorkerManager,
  ParallelWorkerManager: ParallelWorkerManager,
  SerialWorkerManager: SerialWorkerManager
}

});
