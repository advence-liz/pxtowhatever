'use strict'

const postcss = require('postcss')
const pxRegex = require('./lib/pixel-unit-regex')
const filterPropList = require('./lib/filter-prop-list')
const type = require('./lib/type')

const defaults = {
  unitPrecision: 5,
  unit: 'rpx',
  selectorBlackList: [],
  propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: null,
  include: null
}

const legacyOptions = {
  unit_precision: 'unitPrecision',
  selector_black_list: 'selectorBlackList',
  prop_white_list: 'propList',
  media_query: 'mediaQuery',
  propWhiteList: 'propList'
}
const unitPattern = /(^[\*/])?(\d+)?(\S+)/

module.exports = postcss.plugin('postcss-pxtorpx', function (options) {
  if (!unitPattern.test(options.unit)) {
    console.error(`unit格式不符合要求
    目前支持如下形式:<operator><multiplier>[suffix]
    rpx
    2rpx
    *2rpx
    /2rpx
    `)
    process.exit(0)
  }
  convertLegacyOptions(options)
  const opts = { ...defaults, ...options }

  const pxReplace = createPxReplace(opts.unitPrecision, opts.minPixelValue, opts.unit)

  const satisfyPropList = createPropListMatcher(opts.propList)

  return function (css) {
    const filePath = css.source.input.file
    const exclude = opts.exclude
    if (
      exclude &&
      ((type.isFunction(exclude) && exclude(filePath)) ||
        (type.isString(exclude) && filePath.indexOf(exclude) !== -1) ||
        filePath.match(exclude) !== null)
    ) {
      return
    }
    const include = opts.include
    if (
      include &&
      ((type.isFunction(include) && !include(filePath)) ||
        (type.isString(include) && filePath.indexOf(include) === -1) ||
        filePath.match(include) === null)
    ) {
      return
    }
    css.walkDecls(function (decl, i) {
      // This should be the fastest test and will remove most declarations
      if (decl.value.indexOf('px') === -1) {
        return
      }

      if (!satisfyPropList(decl.prop)) {
        return
      }

      if (blacklistedSelector(opts.selectorBlackList, decl.parent.selector)) {
        return
      }

      const value = decl.value.replace(pxRegex, pxReplace)

      // if rpx unit already exists, do not add or replace
      if (declarationExists(decl.parent, decl.prop, value)) {
        return
      }

      if (opts.replace) {
        decl.value = value
      } else {
        decl.parent.insertAfter(
          i,
          decl.clone({
            value: value
          })
        )
      }
    })

    if (opts.mediaQuery) {
      css.walkAtRules('media', function (rule) {
        if (rule.params.indexOf('px') === -1) {
          return
        }
        rule.params = rule.params.replace(pxRegex, pxReplace)
      })
    }
  }
})

function convertLegacyOptions(options) {
  if (typeof options !== 'object') {
    return
  }
  if (
    ((typeof options['prop_white_list'] !== 'undefined' && options['prop_white_list'].length === 0) ||
      (typeof options.propWhiteList !== 'undefined' && options.propWhiteList.length === 0)) &&
    typeof options.propList === 'undefined'
  ) {
    options.propList = ['*']
    delete options['prop_white_list']
    delete options.propWhiteList
  }
  Object.keys(legacyOptions).forEach(function (key) {
    if (options.hasOwnProperty(key)) {
      options[legacyOptions[key]] = options[key]
      delete options[key]
    }
  })
}

function createPxReplace(unitPrecision, minPixelValue, unit) {
  return function (m, $1) {
    if (!$1) {
      return m
    }
    const pixels = parseFloat($1)
    if (pixels < minPixelValue) {
      return m
    }

    const [match, operator = '*', multiplier = 1, suffix] = unit.match(unitPattern)
    const num = operator === '*' ? pixels * multiplier : pixels / multiplier
    const fixedVal = toFixed(num, unitPrecision)
    return fixedVal === 0 ? '0' : fixedVal + suffix
  }
}
// 下面的 multiplier 跟参数 multiplier 完全没有关系
function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

function declarationExists(decls, prop, value) {
  return decls.some(function (decl) {
    return decl.prop === prop && decl.value === value
  })
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') {
    return
  }
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1
    }
    return selector.match(regex)
  })
}

function createPropListMatcher(propList) {
  const hasWild = propList.indexOf('*') > -1
  const matchAll = hasWild && propList.length === 1
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList)
  }
  return function (prop) {
    if (matchAll) {
      return true
    }
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(function (m) {
          return prop.indexOf(m) > -1
        }) ||
        lists.startWith.some(function (m) {
          return prop.indexOf(m) === 0
        }) ||
        lists.endWith.some(function (m) {
          return prop.indexOf(m) === prop.length - m.length
        })) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(function (m) {
          return prop.indexOf(m) > -1
        }) ||
        lists.notStartWith.some(function (m) {
          return prop.indexOf(m) === 0
        }) ||
        lists.notEndWith.some(function (m) {
          return prop.indexOf(m) === prop.length - m.length
        })
      )
    )
  }
}
