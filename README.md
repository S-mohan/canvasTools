# CanvasTools
Screenshot tool based on canvas

> 基于Canvas的截图辅助工具集。包含矩形，椭圆，画笔，文字等多种工具以及撤销，保存等各种功能

![CanvasTools](https://img.smohan.net/project/d73e2e41950ea7d342a45fc6a57bd291.jpg)

#### [项目地址](https://smohan.net/lab/canvastools)
#### [DEMO](https://s-mohan.github.io/demo/canvastools/demo.html)
#### [仿知乎截图反馈](https://s-mohan.github.io/demo/canvastools/zhihu.html)

项目构思来源于知乎建议反馈功能中的截图反馈。期初看到该功能，惊为天人，不得不佩服知乎对用户体验的细节追求。然后又对比和参考了QQ截图（基本样式来源于此），花了三天时间完成了`CanvasTools`项目的构建。
截止目前，在完成了大部分功能的同时，也学习了大部分的`Canvas API`：

### 可用功能

- 矩形工具
- 椭圆工具
- 画笔工具
- 文字工具
- 撤销功能 
- 保存功能(`IE10+`)

### 待完成功能

- 橡皮擦工具
- 马赛克工具

### 如何使用

#### 1.使用NPM

- npm install
- npm run build

#### 2.直接使用

1.页面`head`标签中引入
```html
<link rel="stylesheet" href="../dist/canvastools.min.css">
```
2.在`body`中创建`canvas`以及用来放置工具条的容器
```html
...
<canvas id="myCanvas" width="800" height="600"></canvas>
<div id="myCanvasTools"></div>
...
```
3.在 `</body>` 之前调用
```html
<script src="../dist/canvastools.min.js"></script>
<script>
var canvasTools = new CanvasTools(document.getElementById('myCanvas'), {
    container : document.getElementById('myCanvasTools')
})
</script>
```
