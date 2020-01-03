# tailor-

* This is a small program image clipping library *

* 小程序图片裁剪组件 *

## 注册组件

```
 "usingComponents": {

    "tailor": "/components/tailor"

 },
```

## 使用组件

```
<tailor selWidth="420rpx" selHeight="500rpx" bindupload="myUpload" avatarSrc="{{img}}" avatarStyle="width: 210rpx; height: 250rpx;" id="tailor" noTab="true"></tailor>
```

## 注册事件

```
myUpload(rep) {
    this.setData({
        img: rep.detail.path
    })
},
```

## 属性

```bash
selWidth，selHeight 可以设置裁剪框的尺寸

avatarStyle 设置裁剪的图片尺寸

noTab 是否显示裁剪操作按钮

avatarSrc 图片地址
```

**_注意：_**

```bash
组件使用了es6语法和vue的watch属性，需要引入两个库：runtime.js
```

> https://github.com/runtimejs/runtime

```bash
miniprogrampatch.js:
```

> https://github.com/hendiko/miniprogrampatch

```bash
引入后在app.js中注册
const regeneratorRuntime = require('/utils/runtime.js')
const { patchPage, patchComponent } = require('/utils/miniprogrampatch.js')

Page = patchPage(Page)
Component = patchComponent(Component)
```
