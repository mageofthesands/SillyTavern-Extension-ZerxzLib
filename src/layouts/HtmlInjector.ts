import { LitElement, html, type PropertyDeclarations } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';
import { SignalWatcher, signal, watch } from '@lit-labs/signals';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { useExtensionSetting } from '../utils/extension';
import { htmlInjectorSettings } from 'utils/setting';

// Destructure settings and signals from htmlInjectorSettings
const { saveSettingsDebounced, extensionSettings, setSetting, getSettings, getSignals } = htmlInjectorSettings

// This function is called when the extension settings are changed in the UI
function onExampleInput() {
    extensionSettings.example_setting = "Test"; // Translated from "测试"
    saveSettingsDebounced();
    setSetting('example_setting2', 'Test'); // Translated from "测试"
}

// Get signals related to HTML injection and UI state
const {
    lastMesTextContent,
    isInjectionEnabled,
    displayMode,
    activationMode,
    customStartFloor,
    customEndFloor,
    savedPosition,
    isEdgeControlsCollapsed,
    isVisibleSettingsPanel,
    saveTopPosition,
    hiddenEdgeControls,
} = getSignals();

// ---------------------------------------- Global Variables --------------------------------
const chatElement = $<HTMLDivElement>('#chat'); // Get the chat element using jQuery

// MutationObserver to watch for changes in the chat element
const observer = new MutationObserver((mutations) => {
    let canInject = false;
    for (const mutation of mutations) {
        // Only process childList mutations (when elements are added or removed)
        if (mutation.type !== 'childList') {
            continue;
        }

        // Check if any added node contains a message text element
        const hasNewMesText = Array.from(mutation.addedNodes).some(node => {
            // Ensure the node is an element
            if (node.nodeType !== Node.ELEMENT_NODE || !(node instanceof HTMLElement)) {
                return false;
            }
            // Check if the node itself or a descendant has the 'mes_text' class
            return node.classList.contains('mes_text') || node.querySelector('.mes_text');
        });

        // If a new message text element is found
        if (hasNewMesText) {
            // Check if injection is currently enabled
            if (isInjectionEnabled.get()) {
                canInject = true;
            }
            // Stop processing mutations once a new message text is found
            break;
        }
    }

    // If a new message text was found and injection is enabled, remove existing iframes and inject new ones
    if (canInject) {
        removeInjectedIframes();
        injectHtmlCode();
    }
});

// ---------------------------------------- Initialization ----------------------------------------

// Class to manage iframes for injected HTML
class IFrameManager {
    private static instance: IFrameManager; // Singleton instance
    private resizeObservers: Map<HTMLIFrameElement, ResizeObserver> = new Map(); // Map to store ResizeObservers for iframes

    private constructor() { } // Private constructor for singleton pattern

    // Get the singleton instance
    public static getInstance(): IFrameManager {
        if (!IFrameManager.instance) {
            IFrameManager.instance = new IFrameManager();
        }
        return IFrameManager.instance;
    }

    // Create a new iframe with the given HTML content
    public createIframe(htmlContent: string): HTMLIFrameElement {
        const iframe = document.createElement('iframe');
        this.setupIframeAttributes(iframe);
        iframe.srcdoc = this.getIframeSrcContent(htmlContent); // Set the iframe content
        this.setupIframeEventListeners(iframe); // Set up event listeners
        return iframe;
    }

    // Set common attributes and styles for the iframe
    private setupIframeAttributes(iframe: HTMLIFrameElement): void {
        Object.assign(iframe.style, {
            width: '100%',
            border: 'none',
            marginTop: '10px',
            transition: 'height 0.3s ease' // Add smooth transition effect (Translated from "添加平滑过渡效果")
        });
    }

    // Set up event listeners for the iframe
    private setupIframeEventListeners(iframe: HTMLIFrameElement): void {
        iframe.onload = () => {
            this.adjustIframeHeight(iframe);
            // Delay adjustment again to ensure content is fully loaded (Translated from "延迟再次调整以确保内容完全加载")
            setTimeout(() => this.adjustIframeHeight(iframe), 500);

            // Set initial theme (Translated from "设置初始主题")
            this.updateIframeTheme(iframe, getSystemTheme());
        };

        // Create and store ResizeObserver (Translated from "创建并存储 ResizeObserver")
        if (iframe.contentWindow) {
            const resizeObserver = new ResizeObserver(() => this.adjustIframeHeight(iframe));
            this.resizeObservers.set(iframe, resizeObserver);

            iframe.addEventListener('load', () => {
                if (iframe.contentWindow?.document.body) {
                    resizeObserver.observe(iframe.contentWindow.document.body);
                }
            });
        }
    }

