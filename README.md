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


### options

更多配置copy[pxtorem](https://github.com/cuth/postcss-pxtorem)

Type: `Object | Null`  
Default:
```js
{
    rootValue: 16,
    unitPrecision: 5,
    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    selectorBlackList: [],
    replace: true,
    mediaQuery: false,
    minPixelValue: 0,
    exclude: /node_modules/i
}
```

- `rootValue` (Number | Function) Represents the root element font size or returns the root element font size based on the [`input`](https://api.postcss.org/Input.html) parameter
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `propList` (Array) The properties that can change from px to rem.
    - Values need to be exact matches.
    - Use wildcard `*` to enable all properties. Example: `['*']`
    - Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
    - Use `!` to not match a property. Example: `['*', '!letter-spacing']`
    - Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']` 
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `replace` (Boolean) Replaces rules containing rems instead of adding fallbacks.
- `mediaQuery` (Boolean) Allow px to be converted in media queries.
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `exclude` (String, Regexp, Function) The file path to ignore and leave as px.
    - If value is string, it checks to see if file path contains the string.
        - `'exclude'` will match `\project\postcss-pxtorem\exclude\path`
    - If value is regexp, it checks to see if file path matches the regexp.
        - `/exclude/i` will match `\project\postcss-pxtorem\exclude\path`
    - If value is function, you can use exclude function to return a true and the file will be ignored.
        - the callback will pass the file path as  a parameter, it should returns a Boolean result.
        - `function (file) { return file.indexOf('exclude') !== -1; }`
- `include` (String, Regexp, Function) The file path to include. 
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
## webpack demo
```js
const pxtoremSettings = remUnit =>
  pxtowhatever({
    unit: "/2px",
    propList: [
      "*",
      "!letter-spacing",
      "!border",
      "!border-top",
      "!border-left",
      "!border-right",
      "!border-bottom"
    ],
    minPixelValue: 1
  });

 rules: [

   {
        test: /\.(scss|sass)$/,
        use: [
          "style-loader",
          "css-loader?minimize",
          {
            loader: "postcss-loader",
            options: {
              plugins: [pxtoremSettings()]
            }
          },

          {
            loader: "sass-loader"
            // options: {
            //   data: '$brand-primary: #000;',
            // },
          }
        ]
      },
 ]

```