import { LitElement, html, type PropertyDeclarations } from 'lit';
import { ref, createRef } from 'lit/directives/ref.js';
import { SignalWatcher, signal, watch } from '@lit-labs/signals';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import { useExtensionSetting } from 'utils/extension';
const { } = useExtensionSetting("zerxz-lib");
class ZerxzLibContainer extends LitElement {
    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }
    render() {
        return html`
    <div class="zerxz-lib-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>ZerxzLib</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">

            </div>
        </div>
    </div>
    `;
    }
}



customElements.define('zerxz-lib-container', ZerxzLibContainer);
export function initContainer() {
    const container = document.createElement('zerxz-lib-container');
    container.className = "extension_container";
    container.id = "zerxzlib_container";
    const root = document.getElementById("extensions_settings2");
    if (!root) {
        return;
    }
    root.appendChild(container);
}
