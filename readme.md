![JSS logo](https://avatars1.githubusercontent.com/u/9503099?v=3&s=60)

## JSS plugin reference other rules within the same stylesheet

This plugin combines the functionality of
[jss-nested](https://github.com/jsstyles/jss-nested) and
[jss-local-refs](https://github.com/fgnass/jss-local-refs) and can be used
as drop-in replacement for both of those.

## Usage

```js
import jss from 'jss'
import refs from 'jss-refs'

jss.use(refs())

const sheet = jss.createStyleSheet({
  container: {
    padding: '20px',
    '&:hover > .button': {
      background: 'blue'    
    }
  },
  button: {
    background: 'gray'
  }
})
```

All class selectors in a sheet – like the `.button` example above – get
expanded to the generated JSS class name. So `&:hover > .button` will become
`'.container--jss-0-0:hover > .button--jss-0-1`.

Referencing a non-existent name will raise an error. In order to refer to
global classes that have been defined inside another sheet you can use the
`global()` function:

```js
const sheet = jss.createStyleSheet({
  container: {
    padding: '20px',
    '&:hover global(.btn-primary)': {
      background: 'blue'    
    }
  }
})
```

## License

MIT
