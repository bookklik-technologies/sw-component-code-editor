# GrapesJS Component with CodeMirror

A plugin that allows you to edit the code of a component that is selected on the canvas using CodeMirror with syntax highlighting and advanced editing features.

| HTML                                                                                                                                  | CSS                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| <p align="center"><img src="https://raw.githubusercontent.com/bookklik-technologies/sw-component-code-editor/master/preview.png"></p> | <p align="center"><img src="https://raw.githubusercontent.com/bookklik-technologies/sw-component-code-editor/master/preview_css.png"></p> |

## Features

- **CodeMirror Integration**: Full code editor experience with syntax highlighting
- **Accordion Layout**: Toggle between HTML and CSS editors (HTML active by default)
- **Real-time Preview**: Live updates as you edit your code
- **Dark Theme**: Professional VS Code dark theme via @uiw/codemirror-theme-vscode
- **Keyboard Shortcuts**: Standard editor shortcuts supported
- **IntelliSense**: Code completion and suggestions
- **Fallback Support**: Graceful fallback to textarea if CodeMirror fails to load

> Recommended: use [grapesjs-parser-postcss](https://github.com/artf/grapesjs-parser-postcss) with this plugin to avoid issues with `styles` as the default parser is inconsistent and will add a lot of extra rules to your css, more explained [here](https://grapesjs.com/docs/guides/Custom-CSS-parser.html#cssom-results-are-inconsistent)

### HTML

```html
<link
  href="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
  rel="stylesheet"
/>
<script src="https://unpkg.com/grapesjs"></script>

<link
  href="https://unpkg.com/sw-component-code-editor/dist/sw-component-code-editor.min.css"
  rel="stylesheet"
/>
<script src="https://unpkg.com/sw-component-code-editor"></script>

<div id="gjs"></div>
```

### JS

```js
const editor = grapesjs.init({
  container: "#gjs",
  height: "100%",
  fromElement: true,
  storageManager: false,
  //...
  panels: {
    defaults: [
      {
        buttons: [
          //...
          {
            attributes: { title: "Open Code" },
            className: "fa fa-code",
            command: "open-code",
            id: "open-code",
          },
          //...
        ],
        id: "views",
      },
    ],
  },
  //...
  plugins: ["sw-component-code-editor"],
});
```

### CSS

```css
body,
html {
  margin: 0;
  height: 100%;
}
```

## Keyboard Shortcuts

| Shortcut           | Action                 |
| ------------------ | ---------------------- |
| `Ctrl+S` / `Cmd+S` | Save (applies changes) |
| `Ctrl+Z` / `Cmd+Z` | Undo                   |
| `Ctrl+Y` / `Cmd+Y` | Redo                   |
| `Ctrl+F` / `Cmd+F` | Find                   |
| `Tab`              | Indent                 |

## Options

| Option name       | Default value              | Description                                                                          |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `panelId`         | `views-container`          | Id of panel to append code editor.                                                   |
| `appendTo`        | `.gjs-pn-views-container`  | Append code editor to an element not`views-container` (class or id).                 |
| `openState`       | `{ pn: '35%', cv: '65%' }` | Determine width of views panel (`pn`) and canvas (`cv`) in the open state.           |
| `closedState`     | `{ pn: '15%', cv: '85%' }` | Determine width of views panel (`pn`) and canvas (`cv`) in the closed state.         |
| `codeViewOptions` | `{}`                       | CodeMirror configuration options. Pass additional extensions via `extensions` array. |
| `preserveWidth`   | `false`                    | Stop resizing`openState` and `closedState`. Preserve views panel and canvas sizes.   |
| `clearData`       | `false`                    | Remove all`gjs-data` attributes from the component.                                  |
| `editJs`          | `false`                    | Lets you edit component scripts`allowScripts` must be set to true.                   |
| `cleanCssBtn`     | `true`                     | Used to remove css from the Selector Manager.                                        |
| `htmlBtnText`     | `Apply`                    | Save HTML button text.                                                               |
| `cssBtnText`      | `Apply`                    | Save CSS button text.                                                                |
| `cleanCssBtnText` | `Delete`                   | Clean CSS button text.                                                               |

### CodeMirror Specific Options

The `codeViewOptions` object accepts CodeMirror configuration. You can pass additional extensions:

```js
codeViewOptions: {
  extensions: [
    // Add additional CodeMirror extensions here
  ];
}
```

> Tip: [grapesjs-script-editor](https://github.com/Ju99ernaut/grapesjs-script-editor) is better suited for editing scripts instead of using `editJs`, reason being `editJs` will inject scripts as separate components onto the canvas which often interferes with the main editor. [grapesjs-script-editor](https://github.com/Ju99ernaut/grapesjs-script-editor) avoids this by injecting scripts directly into a component therefore avoiding the use of `allowScripts`.

> `cleanCssBtn`: When you delete a selector in the `code-editor` it is still in the `Selector Manager` therefore it will still affect the component after saving, this button removes the selector from both the `code-editor` and `Selector Manager`. Only valid css rules can be removed eg `.class{ color: blue }`

## Download

- CDN
  - `https://unpkg.com/sw-component-code-editor`
- NPM
  - `npm i sw-component-code-editor`
- GIT
  - `git clone https://github.com/bookklik-technologies/sw-component-code-editor.git`

## Usage

Directly in the browser

```html
<link
  href="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
  rel="stylesheet"
/>
<script src="https://unpkg.com/grapesjs"></script>

<link href="./dist/sw-component-code-editor.min.css" rel="stylesheet" />
<script src="./dist/sw-component-code-editor.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container: '#gjs',
      // ...
      panels: { /* add panel button with command open-code */}
      plugins: ['sw-component-code-editor'],
      pluginsOpts: {
        'sw-component-code-editor': { /* options */ }
      }
  });
</script>
```

Modern javascript

```js
import grapesjs from 'grapesjs';
import plugin from 'sw-component-code-editor';
import 'grapesjs/dist/css/grapes.min.css';
import 'sw-component-code-editor/dist/sw-component-code-editor.min.css';

const editor = grapesjs.init({
  container : '#gjs',
  // ...
  plugins: [plugin],
  pluginsOpts: {
    [plugin]: { /* options */ }
  }
  // or
  plugins: [
    editor => plugin(editor, { /* options */ }),
  ],
});
```

Adding after `editor` initialization

```js
const pn = editor.Panels;
const panelViews = pn.addPanel({
  id: "views",
});
panelViews.get("buttons").add([
  {
    attributes: {
      title: "Open Code",
    },
    className: "fa fa-file-code-o",
    command: "open-code",
    togglable: false, //do not close when button is clicked again
    id: "open-code",
  },
]);
```

## Development

Clone the repository

```sh
$ git clone https://github.com/bookklik-technologies/sw-component-code-editor.git
$ cd sw-component-code-editor
```

Install dependencies

```sh
$ npm i
```

Build css

```sh
$ npm run build:css
```

Start the dev server

```sh
$ npm start
```

Build the source

```sh
$ npm run build
```

## Technical Details

- **CodeMirror Version**: 6.x (bundled)
- **Supported Languages**: HTML, CSS with syntax highlighting
- **Theme**: VS Code dark theme via @uiw/codemirror-theme-vscode
- **Fallback**: Textarea with basic styling if CodeMirror fails to load
- **Layout**: Accordion style (HTML default active)
- **Dependencies**: codemirror, @codemirror/lang-html, @codemirror/lang-css, @uiw/codemirror-theme-vscode

## License

MIT