    // Adjust the height of the iframe based on its content
    public adjustIframeHeight(iframe: HTMLIFrameElement): void {
        try {
            if (iframe.contentWindow?.document.body) {
                const height = Math.max(
                    iframe.contentWindow.document.documentElement.scrollHeight,
                    iframe.contentWindow.document.body.scrollHeight
                );
                iframe.style.height = `${height + 5}px`;
            }
        } catch (error) {
            console.error('Failed to adjust iframe height:', error); // Translated from "调整iframe高度失败:"
        }
    }

    // Update the theme of the iframe content
    public updateIframeTheme(iframe: HTMLIFrameElement, theme: string): void {
        try {
            iframe.contentWindow?.postMessage({ type: 'themeChange', theme }, '*');
        } catch (error) {
            console.error('Failed to update iframe theme:', error); // Translated from "更新iframe主题失败:"
        }
    }

    // Remove an iframe and clean up its ResizeObserver
    public removeIframe(iframe: HTMLIFrameElement): void {
        // Clean up ResizeObserver (Translated from "清理 ResizeObserver")
        const observer = this.resizeObservers.get(iframe);
        if (observer) {
            observer.disconnect();
            this.resizeObservers.delete(iframe);
        }
        iframe.remove();
    }

    // Get the full HTML content for the iframe srcdoc
    private getIframeSrcContent(htmlContent: string): string {
        return `
            <html>
    <head>
        <style>
            /* Custom Styles (Translated from "自定义样式") */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.5);
            }
            [data-theme="dark"] ::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
            }
            [data-theme="dark"] ::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
            }
            [data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            .container[data-theme="light"] {
                --bg-color: rgba(240, 240, 255, 0.1);
                --text-color: #1e1e1e;
                --border-color: rgba(139,226,115,0.3);
                --nav-bg-color: rgba(240,240,255,0.4);
            }
            .container[data-theme="dark"] {
                --bg-color: rgba(40, 40, 40, 0.2);
                --text-color: #e0e0e0;
                --border-color: rgba(74,74,74,0.3);
                --nav-bg-color: rgba(30,30,30,0.4);
            }
            .container {
                background-color: var(--bg-color);
                color: var(--text-color);
            }
            .container .left-nav {
                background-color: var(--nav-bg-color);
            }
            .container .button, .container .left-nav .section {
                border: 1px solid var(--border-color);
            }
        </style>
    </head>
    <body>
        <div class="theme-content">
            ${htmlContent}
        </div>
        <script>
            window.addEventListener('load', function() {
                window.parent.postMessage('loaded', '*');
                const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                function handleThemeChange(e) {
                    document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                    window.parent.postMessage({type: 'themeChange', theme: e.matches ? 'dark' : 'light'}, '*');
                }
                darkModeMediaQuery.addListener(handleThemeChange);
                handleThemeChange(darkModeMediaQuery);
                document.querySelectorAll('.qr-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const buttonName = this.textContent.trim();
                        window.parent.postMessage({type: 'buttonClick', name: buttonName}, '*');
                    });
                });
                document.querySelectorAll('.st-text').forEach(textarea => {
                    textarea.addEventListener('input', function() {
                        window.parent.postMessage({type: 'textInput', text: this.value}, '*');
                    });
                    textarea.addEventListener('change', function() {
                        window.parent.postMessage({type: 'textInput', text: this.value}, '*');
                    });
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                                window.parent.postMessage({type: 'textInput', text: textarea.value}, '*');
                            }
                        });
                    });
                    observer.observe(textarea, { attributes: true });
                });
                document.querySelectorAll('.st-send-button').forEach(button => {
                    button.addEventListener('click', function() {
                        window.parent.postMessage({type: 'sendClick'}, '*');
                    });
                });
            });
            window.addEventListener('message', function(event) {
                if (event.data.type === 'themeChange') {
                    document.body.setAttribute('data-theme', event.data.theme);
                }
            });
        </script>
    </body>
</html>
        `;
    }
}


