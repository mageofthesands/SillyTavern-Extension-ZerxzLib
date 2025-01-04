import {
    saveSettingsDebounced,
} from "@silly-tavern/script.js";
import { extension_settings } from '@silly-tavern/scripts/extensions.js';
const extensionName = "extension-zerxz-lib";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
//@ts-ignore
extension_settings[extensionName] ??= {};
// @ts-ignore
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const extensionSettings: Record<string, any> = extension_settings[extensionName];
const getExtensionSettings = () => extension_settings;
export function useExtensionSetting(path: string | undefined = undefined) {
    if (path) {
        extensionSettings[path] ??= {};
    }
    const _extensionSettings = path ? extensionSettings[path] : extensionSettings;
    saveSettingsDebounced();
    // @ts-ignore
    function setSetting(path: string, value: any) {
        _extensionSettings[path] = value;
        saveSettingsDebounced();
    }
    function setSettings(settings: Record<string, any>) {
        Object.assign(_extensionSettings, settings);
        saveSettingsDebounced();
    }
    function getSettings() {
        return _extensionSettings;
    }
    function getSetting(path: string) {
        return _extensionSettings[path];
    }

    return {
        getExtensionSettings,
        extensionSettings: _extensionSettings,
        setSetting,
        getSetting,
        setSettings,
        getSettings,
        saveSettingsDebounced,
        extensionFolderPath,
    }
}
