---
title: '如何在canvas中实现文字的垂直居中'
date: '2021-04-07'
face: '/images/original.jpg'
---
最近在做一个canvas图文验证功能。为了达到单个文字在指定区域的位置垂直居中放置，遇到一些问题。
# 问题
canvas有textAlign和textBaseline两个属性设置文字的对齐方式。这两个属性是用来设置文本行内整体的对齐方式，但在这两个属性对于单个的字体无法垂直居中的效果。
# 原因
textBaseline是Canvas 2D API 描述绘制文本时，当前文本基线的属性。设置成middle时文本基线就在文本块的中间。如图

![1_kECWormvsqs5bnXxbQni0A.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/20b44fac6b3b434f91a4630352a60d08~tplv-k3u1fbpfcp-watermark.image)

（上方是设置textAlign不同属性时的情形，中间是设置textBaseline不同属性时的情形红线为baseline的位置）

- 首先要知道文本块EM的概念。在文字印刷的时代，每一个文字都会放在一个个方框内形成一个字模，每一个字模是等高的这样就能够整齐的排列。这个字模的高度就称'EM'。起源于大写的字符“M”的宽度；这个字母的比例被做成了方形（因此有了“EM Square”的称呼）如下图
![MetalTypeZoomIn.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f5c5330e5ebc446ca965cffab54c5534~tplv-k3u1fbpfcp-watermark.image)
对于文本块EM，文字并不是垂直居中的摆放在文本块中的。这也就解释了为什么我们设置了`textBaseline = 'middle'`后单个文字不能垂直居中，因为文本块的middle针对的整个行内的文本进行居中，而不是针对单个文字。如图
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9496c4b56704eb2b5a337ef06061332~tplv-k3u1fbpfcp-watermark.image)
# 解决方法 
那么知道了textBaseline属性并不能直接实现单个文字垂直居中，那么我们就来想办法解决它。
基本思想是想办法获取单个文字的高度height，然后`ctx.fillText(text, x, y + height / 2);`来实现文字的垂直居中。
## 方法 1
canvas对于text有measureText方法可以获取TextMetrics对象包含了text尺寸信息。
通过TextMetrics我们可以直接获取到text的width属性，获取文字的宽度。但是对象中却没有height属性直接获取到文字的高度。但是TextMetrics提供了actualBoundingBoxAscent和actualBoundingBoxDescent两个属性。
- actualBoundingBoxAscent属性标明的水平线到渲染文本的矩形边界顶部的距离。
- actualBoundingBoxDescen属性标明的水平线到渲染文本的矩形边界底部的距离。

这个两个属性可以获取当前要渲染文字的高度，还有对应的fontBoundingBoxAscent和fontBoundingBoxDescent属性，下面会提到。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8236a35ef7c84b9a9e75295aa2aa6310~tplv-k3u1fbpfcp-watermark.image)
当我们textBaseline为默认值时将两actualBoundingBoxDescen和actualBoundingBoxAscent相加就时文字当前的高度。

```js
const fix = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
ctx.fillText(text, width / 2, height / 2  + fix/ 2);
```
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cfea893a85d34572adf93f881a4eb2e0~tplv-k3u1fbpfcp-watermark.image)[demo](https://codepen.io/rookiechen4/pen/vYXgvyK?editors=1011)

因为canvas绘制文本时是相对于baseline的，所以对于一些小写字母或者字符超出baseline的字符要设置`ctx.textBaseline = "bottom"; `将基线放到字符的底部才能使用上面的方法。

## 方法2
还可以将要测量的文字放在dom中获取其高度

```js
var getTextHeight = function(font,size) {
	var text = document.createElement('span');
	text.style['fontFamily'] = font ;
	text.style['fontSize'] = size ;
	text.innerHTML = "H";
	var block = document.createElement('div') ;
	block.style.display ="inline-block";
	block.style.width = "1px" ;
	block.style.height = "0px" ; 
	var div = document.createElement('div');
	div.appendChild(text);
	div.appendChild(block)
	document.body.appendChild(div);
	var height = 0 ;
	try {
		block.style.verticalAlign = "bottom" ;
		height = block.offsetTop - text.offsetTop;
	} finally {
		div.remove();
	}
	return height;
}
```
但这个方法获取的是文字的lineHeight并不是单个文本在canvas上渲染的高度。用这个高度实现的垂直居中跟直接设置`textBaseline = 'middle'`效果是一样的。在dom中所测量的高度也对应了TextMetrics的fontBoundingBoxAscent属性和fontBoundingBoxDescent属性
- fontBoundingBoxAscent：属性标明的水平线到渲染文本的所有字体的矩形最高边界顶部的距离
- fontBoundingBoxDescent：属性标明的水平线到渲染文本的所有字体的矩形边界最底部的距离

fontBoundingBox和actualBoundingBox的区别就在于这个**所有**。actualBoundingBox取得的值是针对当前要渲染的值文本，而fontBoundingBox是针对当前字体所有字符形成的行内块的值。
### 比较

```js
const fix = ctx.measureText(text).fontBoundingBoxAscent + ctx.measureText(text).fontBoundingBoxDescent;
console.log(fix,getTextHeight('Arial','80px'))
// 89,91
```
测试了下不同字体和大小下两者差值在1~2px。原因可能在于dom获取的lineHeight中包含了上下的leading。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/027c55de8cd74b4db91bb868317065a8~tplv-k3u1fbpfcp-watermark.image)

[demo](https://codepen.io/rookiechen4/pen/vYXgvyK?editors=1011)


虽然这个方法不能实现我想要的效果但也算拓宽了思路。

# 后续
利用M字符去获取高度。之前说过EM，起源于大写的字符“M”的宽度通过这个M字符间接的获取高度可能就因为这个。还有其他如通过读取像素的方法，后面再来研究一下。

# 参考文献
[Deep dive CSS: font metrics, line-height and vertical-align
](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)

[Design With FontForge](http://designwithfontforge.com/en-US/The_EM_Square.html)

[MDN](https://developer.mozilla.org/zh-CN/)