// Modify removeInjectedIframes function (Translated from "修改 removeInjectedIframes 函数")
function removeInjectedIframes() {
    const iframeManager = IFrameManager.getInstance();
    const iframes = document.querySelectorAll<HTMLIFrameElement>('.mes_text iframe');
    // Remove each iframe using the manager
    for (const iframe of Array.from(iframes)) {
        iframeManager.removeIframe(iframe);
    }
    // Reset display for code elements and remove details wrappers
    const codeElements = document.querySelectorAll<HTMLDivElement>('.mes_text code');
    for (const code of Array.from(codeElements)) {
        code.style.display = ''; // Show the code element
        const details = code.closest('details'); // Find the closest details element
        if (details) {
            // Move the code element out of the details and remove the details
            details.parentNode?.insertBefore(code, details);
            details.remove();
        }
    }
}

// Inject HTML code into message text elements
function injectHtmlCode(specificMesText = null as Element | null) {
    console.log('injectHtmlCode');
    try {
        // Determine which message text elements to target based on activation mode
        const mesTextElements = specificMesText ? [specificMesText] : Array.from(chatElement.find('.mes_text'));
        let targetElements: Element[];
        const iframeManager = IFrameManager.getInstance();

        switch (activationMode.get()) {
            case 'first':
                targetElements = mesTextElements.slice(0, 1);
                break;
            case 'last':
                targetElements = mesTextElements.slice(-1);
                break;
            case 'lastN':
                // Target the last N elements based on customEndFloor setting
                targetElements = mesTextElements.slice(-customEndFloor.get());
                break;
            case 'custom': {
                // Target a custom range of elements based on customStartFloor and customEndFloor
                const start = customStartFloor.get() - 1; // Adjust for 0-based index
                const end = customEndFloor.get() === -1 ? undefined : customEndFloor.get(); // -1 means last element
                targetElements = mesTextElements.slice(start, end);
                break;
            }
            default: // 'all'
                targetElements = mesTextElements;
        }

        // Iterate through the target elements and inject HTML if a code block is found
        for (let i = 0; i < targetElements.length; i++) {
            const mesText = targetElements[i];
            const codeElement = mesText.querySelector('code');
            if (!codeElement) {
                continue; // Skip if no code element is found
            }

            // Extract HTML content from the code element
            const htmlContent = codeElement.innerText.trim();

            // Basic check to see if the content looks like HTML
            if (!htmlContent.startsWith("<") || !htmlContent.endsWith(">")) {
                continue; // Skip if it doesn't look like HTML
            }

            // Create and insert the iframe
            const iframe = iframeManager.createIframe(htmlContent);
            // Apply display mode settings
            if (displayMode.get() === 2) {
                // Wrap the original code in a details/summary element
                const details = document.createElement('details');
                const summary = document.createElement('summary');
                summary.textContent = '[Original Code]'; // Translated from "[原代码]"
                details.appendChild(summary);
                codeElement.parentNode?.insertBefore(details, codeElement);
                details.appendChild(codeElement);
            } else if (displayMode.get() === 3) {
                // Hide the original code element
                codeElement.style.display = 'none';
            }

            // Insert the iframe after the code element (or its wrapper)
            codeElement.parentNode?.insertBefore(iframe, codeElement.nextSibling);

            // Append the iframe to the message text element (redundant with insertBefore, might need review)
            mesText.appendChild(iframe);
        }
    } catch (error) {
        console.error('HTML injection failed:', error); // Translated from "HTML注入失败:"
    }
}

// ---------------------------------------- Helper Functions ----------------------------------------

// Adjust the height of a single iframe (redundant with IFrameManager method, might need review)
function adjustIframeHeight(iframe: HTMLIFrameElement) {
    try {
        if (iframe.contentWindow?.document.body) {
            const height = iframe.contentWindow.document.documentElement.scrollHeight;
            iframe.style.height = `${height + 5}px`;
        }
    } catch (error) {
        console.error('Failed to adjust iframe height:', error); // Translated from "调整iframe高度失败:"
    }
}

