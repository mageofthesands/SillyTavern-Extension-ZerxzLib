import { STATE } from "./constants";
import { isGeminiSource, throwGeminiError } from "./gemini";

// @ts-ignore // Ignoring potential type issues with toastr library
const oldError = toastr.error;

// Initialize Toastr to intercept error messages
export function initToastr() {
    // @ts-ignore // Ignoring potential type issues with toastr arguments
    toastr.error = (/** @type { any[]} */ ...args) => {
        // Call the original toastr.error function
        oldError(...args);

        // Log the arguments to the console for debugging
        console.log(args);
        console.error(...args);

        // If the source is not Gemini or the error reporting state is off, do not proceed
        if (!isGeminiSource() || !STATE.throwGeminiErrorState) {
            return;
        }

        // Extract the message and type from the arguments
        const [message, type] = args;

        // If there's no type specified, do not proceed
        if (!type) {
            return;
        }

        // If the error type is "Chat Completion API", call throwGeminiError with detailed info
        if (type === "Chat Completion API") {
            // Get the element displaying the last used key
            const lastKeyElement = $("#last_key_maker_suite")[0] as HTMLSpanElement;

            // Call the throwGeminiError function with a translated error message and details
            throwGeminiError(`<h3>Chat Completion API Error</h3>
				<p>${message}</p>
				<p> ${lastKeyElement.textContent}</p>`);
        }
    };
}
