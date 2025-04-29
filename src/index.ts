import {
	eventSource,
	event_types,
} from "@silly-tavern/script.js";
import { getGeminiModel, getSecrets, isGeminiSource, saveKey, switchSecretsFromArray, throwGeminiError, STATE, CUSTOM_KEY, initGeminiModels, initToastr } from "./utils";

import "./layouts/GeminiLayouts";
import { initInjector } from "./layouts/HtmlInjector";
import type { GeminiLayouts } from "./layouts/GeminiLayouts";
import { initContainer } from "layouts/ExtensionContainer";

; (async () => {
	// Initialize Toastr notifications
	initToastr();
	// Initialize the HTML injector
	initInjector();
	// Initialize the extension container
	initContainer();
	// Get the form element with id "makersuite_form" using a jQuery selector (Translated from "获取form元素 id为"makersuite_form"的元素 用jquery的选择器")
	const secrets = (await getSecrets()) ?? {};
	// Initialize Gemini models with fetched secrets
	await initGeminiModels(secrets);
	const form = $("#makersuite_form")[0];
	console.log("secrets", secrets);
	// Create a new GeminiLayouts element
	const geminiLayout = document.createElement("gemini-layouts") as GeminiLayouts;
	// Set properties of the geminiLayout component based on secrets and state
	geminiLayout.currentKey = secrets.api_key_makersuite
	geminiLayout.lastKey = secrets[CUSTOM_KEY]?.split("\n").pop() || ""
	geminiLayout.throwGeminiErrorState = STATE.throwGeminiErrorState
	geminiLayout.switchKeyMakerSuite = STATE.switchState
	geminiLayout.apiKeys = secrets[CUSTOM_KEY] || ""

	// Append the geminiLayout component to the form
	form.appendChild(geminiLayout);

	// Listen for the CHAT_COMPLETION_SETTINGS_READY event to switch secrets
	eventSource.on(
		event_types.CHAT_COMPLETION_SETTINGS_READY,
		switchSecretsFromArray,
	);
	// Listen for the CHATCOMPLETION_MODEL_CHANGED event to save the selected model
	eventSource.on(event_types.CHATCOMPLETION_MODEL_CHANGED, async (model: string) => {
		if (isGeminiSource()) await saveKey("api_key_makersuite_model", model);
	})
})();