// Get the current system theme (dark or light)
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Update the theme of all injected iframes
function updateAllIframesTheme() {
    const iframes = document.querySelectorAll('.mes_text iframe');
    // biome-ignore lint/complexity/noForEach: Iterating over a NodeList is acceptable here
    iframes.forEach(iframe => {
        try {
            // @ts-ignore // Ignoring potential type issue with contentWindow
            if (iframe.contentWindow) {
                // @ts-ignore // Ignoring potential type issue with postMessage
                iframe.contentWindow.postMessage({ type: 'themeChange', theme: getSystemTheme() }, '*');
            }
        } catch (error) {
            console.error('Failed to update iframe theme:', error); // Translated from "更新iframe主题失败:"
        }
    });
}

// Handle messages received from iframes
function handleMessage(event: MessageEvent) {
    try {
        // If the message is 'loaded', adjust the iframe height
        if (event.data === 'loaded') {
            const iframes = document.querySelectorAll<HTMLIFrameElement>('.mes_text iframe');
            // biome-ignore lint/complexity/noForEach: Iterating over a NodeList is acceptable here
            iframes.forEach(iframe => {
                // @ts-ignore // Ignoring potential type issue with contentWindow
                if (iframe.contentWindow === event.source) {
                    adjustIframeHeight(iframe);
                }
            });
        } else if (event.data.type === 'buttonClick') {
            // If a button in an iframe was clicked, find and click the corresponding QR button in the main document
            const buttonName = event.data.name;
            jQuery('.qr--button.menu_button').each(function () {
                if (jQuery(this).find('.qr--button-label').text().trim() === buttonName) {
                    jQuery(this).trigger('click');
                    return false; // Stop iteration
                }
            });
        } else if (event.data.type === 'textInput') {
            // If text was input in an iframe textarea, update the main send textarea
            const sendTextarea = document.getElementById('send_textarea');
            if (sendTextarea) {
                // @ts-ignore // Ignoring potential type issue with value
                sendTextarea.value = event.data.text;
                // Dispatch input and change events to trigger SillyTavern's internal handling
                sendTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                sendTextarea.dispatchEvent(new Event('change', { bubbles: true }));
            }
        } else if (event.data.type === 'sendClick') {
            // If the send button in an iframe was clicked, click the main send button
            const sendButton = document.getElementById('send_but');
            if (sendButton) {
                sendButton.click();
            }
        }
    } catch (error) {
        console.error('Failed to handle message:', error); // Translated from "处理消息失败:"
    }
}

// LitElement component for the settings panel
class SettingsPanel extends SignalWatcher(LitElement) {
    // Disable shadow DOM
    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    // Create refs for specific elements in the template
    public customFloorSettingsRef = createRef<HTMLDivElement>();
    public LastSettingsRef = createRef<HTMLDivElement>();

    // Declare a property to hold a reference to the EdgeControls component
    declare edgeControls: EdgeControls

