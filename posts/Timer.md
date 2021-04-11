---
title: '如何在js中使用一个准确的timer'
date: '2021-04-11'
face: '/images/original.jpg'
---

# 概览
我们都知道js是单线程的，像setTimeout, setInterval之类的方法并不能按我们设想的时间准确执行（涉及Event loop不详细说）。那么setTimeout, setInterval的执行会产生误差，那我们有没有方法将误差尽可能的缩小来达到类似准确执行的效果呢。总结一下有下面那么几种：

# 方法1
我们可以使用系统时钟来补偿计时器的不准确性。 我们通过一系列setTimeout调用中计算出误差，并从下一次迭代中减去该误差。
```js
function accuTime(timer, max, repeatArgument, callbackArgument) {
  const counter = 1;
  const init = t => {
    let timeStart = new Date().getTime();
    setTimeout(function() {
      if (counter < max) {
        let fix = new Date().getTime() - timeStart - timer;
        init(t - fix);
        counter++;
        repeatArgument();
      } else {
        callbackArgument();
      }
    }, t);
  };
  init(timer);
}
```