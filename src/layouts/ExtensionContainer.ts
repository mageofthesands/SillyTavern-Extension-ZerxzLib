import { LitElement, html, type PropertyDeclarations } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { htmlInjectorSettings } from 'utils/setting';

// Get the signal for hiding/showing edge controls
const { hiddenEdgeControls } = htmlInjectorSettings.getSignals();

class ZerxzLibContainer extends LitElement {
    // Disable shadow DOM
    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    render() {
        // Render the HTML template
        return html`
    <div class="zerxz-lib-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>ZerxzLib</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" >
    <div class="flex-container" >
        <div class="menu_button menu_button_icon interactable" @click=${this.handlerHiddenEdgeControl}>
            <i class=${classMap({
                "fa-solid": true,
                "fa-bug": hiddenEdgeControls.get(), // Assuming 'fa-bug' indicates hidden/issue
                "fa-bug-slash": !hiddenEdgeControls.get(), // Assuming 'fa-bug-slash' indicates visible/no issue
            })} ></i>
            <small >${!hiddenEdgeControls.get() ? "Hide" : "Show"} Controls Panel</small>
        </div>
    </div>
    <hr>
</div>
        </div>
    </div>
    `;
    }

    // Handler for toggling the visibility of edge controls
    handlerHiddenEdgeControl() {
        hiddenEdgeControls.set(!hiddenEdgeControls.get());
        this.requestUpdate(); // Request a re-render to update the text and icon
    }
}

// Define the custom element
customElements.define('zerxz-lib-container', ZerxzLibContainer);

// Function to initialize and append the container to the DOM
export function initContainer() {
    const container = document.createElement('zerxz-lib-container');
    container.className = "extension_container";
    container.id = "zerxzlib_container";
    const root = document.getElementById("extensions_settings2"); // Target element to append to
    if (!root) {
        console.error("Root element #extensions_settings2 not found."); // Log error if root is missing
        return;
    }
    root.appendChild(container);
}