    // Render method for the settings panel
    render() {
        // Control the display of the settings panel based on its visibility signal
        this.style.display = isVisibleSettingsPanel.get() ? 'none' : 'block';
        this.classList.add('drawer'); // Add drawer class

        return html`
            <div id="html-injector-settings-header" class="inline-drawer-header">
                <span class="inline-drawer-title">HTML Injector Settings</span> <div id="html-injector-close-settings" class="inline-drawer-icon fa-solid fa-circle-xmark" @click=${this.toggleSettingsPanel}></div>
            </div>
            <div id="settings-content">
                <div class="settings-section">
                    <h3 class="settings-subtitle">Edge Control Panel Position</h3> <select id="edge-controls-position" class="settings-select theme-element" @change=${this.handleSavePositionChange}>
                    <option value="top-right"                     .selected=${savedPosition.get() === "top-right"}>Top Right of Interface</option> <option value="right-three-quarters" .selected=${savedPosition.get() === "right-three-quarters"}>Right Side 3/4 Position</option> <option value="right-middle"           .selected=${savedPosition.get() === "right-middle"}>Right Side Middle</option> <option value="top-left"             .selected=${savedPosition.get() === "top-left"}>Top Left of Interface</option> <option value="left-three-quarters"  .selected=${savedPosition.get() === "left-three-quarters"}>Left Side 3/4 Position</option> <option value="left-middle"          .selected=${savedPosition.get() === "left-middle"}>Left Side Middle</option> <option value="custom"               .selected=${savedPosition.get() === "custom"}>Custom Position</option> <option value="hidden"               .selected=${savedPosition.get() === "hidden"}>Hidden</option> </select>
                </div>
                <div class="settings-section">
                <h3 class="settings-subtitle">Display Mode</h3> <label class="settings-option"><input type="radio" name="display-mode" value="1" .checked=${displayMode.get() === 1} @change=${this.handleDisplayModeChange}> Show Original Code and Injected Effect Together</label> <label class="settings-option"><input type="radio" name="display-mode" value="2" .checked=${displayMode.get() === 2} @change=${this.handleDisplayModeChange}> Show Original Code as Summary</label> <label class="settings-option"><input type="radio" name="display-mode" value="3" .checked=${displayMode.get() === 3} @change=${this.handleDisplayModeChange}> Hide Original Code, Show Only Injected Effect</label> </div>
                <div class="settings-section">
                    <h3 class="settings-subtitle">Activation Floor</h3> <select id="activation-mode" class="settings-select theme-element" @change=${this.handleActivationModeChange} >
                        <option value="all"    .selected=${activationMode.get() === "all"}>All Floors</option> <option value="first"  .selected=${activationMode.get() === "first"}>First Floor</option> <option value="last"    .selected=${activationMode.get() === "last"}>Last Floor</option> <option value="lastN"  .selected=${activationMode.get() === "lastN"}>Last N Floors</option> <option value="custom" .selected=${activationMode.get() === "custom"}>Custom Floors</option> </select>
                    <div id="custom-floor-settings" class="settings-subsection" style=${styleMap({
                display: activationMode.get() === 'custom' ? 'block' : 'none'
            })} ${ref(this.customFloorSettingsRef)}>
                        <label class="settings-option">Start Floor: <input type="number" id="custom-start-floor" min="1" .value=${customStartFloor.get().toString()} @change=${this.handleCustomStartFloorChange}></label> <label class="settings-option">End Floor: <input type="number" id="custom-end-floor" min="-1" .value=${customEndFloor.get().toString()} @change=${this.handleCustomEndFloorChange}></label> <p class="settings-note">(-1 means last floor)</p> </div>
                    <div id="last-n-settings" class="settings-subsection" style=${styleMap({
                display: activationMode.get() === 'lastN' ? 'block' : 'none'
            })} ${ref(this.LastSettingsRef)} >
                        <label class="settings-option">Last <input type="number" id="last-n-floors" min="1" .value=${customEndFloor.get().toString()}  @change=${this.handleLastNFloorsChange}> Floors</label> </div>
                </div>
            </div>
            <div class="settings-footer">
                <p>Security Reminder: Please only inject code you trust. Unsafe code may pose potential risks to your system.</p> <p>Note: The HTML code to be injected should be wrapped in \`\`\`, for example:</p> <pre class="code-example">
\`\`\`
&lt;h1&gt;Hello, World!&lt;/h1&gt;
&lt;p&gt;This is an example.&lt;/p&gt;
\`\`\`
        </pre>
        <p>The following are special class names corresponding to ST Tavern functions and simple usage methods:</p> <pre class="code-example">
\`\`\`
&lt;button class="qr-button"&gt;(Your QR button name)&lt;/button&gt; &lt;textarea class="st-text"&gt;(Corresponds to the tavern's input text box, input content will sync to the tavern's text box)&lt;/textarea&gt; &lt;button class="st-send-button"&gt;(Corresponds to the tavern's send button)&lt;/button&gt; \`\`\`
                </pre>
                <p>【Note】Synchronizing the content of the st-text box dynamically inserted by JavaScript to the ST Tavern input box requires processing time. If synchronization is needed, please add a small delay to ensure the text has time to synchronize.</p> <a href="https://discord.com/channels/1134557553011998840/1271783456690409554" target="_blank"> →Discord Tutorial Post Link← Contains detailed instructions and templates like the gal interface </a> </div>
        `
    }

