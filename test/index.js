'use strict'

function resetJss() {
  return jss.create().use(jssRefs.default());
}

QUnit.test('resolve local class names', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      padding: 0,
    },
    b: {
      color: 'black',
    },
    '.a:hover > .b': {
      color: 'red',
    }
  })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('b'))
  assert.deepEqual(Object.keys(sheet.classes), ['a', 'b'])
  assert.equal(sheet.toString(), `.${sheet.classes.a} {\n  padding: 0;\n}\n.${sheet.classes.b} {\n  color: black;\n}\n.${sheet.classes.a}:hover > .${sheet.classes.b} {\n  color: red;\n}`)
})

QUnit.test('resolve local class names in nested selectors', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      padding: 0,
    },
    b: {
      color: 'black',
      '.a:hover > &': {
        color: 'red',
      }
    },
  })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('b'))
  assert.deepEqual(Object.keys(sheet.classes), ['a', 'b'])
  assert.equal(sheet.toString(), `.${sheet.classes.a} {\n  padding: 0;\n}\n.${sheet.classes.b} {\n  color: black;\n}\n.${sheet.classes.a}:hover > .${sheet.classes.b} {\n  color: red;\n}`)
})


QUnit.test('refs to classes defined afterwards', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      padding: 0,
      '&:hover > .b': {
        color: 'red',
      }
    },
    b: {
      color: 'black',
    },
  })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('b'))
  assert.deepEqual(Object.keys(sheet.classes), ['a', 'b'])
  assert.equal(sheet.toString(), `.${sheet.classes.a} {\n  padding: 0;\n}\n.${sheet.classes.b} {\n  color: black;\n}\n.${sheet.classes.a}:hover > .${sheet.classes.b} {\n  color: red;\n}`)
})

QUnit.test('global selectors', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      padding: 0,
      '&:hover > global(.b:not(.c))': {
        color: 'red',
      }
    },
  })
  assert.ok(sheet.getRule('a'))
  assert.deepEqual(Object.keys(sheet.classes), ['a'])
  assert.equal(sheet.toString(), `.${sheet.classes.a} {\n  padding: 0;\n}\n.${sheet.classes.a}:hover > .b:not(.c) {\n  color: red;\n}`)
})

QUnit.test('global selectors at the top level', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    'global(.b:not(.c))': {
      color: 'red',
    },
  })
  assert.equal(sheet.toString(), `.b:not(.c) {\n  color: red;\n}`)
})

QUnit.test('nesting with space', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '& b': { float: 'left' }
    }
  }, { named: false })
  assert.ok(sheet.getRule('a'))
  assert.ok(Object.keys(sheet.classes), ['a b'])
  assert.equal(sheet.toString(), `a {\n  float: left;\n}\na b {\n  float: left;\n}`)
})

QUnit.test('nesting without space', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b': { float: 'left' }
    }
  }, { named: false })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('ab'))
  assert.equal(sheet.toString(), `a {\n  float: left;\n}\nab {\n  float: left;\n}`)
})

QUnit.test('multi nesting', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b': { float: 'left' },
      '& c': { float: 'left' }
    }
  }, { named: false })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('ab'))
  assert.ok(sheet.getRule('a c'))
  assert.equal(sheet.toString(), `a {\n  float: left;\n}\nab {\n  float: left;\n}\na c {\n  float: left;\n}`)
})

QUnit.test('multi nesting in one selector', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b, &c': { float: 'left' }
    }
  }, { named: false })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('ab, ac'))
  assert.equal(sheet.toString(), `a {\n  float: left;\n}\nab, ac {\n  float: left;\n}`)
})

QUnit.test('deep nesting', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '&b': {
        float: 'left',
        '&c': {
          float: 'left'
        }
      }
    }
  }, { named: false })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('ab'))
  assert.ok(sheet.getRule('abc'))
  assert.equal(sheet.toString(), `a {\n  float: left;\n}\nab {\n  float: left;\n}\nabc {\n  float: left;\n}`)
})

QUnit.test('addRules', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      height: '1px'
    }
  }, { named: false })

  sheet.addRules({
    b: {
      height: '2px',
      '& c': {
        height: '3px'
      }
    }
  })
  assert.equal(sheet.toString(), `a {\n  height: 1px;\n}\nb {\n  height: 2px;\n}\nb c {\n  height: 3px;\n}`)
})

QUnit.test('nesting in a namespaced rule', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      float: 'left',
      '& b': { float: 'left' }
    }
  })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('.a b'))
  assert.equal(sheet.toString(), `.${sheet.classes.a} {\n  float: left;\n}\n.${sheet.classes.a} b {\n  float: left;\n}`)
})

QUnit.test('nesting in a conditional namespaced rule', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      color: 'green'
    },
    '@media': {
      a: {
        '&:hover': { color: 'red' }
      }
    }
  })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('@media'))
  assert.equal(sheet.toString(), `.${sheet.classes.a} {\n  color: green;\n}\n@media {\n  .${sheet.classes.a}:hover {\n    color: red;\n  }\n}`)
})
QUnit.test('double nested rule resolved correctly', function (assert) {
  var jss = resetJss()
  var sheet = jss.createStyleSheet({
    a: {
      '& > li': {
        '&global(.active)': {
          color: 'green'
        }
      }
    },
    b: {
      '& > li': {
        '& > div, & > span,&>div,    &> span': {
          color: 'red'
        }
      }
    }
  })
  assert.ok(sheet.getRule('a'))
  assert.ok(sheet.getRule('b'))
  assert.equal(sheet.toString(), `.${sheet.classes.a} > li.active {\n  color: green;\n}\n.${sheet.classes.b} > li > div, .${sheet.classes.b} > li > span,.${sheet.classes.b} > li>div,    .${sheet.classes.b} > li> span {\n  color: red;\n}`)
})
