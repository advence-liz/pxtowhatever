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