    // Handlers for settings changes
    handleActivationModeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const value = target.value;
        activationMode.set(value); // Update the activation mode signal
        this.updateInjection(); // Trigger injection update
    }

    handleSavePositionChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const value = target.value;
        savedPosition.set(value); // Update the saved position signal
        isEdgeControlsCollapsed.set(false); // Ensure edge controls are not collapsed when position changes
        this.edgeControls.updateEdgeControlsPosition(value); // Update the position of the edge controls component
    }

    handleCustomStartFloorChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = Number.parseInt(target.value);
        customStartFloor.set(value); // Update the custom start floor signal
        this.updateInjection(); // Trigger injection update
    }

    handleCustomEndFloorChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = Number.parseInt(target.value);
        customEndFloor.set(value); // Update the custom end floor signal
        this.updateInjection(); // Trigger injection update
    }

    handleLastNFloorsChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = Number.parseInt(target.value);
        customEndFloor.set(value); // Update the custom end floor signal (used for lastN in this case)
        this.updateInjection(); // Trigger injection update
    }

    handleDisplayModeChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = Number.parseInt(target.value);
        displayMode.set(value); // Update the display mode signal
        this.updateInjection(); // Trigger injection update
    }

    // Toggle the visibility of the settings panel
    toggleSettingsPanel(event: Event) {
        const isVisible = this.style.display === 'block';
        this.style.display = isVisible ? 'block' : 'node'; // Toggle display style
        isVisibleSettingsPanel.set(isVisible); // Update the visibility signal
    }

    // Update the injected HTML based on current settings
    updateInjection() {
        if (!isInjectionEnabled.get()) {
            return // Do nothing if injection is not enabled
        }
        removeInjectedIframes(); // Remove existing iframes
        injectHtmlCode(); // Inject HTML code based on current settings
    }
}

// LitElement component for the edge controls panel
class EdgeControls extends SignalWatcher(LitElement) {
    // Define properties
    static properties: PropertyDeclarations = {
        settingsPanel: { type: Object }, // Reference to the settings panel component
        toggleEdgeButtonStyle: { type: Object }, // Style object for the toggle button
        isDragging: { type: Boolean }, // State for dragging
        startY: { type: Number }, // Starting Y position for dragging
        startTop: { type: Number }, // Starting top position of the element for dragging
        newTop: { type: Number } // New top position during dragging
    }

    // Declare properties with their types
    public declare settingsPanel: SettingsPanel;
    public declare toggleEdgeButtonStyle: StyleInfo;
    public declare isDragging: boolean;
    public declare startY: number;
    public declare startTop: number;
    public newTop: number

