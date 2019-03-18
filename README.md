# pxtowhatever

根据 [pxtorem](https://github.com/cuth/postcss-pxtorem) 魔改，将 px 改为任意单位模式

## 安装

```bash
$ npm i pxtowhatever
```

## 使用方法

在`pxtorem`的基础上去掉了`rootValue`添加`unit`参数

### `unit`的形式为`<operator><multiplier>[suffix]` 

举个例子:`*2rpx` 其中 `*`->`<operator>` `2`->`<multiplier>` `rpx`->`[suffix]`
其中 operator，multiplier 选填 suffix 必填即目前支持以下四种模式

- `rpx`
- `2rpx`
- `*2rpx`
- `/2rpx` 当使用 `pxtorem`的时候设置`rootValue`=16 就相当与设置 `unit`=`/16rem`

更多配置参考[pxtorem](https://github.com/cuth/postcss-pxtorem)

## example

假设你有如下文件 `main.css` `index.js` 其输出结果将跟下面一致

### main.css

```css
.class {
  font-size: 14px;
  line-height: 20px;
  margin: -10px 0.5em;
  padding: 10px 10px;
  border: 2px solid black;
}
```

### index.js

```js
const fs = require("fs")
const postcss = require("postcss")
const pxtowhatever = require("..")
const path = require("path")
const css = fs.readFileSync(path.join(__dirname, "main.css"), "utf8")

;[
  {
    minPixelValue: 0,
    unit: "rpx",
    propList: ["*"]
  },
  {
    minPixelValue: 0,
    unit: "2rpx",
    propList: ["*"]
  },
  {
    minPixelValue: 0,
    unit: "*2rpx",
    propList: ["*"]
  },
  {
    minPixelValue: 0,
    unit: "/2rpx",
    propList: ["*"]
  }
].forEach(opts => {
  process.stdout.write(postcss(pxtowhatever(opts)).process(css).css + "\n")
})
```

### 输出

```bash
> cd example && node index.js

.class {
  font-size: 14rpx;
  line-height: 20rpx;
  margin: -10rpx 0.5em;
  padding: 10rpx 10rpx;
  border: 2rpx solid black;
}

.class {
  font-size: 28rpx;
  line-height: 40rpx;
  margin: -20rpx 0.5em;
  padding: 20rpx 20rpx;
  border: 4rpx solid black;
}

.class {
  font-size: 28rpx;
  line-height: 40rpx;
  margin: -20rpx 0.5em;
  padding: 20rpx 20rpx;
  border: 4rpx solid black;
}

.class {
  font-size: 7rpx;
  line-height: 10rpx;
  margin: -5rpx 0.5em;
  padding: 5rpx 5rpx;
  border: 1rpx solid black;
}
```

## REF

- 开发的时候参考了[pxtorpx](https://www.npmjs.com/package/postcss-pxtorpx)