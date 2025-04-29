import { LitElement, css, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { CUSTOM_KEY, getSecrets, initGeminiModels, saveKey, STATE, throwGeminiError, } from '../utils';
import {
    writeSecret,
} from "@silly-tavern/scripts/secrets.js";

interface GeminiLayoutsOption {
    currentKey: string;
    lastKey: string;
    throwGeminiErrorState: boolean;
    switchKeyMakerSuite: boolean;
    apiKeys: string;
}

// Commented out original HTML structure for reference
// `
// <div class="menu_button menu_button_icon interactable" title="保存密钥" @click="${this.handleSaveKey}"><span>保存密钥</span></div>
//             <div class="menu_button menu_button_icon interactable" title="获取新的模型" @click="${this.handleGetNewModel}"><span>获取新的模型</span></div>
//             <div class="menu_button menu_button_icon interactable" title="切换密钥设置" @click="${this.handleSwitchKeyMakerSuite}"><span>切换密钥设置</span></div>
//             <div class="menu_button menu_button_icon interactable" title="查看报错原因" @click="${this.handleThrowGeminiError}"><span>查看报错原因</span></div>
//             <div class="menu_button menu_button_icon interactable" title="报错开关" @click="${this.handleSwitchGeminiError}"><span>报错开关</span></div>
// `

class GeminiLayouts extends LitElement {
    // Define properties for the component
    static properties = {
        currentKey: { type: String, reflect: true },
        lastKey: { type: String, reflect: true },
        throwGeminiErrorState: { type: Boolean, reflect: true },
        switchKeyMakerSuite: { type: Boolean, reflect: true },
        apiKeys: { type: String, reflect: true },
    }

    // Declare properties with their types
    declare currentKey: string;
    declare lastKey: string;
    declare throwGeminiErrorState: boolean;
    declare switchKeyMakerSuite: boolean;
    declare apiKeys: string;

    // Constructor to initialize properties
    constructor() {
        super();
        this.currentKey = "";
        this.lastKey = "";
        this.throwGeminiErrorState = false;
        this.switchKeyMakerSuite = false;
        this.apiKeys = "";
    }

    // Disable shadow DOM
    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    // Render method to define the component's template
    render() {
        console.log('GeminiLayouts render');
        console.log("this", this);

        // Array of button configurations
        const buttons = [
            {
                name: "Save Key", // Translated from "保存密钥"
                handle: this.handleSaveKey
            },
            {
                name: "Fetch New Models", // Translated from "获取新的模型"
                handle: this.handleGetNewModel
            },
            {
                name: "Key Switching Settings", // Translated from "切换密钥设置"
                handle: this.handleSwitchKeyMakerSuite
            },
            {
                name: "View Error Reasons", // Translated from "查看报错原因"
                handle: this.handleThrowGeminiError
            },
            {
                name: "Error Reporting Toggle", // Translated from "报错开关"
                handle: this.handleSwitchGeminiError
            }
        ]

        // HTML template using lit-html
        return html`
        <div>
            <h4>Key Call Information:</h4> <div id="current_key_maker_suite">Current: ${this.currentKey}</div> <div id="last_key_maker_suite">Last: ${this.lastKey}</div> <div id="switch_key_maker_suite">Key Switching:${this.switchKeyMakerSuite ? "On" : "Off"}</div> <div id="throw_gemini_error">Error Reporting Toggle:${this.throwGeminiErrorState ? "On" : "Off"}</div> </div>
        <div class="flex-container flex">
            <h4>Google AI Studio API Multiple Keys</h4> <textarea class="text_pole textarea_compact autoSetHeight" placeholder="API Key" id="api_key_makersuite_custom" style="height: 100px;" @change=${this.handleTextareaInput} .value=${this.apiKeys}></textarea>
        </div>
        <div class="flex-container flex">
        ${repeat( // Loop through the buttons array
            buttons,
            ({ name }) => name, // Use name as the key for repeat directive
            ({ name, handle }) => html`
                    <div class="menu_button menu_button_icon interactable" title="${name}" @click="${handle}"><span>${name}</span></div>`,
        )}
        </div>
        <hr>
        `;
    }

    // Handler for input changes in the textarea
    handleTextareaInput(event: Event) {
        console.log('handleTextareaInput', event);
        const textarea = event.target as HTMLTextAreaElement;

        // Process the input value: split by newline or semicolon, trim whitespace, filter valid keys
        const value = textarea.value
            .split(/[\n;]/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0 && v.startsWith("AIzaSy")); // Filter for valid API key format

        this.apiKeys = value.join("\n"); // Join valid keys back with newlines
        textarea.value = this.apiKeys; // Update the textarea value

        // If no valid keys remain, save the empty string and return
        if (value.length === 0) {
            saveKey(CUSTOM_KEY, this.apiKeys);
            return;
        }

        // Use the first valid key for the main API key setting
        const fistValue = value[0];
        writeSecret("api_key_makersuite", fistValue);
        // Save the full list of keys to custom storage
        saveKey(CUSTOM_KEY, this.apiKeys);
        // this.requestUpdate(); // Optionally request update if needed, commented out in original
    }

    // Handler for the "View Error Reasons" button
    handleThrowGeminiError() {
        console.log('handleThrowGeminiError');
        throwGeminiError(); // Call the function to display Gemini error details
    }

    // Handler for the "Fetch New Models" button
    async handleGetNewModel() {
        console.log('handleGetNewModel');
        const secrets = await getSecrets(); // Fetch secrets
        await initGeminiModels(secrets); // Initialize Gemini models with fetched secrets
    }

    // Handler for the "Save Key" button
    handleSaveKey() {
        console.log('handleSaveKey');
        const value = this.apiKeys; // Get the current value from the apiKeys property
        if (value.length === 0) {
            saveKey(CUSTOM_KEY, value); // Save empty string if no keys
            return;
        }
        const fistValue = value[0]; // Get the first key
        writeSecret("api_key_makersuite", fistValue); // Write the first key to the main setting
        saveKey(CUSTOM_KEY, this.apiKeys); // Save the full list of keys to custom storage
    }

    // Handler for the "Key Switching Settings" button
    handleSwitchKeyMakerSuite() {
        console.log('handleSwitchKeyMakerSuite');
        STATE.switchState = !STATE.switchState; // Toggle the switch state
        localStorage.setItem("switch_key_maker_suite", STATE.switchState.toString()); // Save state to local storage
        this.switchKeyMakerSuite = STATE.switchState; // Update the component property
    }

    // Handler for the "Error Reporting Toggle" button
    handleSwitchGeminiError() {
        console.log('handleSwitchGeminiError');
        STATE.throwGeminiErrorState = !STATE.throwGeminiErrorState; // Toggle the error reporting state
        localStorage.setItem("throw_gemini_error", STATE.throwGeminiErrorState.toString()); // Save state to local storage
        this.throwGeminiErrorState = STATE.throwGeminiErrorState; // Update the component property
    }
}

// Define the custom element
customElements.define('gemini-layouts', GeminiLayouts);

// Export the class
export { GeminiLayouts };