    // Constructor
    constructor() {
        super();
        // Initialize properties based on saved position
        const position = savedPosition.get();
        const isLeft = position.includes('left');
        this.toggleEdgeButtonStyle = {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--SmartThemeBlurTintColor, rgba(22, 11, 18, 0.73))',
            color: 'var(--SmartThemeBodyColor, rgba(220, 220, 210, 1))',
            border: '1px solid var(--SmartThemeBorderColor, rgba(217, 90, 157, 0.5))',
            cursor: 'pointer',
            padding: '5px',
            userSelect: 'none',
            fontSize: '12px',
            height: '60px',
            width: '20px',
            textAlign: 'center',
            ...(isLeft ? {
                right: '-20px',
                left: 'auto',
                borderRadius: '0 5px 5px 0'
            } : {
                left: '-20px',
                right: 'auto',
                borderRadius: '5px 0 0 5px'
            })
        }
        this.isDragging = false;
        this.startY = 0;
        this.startTop = 0;
        this.newTop = 0;
    }

    // Disable shadow DOM
    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    // Lifecycle callback when the element is added to the DOM
    connectedCallback() {
        super.connectedCallback();
        // Add event listeners for dragging
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        // @ts-ignore // Ignoring potential type issue with mouseup event
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
        document.addEventListener('touchmove', this.handleDragMove.bind(this));
        // @ts-ignore // Ignoring potential type issue with touchend event
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
    }

    // Lifecycle callback when the element is removed from the DOM
    disconnectedCallback() {
        super.disconnectedCallback();
        // Remove event listeners for dragging
        document.removeEventListener('mousemove', this.handleDragMove.bind(this));
        // @ts-ignore // Ignoring potential type issue with mouseup event
        document.removeEventListener('mouseup', this.handleDragEnd.bind(this));
        document.removeEventListener('touchmove', this.handleDragMove.bind(this));
        // @ts-ignore // Ignoring potential type issue with touchend event
        document.removeEventListener('touchend', this.handleDragEnd.bind(this));
    }

    // Render method for the edge controls panel
    protected render(): unknown {
        console.log('render edge controls');
        console.log('isInjectionEnabled', isInjectionEnabled.get());
        console.log('isVisibleSettingsPanel', isVisibleSettingsPanel.get());

        // Determine horizontal position based on saved position and collapsed state
        const position = savedPosition.get();
        const isLeft = position.includes('left');
        if (isLeft) {
            this.style.left = isEdgeControlsCollapsed.get() ? '-100px' : '0';
            this.style.right = 'auto';
        } else {
            this.style.right = isEdgeControlsCollapsed.get() ? '-100px' : '0';
            this.style.left = 'auto';
        }

        // Control the display of the edge controls panel based on the hidden signal
        this.style.display = hiddenEdgeControls.get() ? 'none' : 'block';

        return html`
            <div id="html-injector-drag-handle" @mousedown=${this.handleDragStart} @touchstart=${this.handleDragStart}>
                <div class="drag-dots">
                ${Array.from({ length: 3 }).map(() => html`
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 15px;">
                        ${Array.from({ length: 2 }).map(() => html`
                            <div style="width: 4px; height: 4px; border-radius: 50%; background-color: var(--smart-theme-body-color);"></div>
                        `)}
                    </div>
                `)}
                </div>
            </div>
            <label class="html-injector-switch">
                <input type="checkbox" id="edge-injection-toggle" @change=${this.handleToggleChange} .checked=${isInjectionEnabled.get()}>
                <span class="html-injector-slider"></span>
            </label>
            <button id="html-injector-toggle-panel" class="html-injector-button menu_button" @click=${this.toggleSettingsPanel}>${isVisibleSettingsPanel.get() ? "Show Panel" : "Hide Panel"}</button> <button id="toggle-edge-controls" style=${styleMap(this.toggleEdgeButtonStyle)}
            @click=${this.handleToggleEdgeControls}
            >
            ${isEdgeControlsCollapsed.get() ? '<<' : '>>'}
            </button>
`
    }

    // Handlers for dragging the edge controls panel
    handleDragStart(e: DragEvent | MouseEvent | TouchEvent) {
        this.isDragging = true;
        // Get the starting Y position based on event type (mouse or touch)
        this.startY = e.type.includes('mouse') ? (e as MouseEvent).clientY : (e as unknown as TouchEvent).touches[0].clientY;
        this.startTop = this.getBoundingClientRect().top; // Get the initial top position
        e.preventDefault(); // Prevent default browser drag behavior
    }

    handleDragMove(event: DragEvent | MouseEvent | TouchEvent) {
        if (!this.isDragging) {
            return; // Do nothing if not dragging
        }
        // Get the current Y position
        const clientY = event.type.includes('mouse') ? (event as MouseEvent).clientY : (event as unknown as TouchEvent).touches[0].clientY;
        // Calculate the new top position, clamping it within the viewport
        let newTop = this.startTop + (clientY - this.startY);
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - this.offsetHeight));
        this.newTop = newTop; // Store the new top position
        this.style.top = `${newTop}px`; // Apply the new top position
    }

    handleDragEnd(event: DragEvent) {
        this.isDragging = false; // End dragging
        // If activation mode is custom, save the final top position
        if (activationMode.get() === 'custom') {
            saveTopPosition.set(this.newTop.toString());
        }
    }


    // Handler for toggling the collapse state of the edge controls
    handleToggleEdgeControls(event: Event) {
        isEdgeControlsCollapsed.set(!isEdgeControlsCollapsed.get()); // Toggle the collapsed state signal
        const value = isEdgeControlsCollapsed.get();
        const position = savedPosition.get();
        const isLeft = position.includes('left');

        // Update toggle button text and panel position (Translated from "更新切换按钮文本和面板位置")
        const toggleButton = event.target as HTMLElement;
        if (isLeft) {
            this.style.left = value ? '-100px' : '0';
            this.style.right = 'auto';
            toggleButton.textContent = value ? '>>' : '<<';
        } else {
            this.style.right = value ? '-100px' : '0';
            this.style.left = 'auto';
            toggleButton.textContent = value ? '<<' : '>>';
        }

        // Update button style (Translated from "更新按钮样式")
        this.toggleEdgeButtonStyle = {
            ...this.toggleEdgeButtonStyle,
            ...(isLeft ? {
                right: '-20px',
                left: 'auto',
                borderRadius: '0 5px 5px 0'
            } : {
                left: '-20px',
                right: 'auto',
                borderRadius: '5px 0 0 5px'
            })
        };
    }

    // Handler for the injection toggle switch
    handleToggleChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const isEnabled = target.checked;
        console.log('isEnabled', isEnabled);
        isInjectionEnabled.set(isEnabled); // Update the injection enabled signal
        if (isEnabled) {
            injectHtmlCode(); // Inject HTML if enabled
        } else {
            removeInjectedIframes(); // Remove iframes if disabled
        }
    }

    // Toggle the visibility of the settings panel by calling the method on the settingsPanel instance
    toggleSettingsPanel(event: Event) {
        this.settingsPanel.toggleSettingsPanel(event);
    }

    // Update the position of the edge controls (redundant with updateEdgeControlsPosition, might need review)
    updatePosition() {
        this.updateEdgeControlsPosition(savedPosition.get());
    }

    // Update the position and appearance of the edge controls panel
    updateEdgeControlsPosition(position: string) {
        // Determine if the panel is on the left or right side (Translated from "确定是左侧还是右侧")
        const isLeft = position.includes('left');
        // Update the style class of the panel (Translated from "更新面板的样式类")
        if (isLeft) {
            this.classList.add('left-side');
        } else {
            this.classList.remove('left-side');
        }

        // Set the vertical position (Translated from "设置垂直位置")
        switch (position) {
            case 'top-right':
            case 'top-left':
                this.style.top = '20vh';
                this.style.transform = 'none';
                break;
            case 'right-three-quarters':
            case 'left-three-quarters':
                this.style.top = '75vh';
                this.style.transform = 'none';
                break;
            case 'right-middle':
            case 'left-middle':
                this.style.top = '50%';
                this.style.transform = 'translateY(-50%)';
                break;
            case 'custom':
                // Use saved top position for custom mode
                this.style.top = saveTopPosition.get() ? `${saveTopPosition.get()}px` : "20vh";
                this.style.transform = 'none';
                break;
        }

        // Set the horizontal position (Translated from "设置水平位置")
        if (isLeft) {
            this.style.left = isEdgeControlsCollapsed.get() ? '-100px' : '0';
            this.style.right = 'auto';
        } else {
            this.style.right = isEdgeControlsCollapsed.get() ? '-100px' : '0';
            this.style.left = 'auto';
        }

        // Update the style of the toggle button (Translated from "更新切换按钮的样式")
        this.toggleEdgeButtonStyle = {
            ...this.toggleEdgeButtonStyle,
            ...(isLeft ? {
                right: '-20px',
                left: 'auto',
                borderRadius: '0 5px 5px 0'
            } : {
                left: '-20px',
                right: 'auto',
                borderRadius: '5px 0 0 5px'
            })
        };
        this.requestUpdate(); // Request an update to apply the new styles (Translated from "请求更新以应用新的样式")
    }
}

