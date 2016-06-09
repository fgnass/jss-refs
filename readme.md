![JSS logo](https://avatars1.githubusercontent.com/u/9503099?v=3&s=60)

## JSS plugin to resolve local classNames in selectors

Sometimes you want to craft rules that refer to more than one local class name,
so using [jss-nested](https://github.com/jsstyles/jss-nested) is not an option.

For example if you want to restyle an element when it's parent is hovered like
in the following use case.

## Usage example

```javascript
import jss from 'jss'
import localRefs from 'jss-local-refs'

jss.use(localRefs())

const sheet = jss.createStyleSheet({
  container: {
    padding: '20px'
  },
  button: {
    background: 'red'
  },
  '.container:hover > .button': {
    background: 'blue'    
  }
})
```

```javascript
console.log(sheet.toString())
```
```css
.container--jss-0-0 {
  padding: 20px;
}
.button-jss-0-1 {
  background: red;
}
.container--jss-0-0:hover > .button-jss-0-1 {
  background: blue;
}
```

```javascript
console.log(sheet.classes)
```
```javascript
{
  container: "container--jss-0-0",
  button: "button-jss-0-1"
}
```

## Run tests

```bash
npm install
npm test
```

## License

MIT
