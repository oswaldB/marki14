// toastui-editor-lit.js - Composant Lit pour ToastUI Editor
import { LitElement, html } from 'https://cdn.jsdelivr.net/npm/lit@2.8.0/+esm';

class ToastUIEditorLit extends LitElement {
    static properties = {
        content: { type: String },
        height: { type: String }
    };

    constructor() {
        super();
        this.content = '';
        this.height = '400px';
        this.editor = null;
    }

    createRenderRoot() {
        return this; // Désactive le shadow DOM
    }

    firstUpdated() {
        this.loadToastUIScript();
    }

    async loadToastUIScript() {
        try {
            // ToastUI Editor est déjà chargé dans le head, on peut l'utiliser directement
            this.initializeEditor();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de ToastUI Editor:', error);
        }
    }

    initializeEditor() {
        if (window.toastui && window.toastui.Editor) {
            const editorContainer = this.querySelector('#editor-container');
            if (editorContainer) {
                this.editor = new toastui.Editor({
                    el: editorContainer,
                    height: this.height,
                    initialEditType: 'wysiwyg',
                    previewStyle: 'vertical',
                    initialValue: this.content || '',
                    toolbarItems: [
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task', 'indent', 'outdent'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock']
                    ],
                    events: {
                        change: () => {
                            const newContent = this.editor.getHTML();
                            this.content = newContent;
                            this.dispatchEvent(new CustomEvent('content-change', {
                                detail: { content: newContent },
                                bubbles: true
                            }));
                        }
                    }
                });
            }
        }
    }

    render() {
        return html`
            <div class="border border-gray-300 rounded">
                <div id="editor-container" style="min-height: ${this.height}"></div>
            </div>
        `;
    }
}

customElements.define('toastui-editor-lit', ToastUIEditorLit);