customElements.define('settings-panel', SettingsPanel);
customElements.define('edge-controls', EdgeControls);

// Function to initialize the HTML Injector functionality
export function initInjector() {
    // Create instances of the custom elements
    const settingsPanel = document.createElement('settings-panel') as SettingsPanel;
    const edgeControls = document.createElement('edge-controls') as EdgeControls;

    // Assign IDs to the elements
    settingsPanel.id = 'html-injector-settings';
    edgeControls.id = 'html-injector-edge-controls';

    // Establish cross-references between the two components
    settingsPanel.edgeControls = edgeControls;
    edgeControls.settingsPanel = settingsPanel;

    // Get the initial saved position
    const position = savedPosition.get();

    // Add the 'left-side' class if the saved position includes 'left'
    if (position.includes('left')) {
        edgeControls.classList.add('left-side');
    }

    // Append the elements to the document body
    document.body.appendChild(settingsPanel);
    document.body.appendChild(edgeControls);

    // Ensure initial position and styles are correct (Translated from "确保初始位置和样式正确")
    edgeControls.updateEdgeControlsPosition(position);

    // Add a resize listener to update the position on window resize
    window.addEventListener("resize", () => {
        edgeControls.updatePosition();
    })

    // Add a listener for messages from iframes
    window.addEventListener('message', handleMessage);

    // Add a listener for system theme changes to update iframes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateAllIframesTheme);

    // Observe the document body for changes to trigger HTML injection
    observer.observe(document.body, {
        childList: true, // Observe direct children
        subtree: true // Observe all descendants
    })
}
