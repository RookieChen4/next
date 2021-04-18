# 概览
我们都知道js是单线程的，像setTimeout, setInterval之类的方法并不能按我们设想的时间准确执行（涉及Event loop不详细说）。通常可以使用函数setTimeout或setInterval执行一个周期性事件，对于简单的任务，可以实现目标。 真正的问题是多个任务时，如果中间穿插着一些耗时的操作就很可能会影响下一次任务执行的时间。所以我们可以使用一些方法尽可能的按时执行。

# 方法1 使用Date类
我们可以使用系统时钟来补偿计时器的不准确性。 我们通过一系列setTimeout调用中计算出误差，并从下一次迭代中减去该误差。
```js
    const PENDING = 'PENDING'
    const STARTED = 'STARTED'
    const FULFILLED = 'FULFILLED'
    class accurTimer {
        constructor(options) {
            this.state = PENDING
            this.count = 0
            this.timer = options.timer || 100
            this.max = options.max || 1
            this.repeatArgument = options.repeatArgument || (() => {})
            this.onFulfilled = null
        }
        start() {
            this.state = STARTED
            let timeStart = new Date().getTime();
            this.timerId = setTimeout(this.loop.bind(this,timeStart),this.timer)
            return this
        }

        loop(timeStart) {
            if(this.count < this.max) {
                let executime = new Date().getTime()
                let fix = executime - timeStart - this.timer
                setTimeout(this.loop.bind(this,executime),this.timer - fix)
                this.repeatArgument(this.count)
                this.count++
            } else {
                this.state = FULFILLED
                if(this.onFulfilled) {
                    return this.onFulfilled()
                }
            }
        }

        finish(onFulfilled) {
            if(this.state == FULFILLED) {
                return onFulfilled()
            } else {
                this.onFulfilled = onFulfilled
            }
        }

        stop() {
            clearTimeout(this.timerId)
        }
    }
```
我们可以利用其模拟type就像tailwindcss主页那样模拟代码的输入。如
[demo](https://codepen.io/rookiechen4/pen/rNjdYXp)

# 方法2 使用web worker

我们可以使用web worker将周期性的任务放在worker中，尽量减小主线程的影响。
```js
const worker = `
    const timerIdToId = {};
    onmessage = function (event) {
        let data = event.data,
            name = data.name,
            timerId = data.TimerId,
            time;
        if(data.hasOwnProperty('time')) {
            time = data.time;
        }
        switch (name) {
            case 'setInterval':
                timerIdToId[timerId] = setInterval(function () {
                    postMessage({timerId: timerId});
                }, time);
                break;
            case 'clearInterval':
                if (timerIdToId.hasOwnProperty (timerId)) {
                    clearInterval(timerIdToId[timerId]);
                    delete timerIdToId[timerId];
                }
                break;
            case 'setTimeout':
                timerIdToId[timerId] = setTimeout(function () {
                    postMessage({timerId: timerId});
                    if (timerIdToId.hasOwnProperty (timerId)) {
                        delete timerIdToId[timerId];
                    }
                }, time);
                break;
            case 'clearTimeout':
                if (timerIdToId.hasOwnProperty (timerId)) {
                    clearTimeout(timerIdToId[timerId]);
                    delete timerIdToId[timerId];
                }
                break;
        }
    }`

        class WebWorker {
            static maxTimerId = 0x7FFFFFFF;
            constructor(worker) {
                const blob = new Blob([worker])
                this.callbackList = {}
                this.lastTimerId = 0
                this.generateTimerId = this.generateTimerId.bind(this)
                this.setTimeout = this.setTimeout.bind(this)
                this.setInterval = this.setInterval.bind(this)
                this.clearTimeout = this.clearTimeout.bind(this)
                this.clearInterval = this.clearInterval.bind(this)
                this.webWorker = new Worker(URL.createObjectURL(blob))
                return Object.assign(this.webWorker,this)
            }

            generateTimerId() {
                do {
                    if (this.lasttimerId == this.maxTimerId) {
                        this.lasttimerId = 0;
                    } else {
                        this.lasttimerId ++;
                    }
                } while (this.callbackList.hasOwnProperty(this.lasttimerId));
                return this.lasttimerId;
            }

            setTimeout(callback,timer) {
                const timerId = this.generateTimerId()
                this.callbackList[timerId] = {
                    callback: callback,
                    isTimeout: true
                };
                this.webWorker.postMessage({
                    name: 'setTimeout',
                    TimerId: timerId,
                    time: timer
                })
                return timerId
            }

            clearTimeout(timerId) {
                if (this.callbackList.hasOwnProperty(timerId)) {
                    delete this.callbackList[timerId];
                    this.webWorker.postMessage ({
                        name: 'clearTimeout',
                        timerId: timerId
                    });
                }
            }

            setInterval(callback,timer) {
                const timerId = this.generateTimerId()
                this.callbackList[timerId] = {
                    callback: callback
                };
                this.webWorker.postMessage({
                    name: 'setInterval',
                    TimerId: timerId,
                    time: timer
                })
                return timerId
            }

            clearInterval (timerId) {
                if (this.callbackList.hasOwnProperty(timerId)) {
                    delete this.callbackList[timerId];
                    this.webWorker.postMessage ({
                        name: 'clearInterval',
                        timerId: timerId
                    });
                }
            }
        }
        const webWorker = new WebWorker(worker)
        webWorker.onmessage = function (event) {
            let data = event.data,
                timerId = data.timerId
            if (this.callbackList.hasOwnProperty(timerId)) {
                request = this.callbackList[timerId]
                callback = request.callback
                if (request.hasOwnProperty ('isTimeout') && request.isTimeout) {
                    delete this.callbackList[timerId];
                }
                callback()
            }
        };

        let timerId = webWorker.setInterval(() => {console.log('setInterval')},1000)

        webWorker.setTimeout(() => {webWorker.clearInterval(timerId)},3000)
```