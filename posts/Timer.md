---
title: '如何在js中使用一个准确的timer'
date: '2021-04-11'
face: '/images/original.jpg'
---

# 概览
我们都知道js是单线程的，像setTimeout, setInterval之类的方法并不能按我们设想的时间准确执行（涉及Event loop不详细说）。通常可以使用函数setTimeout或setInterval执行一个周期性事件，对于简单的任务，可以实现目标。 真正的问题是多个任务需要同步（同步调）时，这种误差就会越来越大，最终造成不好的影响。（就好比多个乐器按照不同的时间周期同步演奏，如果存在这些误差，那么长此以往就乱了套。）那我们有没有方法将误差尽可能的缩小来达到类似准确执行的效果呢。

# 方法1
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



