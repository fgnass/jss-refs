const balancedParens = '([^()]+|\\([^()]*\\))*'
const globalFn = `global\\((${balancedParens})\\)`
const localParts = `(.+?)(?:${globalFn}|$)`
const localRegExp = new RegExp(localParts, 'g')
const classRegExp = /\.(\w+)/g
const ampRegExp = /&/g

function rewriteClasses(selector, fn) {
  return selector.replace(classRegExp, (match, local) => fn(local))
}

function processLocalParts(selector, fn) {
  return selector.replace(localRegExp,
    (match, local, global = '') => fn(local) + global
  )
}

function rewriteLocalClasses(selector, fn) {
  return processLocalParts(selector, sel => rewriteClasses(sel, fn))
}

/**
 * Convert nested rules to separate ones and resolve references to other
 * local/global classes.
 *
 * @param {Rule} rule
 * @api public
 */
export default function jssRefs() {
  return rule => {
    if (rule.type !== 'regular') return
    const {sheet, jss, parent} = rule.options

    let container = sheet || jss

    if (parent && parent.type === 'conditional') {
      container = parent
    }

    for (const prop in rule.style) {
      const selector = prop.replace(ampRegExp, rule.name ? `.${rule.name}` : rule.selector)
      if (selector !== prop) {
        container.createRule(selector, rule.style[prop], rule.options)
        delete rule.style[prop]
      }
    }

    if (!rule.name) return

    const newSel = rewriteLocalClasses(rule.name, className => {
      const refRule = sheet.getRule(className)
      if (!refRule) {
        throw new Error(`No rule named ${className}. Make sure to define it first.`)
      }
      return refRule.selector
    })

    if (newSel !== rule.name) {
      rule.selector = newSel
      delete sheet.classes[rule.name]
    }
  }
}
