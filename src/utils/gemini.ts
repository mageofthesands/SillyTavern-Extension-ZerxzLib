import { oai_settings } from "@silly-tavern/scripts/openai.js";
import { callGenericPopup, POPUP_TYPE } from "@silly-tavern/scripts/popup.js";
import { saveKey } from "./utils";

interface GeminiModel {
	description: string;
	displayName: string;
	inputTokenLimit: number;
	maxTemperature: number;
	name: string;
	outputTokenLimit: number;
	supportedGenerationMethods: string[];
	temperature: number;
	topK: number;
	topP: number;
	version: string;
}

interface GeminiResponse {
	models: GeminiModel[];
}

interface Model {
	name: string;
	model: string;
}

export async function getGeminiModel(key: string) {
	try {
		const result = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/?key=${key}`,
		);
		const data = (await result.json()) as GeminiResponse;
		if (!data?.models) {
			return [];
		}
		console.log(data);
		return data.models
			.filter((model) => model.name.includes("gemini"))
			.map((modelData) => {
				const model = modelData.name.replace("models/", "");
				const name = modelData.displayName;

				return {
					name,
					model,
				};
			});
	} catch (e) {
		console.error(e);
		return [];
	}
}

export const GEMINI_SOURCES = ["makersuite", "aistudio"];

export const isGeminiSource = () =>
	GEMINI_SOURCES.includes(oai_settings.chat_completion_source);

export function throwGeminiError(text = "") {

	callGenericPopup(`
				${text}
				<table class="responsiveTable">
					<thead>
						<tr>
							<th>Error Code</th>
							<th>Reason or Solution</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>429/Resource has been exhausted</td>
							<td>Hit the rate limit, please wait a moment. If this error still appears, please adjust the maximum context to below 50k.</td>
						</tr>
						<tr>
							<td>Internal Server Error</td>
							<td>If encountered on mobile, switch to Clash. Do not use third-party proxy software like **VPN** or accelerators. PC users should enable service mode and TUN mode. If this error still occurs, check if the reverse proxy address is empty. If there is an address, delete it.</td>
						</tr>
						<tr>
							<td>User location is not supported for the API use.</td>
							<td>The node is in a restricted country, please change the node (USA is the highest priority, please do not choose regions like Europe, Hong Kong, Russia, etc.)</td>
						</tr>
						<tr>
							<td>Too Many Requests</td>
							<td>Refreshed too frequently, wait one minute. If ineffective, the daily request limit has been reached.</td>
						</tr>
						<tr>
							<td>Bad request</td>
							<td>Network environment error or API is dead (account or project banned)</td>
						</tr>
						<tr>
							<td>API key expired. Please renew the API key</td>
							<td>API key has expired or been deleted</td>
						</tr>
						<tr>
							<td>The model is overloaded. Please try later</td>
							<td>This model is temporarily closed for fine-tuning, temporarily unavailable. Please switch to another model or wait for a period of time.</td>
						</tr>
						<tr>
							<td>Please use a valid role: user, model.</td>
							<td>You are using a preset that requires patching. Please switch to a preset that does not require patching or apply the patch.</td>
						</tr>
						<tr>
							<td>User location is not supported for the API use without a billing account linked.</td>
							<td>Located in a region restricted for the free tier by Google policy (e.g., UK, Italy)</td>
						</tr>
						<tr>
							<td>API key not valid. Please pass a valid API key</td>
							<td>API returned an error, check if the API is available</td>
						</tr>
						<tr>
							<td>Permission denied: Consumer has been suspended.</td>
							<td>Google account banned</td>
						</tr>
						<tr>
							<td>MakerSuite API returned no candidate</td>
							<td>Prompt was blocked due to : OTHER. This output was truncated, please turn off streaming.</td>
						</tr>
						<tr>
							<td>Not Found</td>
							<td>Incorrect model selection, please do not select models outside the Gemini series or Gemini Ultra.</td>
						</tr>
						<tr>
							<td>MakerSuite Candidate text empty</td>
							<td>Still truncated. There are many solutions: close some global world books / change input content / update to a newer version of the preset.</td>
						</tr>
						<tr>
							<td>403/Forbidden</td>
							<td>Account or project banned, API key cannot be called.</td>
						</tr>
					</tbody>
				</table>
			`, POPUP_TYPE.TEXT, "", {
		large: true,
		wide: true,
		allowVerticalScrolling: true,
	});
}

export async function initGeminiModels(secrets: Record<string, string> = {}) {
	if (!secrets) {
		return;
	}
	const modelStr = JSON.parse(secrets.models_makersuite ?? "[]") as Model[];
	const api_key = secrets.api_key_makersuite ?? "";
	console.log("ZerxzLib init"); // Keeping this as it might be a specific library name
	const optgroup = $("#model_google_select > optgroup");
	console.log("optgroup", optgroup);
	const primaryVersions = optgroup[0];
	const subVersions = optgroup[1];
	console.log("subVersions", subVersions);
	const subVersionsArray = Array.from(
		subVersions.children,
	) as HTMLOptionElement[];
	const primaryVersionsArray = Array.from(
		primaryVersions.children,
	) as HTMLOptionElement[];
	console.log("subVersionsArray", subVersionsArray);
	const subVersionsValues = subVersionsArray.map((el) => el.value);
	const primaryVersionsValues = primaryVersionsArray.map((el) => el.value);
	const originalVersions = [
		...primaryVersionsValues,
		...subVersionsValues,
	].flat();
	const cachedVersions = modelStr.map((model) => model.model);
	// Check if it's the first load
	if (modelStr.length > 0) {
		for (const model of modelStr) {
			if (originalVersions.includes(model.model)) {
				continue;
			}
			const option = document.createElement("option");
			option.value = model.model;
			option.text = `${model.name}(${model.model})`;
			subVersions.appendChild(option);
		}
	}
	const geminiModels = await getGeminiModel(api_key);
	console.log("geminiModels", geminiModels);
	const geminiModelOptions = geminiModels.filter(
		(model) =>
			!originalVersions.includes(model.model) &&
			!cachedVersions.includes(model.model),
	);

	if (geminiModelOptions.length === 0) {
		console.log("No new models");
	} else {
		console.log("geminiModelOptions", geminiModelOptions);
		for (const model of geminiModelOptions) {
			const option = document.createElement("option");
			option.value = model.model;
			option.text = `${model.name}(${model.model})`;
			subVersions.appendChild(option);
		}
		saveKey("models_makersuite", JSON.stringify(geminiModelOptions));
	}
	const uniqueModels = new Set([...originalVersions, ...cachedVersions, ...geminiModelOptions.map((model) => model.model)]);
	if (isGeminiSource() && !!secrets.api_key_makersuite_model) {
		if (!uniqueModels.has(secrets.api_key_makersuite_model)) {
			return
		}
		oai_settings.google_model = secrets.api_key_makersuite_model;
		$('#model_google_select').val(oai_settings.google_model);
		$(`#model_google_select option[value="${oai_settings.google_model}"`)
			// @ts-ignore
			.attr('selected', true);
	}

}
