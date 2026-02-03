# AGENT.MD

> [!IMPORTANT]
> This document serves as the primary context source for AI agents working on the `sw-component-code-editor` repository. It outlines the project structure, technology stack, and development workflows.

## Project Overview
**sw-component-code-editor** is a plugin for [GrapesJS](https://grapesjs.com/) that integrates [CodeMirror](https://codemirror.net/) with the VS Code dark theme. It allows users to edit the HTML and CSS of a selected GrapesJS component with syntax highlighting and advanced editing features.

## Technology Stack
- **Core Framework**: [GrapesJS](https://grapesjs.com/) (Plugin Architecture)
- **Editor Engine**: [CodeMirror 6](https://codemirror.net/) (bundled)
- **Theme**: [@uiw/codemirror-theme-vscode](https://www.npmjs.com/package/@uiw/codemirror-theme-vscode)
- **Language Support**: @codemirror/lang-html, @codemirror/lang-css
- **Styling**: SASS (`.scss`)
- **Layout**: Accordion (Custom implementation)
- **Build Tools**:  
    - `grapesjs-cli` (for bundling and serving)
    - `sass` (for compiling CSS)

## Project Hierarchy & Key Files

### Root
- `package.json`: Project dependencies and scripts.
- `README.md`: User documentation, usage, and options.

### Source `src/`
The core logic resides in the `src` directory.

| File/Directory | Description |
| :--- | :--- |
| `src/index.js` | **Entry Point**. Exports the plugin function. Initializes default options and loads commands. registers the plugin with GrapesJS. |
| `src/commands.js` | Defines GrapesJS commands (e.g., `open-code`) that trigger the editor interface. |
| `src/code-editor/` | **Core Logic**. Contains the implementation of the code editor UI and behavior. |
| `src/code-editor/index.js` | The main class/functionality for the Code Editor. Handles CodeMirror initialization, Accordion logic, and data binding with GrapesJS components. |
| `src/styles.scss` | Main SASS file for plugin styling. |
| `src/consts.js` | Constants used throughout the plugin. |

## Architecture & Patterns

### Plugin Registration
The plugin follows the standard GrapesJS plugin pattern, exporting a function that takes the `editor` instance and `options`.
```javascript
export default (editor, opts = {}) => { ... }
```

### Command-Based Trigger
The editor is not always visible. It is triggered via a GrapesJS command (`open-code`), usually bound to a button in the panels (configured in `README.md` usage examples).

### Component Data Binding
- The editor reads the HTML and CSS from the *selected* GrapesJS component.
- Changes in CodeMirror are applied back to the component (updates `innerHTML` or styles).

## Development Workflow

### Requirements
- Node.js (v14+ is recommended due to `openssl-legacy-provider` usage in scripts).

### Setup
```bash
npm install
```

### Local Development
Starts the dev server with `grapesjs-cli serve`.
```bash
npm start
```
*Note: The `start` script sets `NODE_OPTIONS=--openssl-legacy-provider` to handle legacy OpenSSL compatibility if needed.*

### Building
Builds the production bundle (`dist/sw-component-code-editor.min.js`).
```bash
npm run build
```

### Compiling CSS
Builds the CSS bundle (`dist/sw-component-code-editor.min.css`).
```bash
npm run build:css
```

## Rules & Guidelines
- **Visuals**: Maintain the "VS Code Dark" aesthetic via @uiw/codemirror-theme-vscode.
- **Dependencies**: Do not add heavy dependencies unless absolutely necessary.
- **Compatibility**: Ensure compatibility with recent GrapesJS versions.
- **Styling**: Use `src/styles.scss` for all styling updates.
