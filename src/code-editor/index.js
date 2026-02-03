//Original work Copyright (c) 2018, Duarte Henriques, https://github.com/portablemind/grapesjs-code-editor
//Modified work Copyright (c) 2020, Brendon Ngirazi, https://github.com/Ju99ernaut/grapesjs-component-code-editor
//Modified work Copyright (c) 2025, A.Hakim, https://github.com/a-hakim/grapesjs-component-code-editor
//All rights reserved.

// Split.js removed

import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';

export class CodeEditor {
    constructor(editor, opts) {
        this.editor = editor;
        this.$ = editor.$;
        this.pfx = editor.getConfig('stylePrefix');
        this.opts = opts;
        this.canvas = this.findWithinEditor(`.${this.pfx}cv-canvas`);
        this.panelViews = opts.appendTo ? this.$(opts.appendTo) :
            this.findWithinEditor(`.${this.pfx}pn-${opts.panelId}`);
        this.isShowing = true;
        this.codeMirrorInstances = {};
    }

    findPanel() {
        const pn = this.editor.Panels;
        const id = this.opts.panelId;
        return pn.getPanel(id) || pn.addPanel({ id });
    }

    findWithinEditor(selector) {
        return this.$(selector, this.editor.getEl());
    }

    buildCodeEditor(type) {
        // Create container for CodeMirror
        const containerId = `codemirror-editor-container-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.className = `codemirror-editor-container-${type}`;
        container.id = containerId;
        
        const editorWrapper = {
            container: container,
            type: type,
            view: null,
            getElement: () => container,
            setContent: (content) => {
                if (editorWrapper.view) {
                    const currentContent = editorWrapper.view.state.doc.toString();
                    if (currentContent !== content) {
                        editorWrapper.view.dispatch({
                            changes: {
                                from: 0,
                                to: currentContent.length,
                                insert: content || ''
                            }
                        });
                    }
                } else {
                    editorWrapper.pendingContent = content;
                }
            },
            getContent: () => {
                return editorWrapper.view ? editorWrapper.view.state.doc.toString() : (editorWrapper.pendingContent || '');
            },
            refresh: () => {
                if (editorWrapper.view) {
                    editorWrapper.view.requestMeasure();
                }
            },
            dispose: () => {
                if (editorWrapper.view) {
                    editorWrapper.view.destroy();
                    editorWrapper.view = null;
                }
            },
            pendingContent: ''
        };

        // Store reference for later initialization
        if (!this.editorWrappers) {
            this.editorWrappers = {};
        }
        this.editorWrappers[type] = editorWrapper;

        return editorWrapper;
    }

    createCodeMirrorEditor(editorWrapper, type) {
        // Check if editor already exists for this wrapper
        if (editorWrapper.view) {
            return;
        }

        // Check if CodeMirror instance already exists for this type
        if (this.codeMirrorInstances[type]) {
            this.codeMirrorInstances[type].destroy();
            delete this.codeMirrorInstances[type];
        }
        
        // Clear container
        editorWrapper.container.innerHTML = '';

        try {
            // Configure language extension based on type
            const languageExtension = type === 'html' ? html() : css();

            // Create CodeMirror state
            const state = EditorState.create({
                doc: editorWrapper.pendingContent || '',
                extensions: [
                    basicSetup,
                    languageExtension,
                    vscodeDark,
                    keymap.of([indentWithTab]),
                    EditorView.theme({
                        '&': {
                            height: '100%',
                            fontSize: '14px'
                        },
                        '.cm-scroller': {
                            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                            overflow: 'auto'
                        },
                        '.cm-content': {
                            caretColor: '#fff'
                        },
                        '&.cm-focused .cm-cursor': {
                            borderLeftColor: '#fff'
                        },
                        '.cm-gutters': {
                            backgroundColor: '#1e1e1e',
                            color: '#858585',
                            border: 'none'
                        }
                    }),
                    EditorView.lineWrapping,
                    // Apply user options if provided
                    ...((this.opts.codeViewOptions && this.opts.codeViewOptions.extensions) || [])
                ]
            });

            // Create CodeMirror view
            const view = new EditorView({
                state,
                parent: editorWrapper.container
            });

            editorWrapper.view = view;
            editorWrapper.pendingContent = '';

            // Store the instance for later use
            this.codeMirrorInstances[type] = view;
            
        } catch (error) {
            console.error(`Failed to create CodeMirror editor for ${type}:`, error);
            // Fallback to textarea for this specific editor
            this.createTextareaFallback(editorWrapper, type);
        }
    }

    createTextareaFallback(editorWrapper, type) {
        const textarea = document.createElement('textarea');
        textarea.style.width = '100%';
        textarea.style.height = '100%';
        textarea.style.background = '#1e1e1e';
        textarea.style.color = '#cccccc';
        textarea.style.border = '1px solid #3c3c3c';
        textarea.style.fontFamily = 'monospace';
        textarea.style.fontSize = '14px';
        textarea.style.resize = 'none';
        textarea.style.outline = 'none';
        textarea.style.padding = '10px';
        textarea.style.boxSizing = 'border-box';
        textarea.value = editorWrapper.pendingContent || '';
        
        editorWrapper.container.innerHTML = '';
        editorWrapper.container.appendChild(textarea);
        
        // Update wrapper methods
        editorWrapper.setContent = (content) => {
            textarea.value = content || '';
        };
        editorWrapper.getContent = () => textarea.value;
        editorWrapper.refresh = () => {};
    }

    buildSection(type, codeViewer) {
        const { $, pfx, opts } = this;
        const section = $('<section></section>');
        const btnText = type === 'html' ? opts.htmlBtnText : opts.cssBtnText;
        const cleanCssBtn = (opts.cleanCssBtn && type === 'css') ?
            `<button class="cp-delete-${type} ${pfx}btn-prim">${opts.cleanCssBtnText}</button>` : '';
        
        section.append($(`
            <div class="codepanel-separator">
                <div class="codepanel-label">${type}</div>
                <div class="cp-btn-container">
                    ${cleanCssBtn}
                    <button class="cp-apply-${type} ${pfx}btn-prim">${btnText}</button>
                </div>
            </div>`));
            
        const codeViewerEl = codeViewer.getElement();
        codeViewerEl.classList.add('codepanel-content');
        codeViewerEl.style.height = '100%'; // Content takes full height of parent section
        
        section.append(codeViewerEl);
        this.codePanel.append(section);
        
        // Add click handler for accordion behavior
        section.find('.codepanel-separator').on('click', () => this.toggleSection(type));
        
        return section;
    }

    toggleSection(type) {
        const sections = this.codePanel.find('section');
        const clickedSection = sections.filter((i, el) => this.$(el).find(`.codepanel-label`).text().toLowerCase() === type);
        
        if (clickedSection.hasClass('active')) {
            // If clicking active section, switch to the other one
            const otherType = type === 'html' ? 'css' : 'html';
            sections.removeClass('active');
            const otherSection = sections.filter((i, el) => this.$(el).find(`.codepanel-label`).text().toLowerCase() === otherType);
            otherSection.addClass('active');
        } else {
            // Activate clicked section
            sections.removeClass('active');
            clickedSection.addClass('active');
        }
        
        // Refresh the editors when switching
        setTimeout(() => this.refreshEditors(), 300); // Wait for transition
    }

    buildCodePanel() {
        const { $, editor } = this;
        const panel = this.opts.panelId ? this.findPanel() : 0;
        this.codePanel = $('<div></div>');
        this.codePanel.addClass('code-panel');

        this.htmlCodeEditor = this.buildCodeEditor('html');
        this.cssCodeEditor = this.buildCodeEditor('css');

        const sections = [this.buildSection('html', this.htmlCodeEditor), this.buildSection('css', this.cssCodeEditor)];

        panel && !this.opts.appendTo &&
            panel.set('appendContent', this.codePanel).trigger('change:appendContent');
        this.opts.appendTo && $(this.opts.appendTo).append(this.codePanel);

        this.codePanel.find('.cp-apply-html')
            .on('click', this.updateHtml.bind(this));

        this.codePanel.find('.cp-apply-css')
            .on('click', this.updateCss.bind(this));

        // Set HTML as active default
        this.toggleSection('html');

        this.opts.cleanCssBtn && this.codePanel.find('.cp-delete-css')
            .on('click', (e) => {
                e.stopPropagation(); // Prevent accordion toggle
                this.deleteSelectedCss(e);
            });
            
        // Prevent accordion toggle when clicking Apply/Delete buttons
        this.codePanel.find('.cp-btn-container button').on('click', (e) => e.stopPropagation());

        editor.on('component:update', model => this.updateEditorContents());
        editor.on('stop:preview', () => {
            if (this.isShowing && !this.opts.preserveWidth) {
                this.canvas.css('width', this.opts.openState.cv);
            }
        });

        // Initialize CodeMirror editors after panel is built
        this.initializeCodeMirrorEditors();
    }

    initializeCodeMirrorEditors() {
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            if (this.editorWrappers) {
                Object.keys(this.editorWrappers).forEach(type => {
                    const wrapper = this.editorWrappers[type];
                    if (wrapper && wrapper.container.parentElement) {
                        this.createCodeMirrorEditor(wrapper, type);
                    }
                });
            }
        }, 100);
    }

    fallbackToTextarea() {
        if (this.editorWrappers) {
            Object.keys(this.editorWrappers).forEach(type => {
                const wrapper = this.editorWrappers[type];
                if (wrapper && wrapper.container && !wrapper.view) {
                    this.createTextareaFallback(wrapper, type);
                }
            });
        }
        this.updateEditorContents();
    }

    showCodePanel() {
        this.isShowing = true;
        this.codePanel.css('display', 'flex');
        
        // Initialize CodeMirror editors if not already done
        if (!this.codeMirrorInstances.html || !this.codeMirrorInstances.css) {
            this.initializeCodeMirrorEditors();
        }
        
        this.updateEditorContents();
        
        // make sure editor is aware of width change after the 300ms effect ends
        setTimeout(this.refreshEditors.bind(this), 320);

        if (this.opts.preserveWidth) return;

        this.panelViews.css('width', this.opts.openState.pn);
        this.canvas.css('width', this.opts.openState.cv);
    }

    hideCodePanel() {
        if (this.codePanel) this.codePanel.css('display', 'none');
        this.isShowing = false;

        if (this.opts.preserveWidth) return;

        this.panelViews.css('width', this.opts.closedState.pn);
        this.canvas.css('width', this.opts.closedState.cv);
    }

    refreshEditors() {
        this.htmlCodeEditor.refresh();
        this.cssCodeEditor.refresh();
    }

    formatHtml(html) {
        if (!html || !html.trim()) return html;
        try {
            // Basic HTML formatting with proper indentation
            let formatted = html
                .replace(/>\s*</g, '><') // Remove whitespace between tags
                .replace(/></g, '>\n<')  // Add newlines between tags
                .split('\n')
                .filter(function(line) { return line.trim(); })
                .map(function(line, index, array) {
                    var trimmed = line.trim();
                    if (!trimmed) return '';
                    
                    var indent = 0;
                    
                    // Calculate indentation level
                    for (var i = 0; i < index; i++) {
                        var prevLine = array[i].trim();
                        if (!prevLine) continue;
                        
                        // Count opening tags (not self-closing)
                        var openTags = (prevLine.match(/<[^\/!][^>]*(?<!\/\s*)>/g) || []).length;
                        // Count closing tags
                        var closeTags = (prevLine.match(/<\/[^>]*>/g) || []).length;
                        // Count self-closing tags
                        var selfClosingTags = (prevLine.match(/<[^>]*\/>/g) || []).length;
                        
                        indent += (openTags - selfClosingTags) - closeTags;
                    }
                    
                    // Adjust for current line if it's a closing tag
                    if (trimmed.startsWith('</')) {
                        indent = Math.max(0, indent - 1);
                    }
                    
                    return '  '.repeat(Math.max(0, indent)) + trimmed;
                })
                .join('\n');
            
            return formatted;
        } catch (error) {
            console.error('HTML formatting error:', error);
            return html;
        }
    }

    formatCss(css) {
        if (!css || !css.trim()) return css;
        try {
            // Enhanced CSS formatting
            var formatted = css
                // Remove extra whitespace
                .replace(/\s+/g, ' ')
                .trim()
                // Format selectors and opening braces
                .replace(/\s*{\s*/g, ' {\n  ')
                // Format properties
                .replace(/;\s*/g, ';\n  ')
                // Format closing braces
                .replace(/\s*}\s*/g, '\n}\n\n')
                // Clean up multiple newlines
                .replace(/\n\s*\n\s*\n/g, '\n\n')
                // Remove trailing spaces from properties
                .replace(/\s+;/g, ';')
                // Clean up the last closing brace
                .replace(/}\n\n$/g, '}')
                .trim();
            
            return formatted;
        } catch (error) {
            console.error('CSS formatting error:', error);
            return css;
        }
    }

    updateHtml(e) {
        if (e) e.preventDefault();
        const { editor, component } = this;
        let htmlCode = this.htmlCodeEditor.getContent().trim();
        if (!htmlCode || htmlCode === this.previousHtmlCode) return;
        this.previousHtmlCode = htmlCode;

        let idStyles = '';
        this.cssCodeEditor
            .getContent()
            .split('}\n')
            .filter((el) => Boolean(el.trim()))
            .map((cssObjectRule) => {
                if (!(/}$/.test(cssObjectRule))) {
                    //* Have to check closing bracket existence for every rule cause it can be missed after split and add it if it doesnt match
                    return `${cssObjectRule}}`;
                }
            })
            .forEach(rule => {
                if (/^#/.test(rule))
                    idStyles += rule;
            });

        htmlCode += `<style>${idStyles}</style>`;

        if (component.attributes.type === 'wrapper') {
            editor.setComponents(htmlCode);
        } else {
            editor.select(component.replaceWith(htmlCode));
        }
        return htmlCode;
    }

    updateCss(e) {
        if (e) e.preventDefault();
        const cssCode = this.cssCodeEditor.getContent().trim();
        if (!cssCode || cssCode === this.previousCssCode) return;
        this.previousCssCode = cssCode;
        this.editor.Css.addRules(cssCode);
        return cssCode;
    }

    deleteSelectedCss(e) {
        if (e) e.preventDefault();
        const view = this.codeMirrorInstances.css;
        if (!view) return;
        
        const state = view.state;
        const selection = state.selection.main;
        
        if (!selection.empty) {
            const selectedText = state.sliceDoc(selection.from, selection.to);
            this.parseRemove(selectedText);
            view.dispatch({
                changes: {
                    from: selection.from,
                    to: selection.to,
                    insert: ''
                }
            });
        }
    }

    parseRemove(removeCss) {
        return this.editor.Css.remove(this.getRules(this.editor.Parser.parseCss(removeCss)));
    }

    getRules(rules, opts = {}) {
        const { editor } = this;
        const sm = editor.Selectors;
        return rules.map((rule) => {
            const selector = sm.get(rule.selectors);
            const { state, selectorsAdd } = rule;
            const { atRuleType, atRuleParams } = opts;
            return (
                selector &&
                editor.Css.get(selector, state, atRuleParams, {
                    selectorsAdd,
                    atRule: atRuleType,
                })
            );
        });
    }

    updateEditorContents() {
        if (!this.isShowing) return;

        this.component = this.editor.getSelected();
        if (this.component) {
            var htmlContent = this.getComponentHtml(this.component);
            var cssContent = this.editor.CodeManager.getCode(this.component, 'css', {
                cssc: this.editor.Css
            });
            
            // Format the content before setting
            var formattedHtml = this.formatHtml(htmlContent || '');
            var formattedCss = this.formatCss(cssContent || '');
            
            // Set formatted content
            if (this.htmlCodeEditor.view) {
                this.htmlCodeEditor.setContent(formattedHtml);
            } else {
                this.htmlCodeEditor.pendingContent = formattedHtml;
            }
            
            if (this.cssCodeEditor.view) {
                this.cssCodeEditor.setContent(formattedCss);
            } else {
                this.cssCodeEditor.pendingContent = formattedCss;
            }
        }
    }

    getComponentHtml(component) {
        const { pfx, opts } = this;
        let result = '';
        const componentEl = component.getEl();

        !opts.clearData && componentEl.classList.remove(`${pfx}selected`);
        const html = opts.clearData ? component.toHTML() :
            (component.attributes.type === 'wrapper' ? componentEl.innerHTML : componentEl.outerHTML);
        !opts.clearData && componentEl.classList.add(`${pfx}selected`);
        result += html;

        const js = opts.editJs ? component.getScriptString() : '';
        result += js ? `<script>${js}<\/script>` : '';

        return result;
    }

    dispose() {
        // Clean up CodeMirror instances
        if (this.htmlCodeEditor && this.htmlCodeEditor.dispose) {
            this.htmlCodeEditor.dispose();
        }
        if (this.cssCodeEditor && this.cssCodeEditor.dispose) {
            this.cssCodeEditor.dispose();
        }
        if (this.codeMirrorInstances.html) {
            this.codeMirrorInstances.html.destroy();
        }
        if (this.codeMirrorInstances.css) {
            this.codeMirrorInstances.css.destroy();
        }
        
        // Clear editor wrappers
        if (this.editorWrappers) {
            Object.values(this.editorWrappers).forEach(wrapper => {
                if (wrapper && wrapper.dispose) {
                    wrapper.dispose();
                }
            });
            this.editorWrappers = {};
        }
        
        // Clear instances
        this.codeMirrorInstances = {};
        
        // Clear code panel
        if (this.codePanel) {
            this.codePanel.remove();
            this.codePanel = null;
        }
    }
}
