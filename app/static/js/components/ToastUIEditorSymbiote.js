// ToastUIEditorSymbiote.js - CleanWith [[toto]] withoutreplacement replacementsin editor
import Symbiote, {
    html,
} from "https://symbiotejs.github.io/symbiote.js/core/Symbiote.js";

class ToastUIEditorSymbiote extends Symbiote {
    static observedAttributes = ["content"];

    constructor() {
        super();
        this.editor = null;
        this.lastContent = "";
    }

    connectedCallback() {
        super.connectedCallback();
        this.setupToastUIEditor();
    }

    setupToastUIEditor() {
        const editorContainer = this.querySelector("#editeur-toast");
        if (!editorContainer) {
            console.error("ToastUI editor container not found");
            return;
        }

        if (!window.toastui || !window.toastui.Editor) {
            console.error("ToastUI Editor is not loaded!");
            return;
        }

        try {
            this.editor = new toastui.Editor({
                el: editorContainer,
                height: "400px",
                previewStyle: "vertical",
                toolbarItems: [
                    ["heading", "bold", "italic"],
                    ["link"],
                    ["ul", "ol"],
                    ["table"],
                ],
                useCommandShortcut: true,
                hideModeSwitch: true,
                language: "FR-fr",
                events: {
                    change: () => {
                        const htmlContent = this.editor.getHTML();
                        if (htmlContent !== this.lastContent) {
                            this.lastContent = htmlContent;
                            this.dispatchEvent(
                                new CustomEvent("content-change", {
                                    detail: { content: htmlContent },
                                    bubbles: true,
                                }),
                            );
                        }
                    },
                },
            });

            console.log("ToastUI Editor initialized successfully");
        } catch (error) {
            console.error("Error initializing ToastUI Editor:", error);
        }
    }
}

ToastUIEditorSymbiote.template = html`
    <div class="bg-white rounded-lg shadow-sm p-4">
        <!-- ToastUI Editor -->
        <div id="editeur-toast" class="min-h-[40vh]"></div>
    </div>
`;

ToastUIEditorSymbiote.reg("toastui-editor-symbiote");

window.ToastUIEditorSymbiote = ToastUIEditorSymbiote;

export default ToastUIEditorSymbiote;
