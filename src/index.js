const ampRegExp = /&/g
const classRegExp = /\.(\w+)/g
const extraPointsRegExp = /\.+(\w+)/g

// The RegExp to process local class selectors is slightly more complex.
// To make it easier to read we build it incrementally:

// First we need a way to handle parens inside a global(...) expression, for
// example `global(.foo:not(nth-child(1)))`:
const balancedParens = '([^()]+|\\([^()]*\\))*'

// Then we look for `global(...)` itself:
const globalFn = `global\\((${balancedParens})\\)`

// Actually we are interested in whatever comes before that (or the end of line):
const localParts = `(.*?)(?:${globalFn}|$)`

// This gives us the final regluar expression:
const localRegExp = new RegExp(localParts, 'g')

/**
 * Rewrite all class selectors in a string by calling the given function.
 * Class selectors inside a global() function are left untouched.
 *
 * @param {String} selector
 * @param {Function} fn
 * @api private
 */
function rewriteLocalClasses(selector, fn) {
  // process only parts that are not inside a global(...) expression
  return selector.replace(localRegExp,
    (match, local, global = '') => {
      // call `fn` for all local class names
      const rewritten = local.replace(classRegExp, (sel, name) => fn(name))
      // add back the global part (if any)
      return rewritten + global
    }
  )
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
    const { sheet, jss, parent } = rule.options

    // Find the container where to add new rules:
    let container = sheet || jss
    if (parent && parent.type === 'conditional') {
      container = parent
    }

    // Look for ampersands in property names which indicates a nested rule:
    Object.keys(rule.style).forEach(prop => {
      const parentSelector = rule.name ? `.${rule.name}` : rule.selector
      const selector = prop.replace(ampRegExp, parentSelector).replace(extraPointsRegExp, '.$1')
      if (selector !== prop) {
        // If the strings differ there was a match.
        // Remove the style declaration and create a new rule:
        container.addRule(selector, rule.style[prop], rule.options)
        delete rule.style[prop]
      }
    })

    // Next we rewrite local class name references in named rules.
    // If this is no named rule, we are already done:
    if (!rule.name) return

    const rewritten = rewriteLocalClasses(rule.name, className => {
      // Look up the rule with the given local name:
      const refRule = sheet.getRule(className)
      if (!refRule) {
        // Referencing non-existent rules raises an error:
        throw new Error(`No local rule found with the name ${className}.`
          + `Make sure to define it or use global(.${className}) instead.`)
      }
      return refRule.selector
    })

    if (rewritten !== rule.name) {
      // The strings differ so there was a match. Update the selector and remove
      // the selector from the classes object (it was no name but a selector).
      rule.selector = rewritten
      delete sheet.classes[rule.name]
    }
  }
}
