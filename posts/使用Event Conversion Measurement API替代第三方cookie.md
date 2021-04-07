Event Conversion Measurement API可以将用户在广告发布网站上的事件与在广告客户网站上的后续事件建立关联，并且不需要如第三方cookie的机制用于跨站点识别用户。
# 概览
- 目前该api只能支持点击事件，在后续的迭代中可能会支持用户的浏览事件。因为记录用户的浏览事件很难做到真正意义上的隐私保护，目前还不支持。
## 如何运作

![Xn96AVosulGisR6Hoj4J.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/be3c8607db5a44b4ad5c7c6e5d998e06~tplv-k3u1fbpfcp-watermark.image)
图片上方除了用户外有三个角色
- adtech.example 广告服务的提供者
- news.example 广告的发布者（如新闻网站一类的高流量网站）
- shoes.example 购买广告服务的网站（如一些商场网站）
1. 首先用户在news.example网站时会加载adtech.example的脚本，这个脚本会加载一个iframe或者a标签用来展示广告。（生成的a标签会带有一些特定的属性，下面会详细的列出）
2. 用户点击这个广告后浏览器会记录下这个事件，并将a标签上特定的属性一并记录下来。
3. 用户点击这个广告之后会跳转到shoes.example这个网站，当然也可能退出之后一段时间之后浏览该网站。
4. 在shoes.example网站用户会做一些操作，adtech.example认定某些操作可以计算广告转化率如登录，购买。那么shoes.example网站就会针对这些事件做一些埋点，当用户触发这些行为后会通知adtech.example具体的事件，然后adtech.example会请求浏览记录这次转化报告，这次报告包含了adtech.example传给浏览器想要记录的数据。
5. 浏览器会在截止日期前将报告上报给adtech.example
如上文使用该api,a标签可以配置一些特定的属性
- impressiondata：自定义的数据，如点击事件的ID或公司的ID
- conversiondestination：预计将为此广告进行转化的网站（如shoes.example）。
- reportingorigin：转换成功后应通知的报告端点（如adtech.example）。
- impressionexpiry：为了隐私的安全，浏览器不会立即上传报告，这个属性设置了无法再为此广告计算转化的截止日期和时间。
# 实现细节
- 首先在news.example网站加载adtech.example的脚本
`script(src=adScriptUrl)`
```js
// adtech.example
app.get('/ad-script', (req, res) => {
  res.set('Content-Type', 'text/javascript')
  const adUrl = `${process.env.ADTECH_URL}/ad`
  res.send(
    `console.info('✔️ Adtech script loaded'); document.write("<iframe src='${adUrl}' allow='conversion-measurement' width=190 height=200 scrolling=no frameborder=1 padding=0></iframe>")`
  )
})
// 生成的 a 标签
app.get('/ad', (req, res) => {
  const href = `${process.env.ADVERTISER_URL}/shoes07`
  const conversionDestination = process.env.ADVERTISER_URL
  const reportingOrigin = process.env.ADTECH_URL
  res.render('ad', {
    href,
    conversiondestination: conversionDestination,
    reportingorigin: reportingOrigin
  })
})
// 为 a 标签生成 impressiondata 用来标识这个事件
a#ad(href=href conversiondestination=conversiondestination impressiondata='' reportingorigin=reportingorigin impressionexpiry='864000000' target='_parent')
  img(width='180' src='/shoes07.png' alt='shoes 07')
script.
  const adLink = document.getElementById('ad')
  adLink.setAttribute(
    'impressiondata',
    Math.floor(Math.random() * 1000000)
  )
```

- 用户点击广告，浏览器将事件记录在本地![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/623c5259cc4746acb63b55f704e6e410~tplv-k3u1fbpfcp-watermark.image)
如图记录下了impressiondata标识此次事件，Impression origin事件触发的地址，
conversiondestination 将会发生转化的地址，reportingorigin 浏览器发送转化报告的地址，Impression Time 事件发送的时间，Expiry Time 报告发送的截止日期。

- 用户跳转的目标网站，并触发一些事件。如在checked Out和 signUp 页面埋点请求adtech.example

```js
// shoes.example
h2 Checked out ✅
    img.pixel(src=adtechRequestUrl height='12' width='12')  
app.get('/checkout', (req, res) => {
  // pass the conversion type to adtech - but more data could be passed e.g. the model purchased
  const conversionType = 'checkout'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  const adtechServerUi = `${process.env.ADTECH_URL}`
  res.render('checkout', { adtechRequestUrl, adtechServerUi })
})
h2 Signed up ✅
    img.pixel(src=adtechRequestUrl height='12' width='12')
app.get('/signup', (req, res) => {
  const conversionType = 'signup'
  const adtechRequestUrl = `${process.env.ADTECH_URL}/conversion?conversion-type=${conversionType}`
  const adtechServerUi = `${process.env.ADTECH_URL}`
  res.render('signup', { adtechRequestUrl, adtechServerUi })
})
```
- adtech.example接收到可以发生转化的事件后请求浏览器，将数据记录在其中。

```js
// adtech.example
const conversionValues = {
  signup: 1,
  checkout: 2
}

app.get('/conversion', (req, res) => {
  const conversionData = conversionValues[req.query['conversion-type']]
  console.log(
    '\x1b[1;31m%s\x1b[0m',
    `🚀 Adtech sends a conversion record request to the browser with conversion data = ${conversionData}`
  )
  // adtech orders the browser to send a conversion report
  res.redirect(
    302,
    `/.well-known/register-conversion?conversion-data=${conversionData}`
  )
})

```

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4eee3f2d5d694f918dde5d44800243ba~tplv-k3u1fbpfcp-watermark.image)
如图浏览器关联上次事件的impressiondata并记录下来，conversionData adtech.example希望记录下的数据，
conversiondestination 将会发生转化的地址，reportingorigin 浏览器发送转化报告的地址，report Time 报告发送的日期，Attribution Credit 此次转化的贡献值。conversionData只有3bits的大小，并且浏览器会对数据进行干扰。会有5%的几率，api会记录一个随机的3bit数据。
如果有多个转化和点击事件关联，每一次转化都会发送但不会超过3个。
- 浏览器会延迟发送报告。在发送转化的几周或者几天。
为了防止利用转化时间获取到用户在目标网站更多的信息，保护用户的隐私。转化报告不会被立刻发送。在一开始点击事件发生之后，将会生成一份计划，计划包含了上报的窗口。窗口可以了理解成一个个时间段。发生在这个窗口期的转化将会在窗口结束前发送。当然报告也不会按照计划发送。如果在计划的时间内浏览器关闭，报告会在浏览器打开后发送。超过impressionexpiry的报告会直接设置成无效。
## 与第三方cookie的比较
- Event Conversion Measurement API是专门为用户行为转化而设计的。像第三方cookie还有很多的其他用途如网站区分人和机器人。
- Event Conversion Measurement API通过数据的限制，有干扰的数据和上报时间的控制，让跨站识别客户变的异常困难。
# 思考

Event Conversion Measurement 通过浏览器关联跨站点的用户行为，通过记录数据的限制和数据的干扰和延迟发送尽可能的保护用户的隐私。但对于广告商无法实时的计算广告的转化率和获取更多的用户行为数据，不知道这将会对现有的淘宝联盟造成什么样的影响。还是说会有另外的方法替代第三方cookie。