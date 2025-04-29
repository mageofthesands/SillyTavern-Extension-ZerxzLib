# SillyTavern Gemini API Enhancement Plugin - ZerxzLib

## Introduction

`ZerxzLib` is an extension plugin for SillyTavern designed to enhance the usage experience of the Gemini API. It provides features such as multi-API Key rotation, automatic fetching of new models, and more detailed error message interpretation, helping users use the Gemini API more efficiently and stably.

## Main Features

1. **Multi-API Key Rotation:**

   * Allows users to configure multiple Gemini API Keys and automatically rotate their use.

   * Automatically switches to the next available Key when one Key encounters an issue, improving stability.

   * Supports entering multiple API Keys in a text box in the settings interface, separated by newlines or semicolons.

   * The interface will display the currently used Key and the previously used Key.

2. **Automatic Fetching of New Models:**

   * Automatically detects newly released Gemini API models.

   * Adds new models to SillyTavern's model selection list.

   * Updates the configuration only when the model list changes, avoiding redundant updates.

   * **Note:** Upon initial loading of the plugin, all Gemini models will be added to the list.

3. **Error Message Interpretation:**

   * When the Gemini API returns an error, displays more detailed error information, including the reasons for common errors and possible solutions.

   * Provides explanations for common error codes, making it easy for users to quickly identify problems.

   * Users can choose whether to enable this feature to display detailed error information only when needed.

   * Error messages will be displayed in a popup window, with a detailed table of error reasons and solutions.

4. **Key Switching Toggle:**

   * Users can toggle the key rotation function on or off.

   * When the toggle is off, the plugin will not automatically rotate keys.

5. **Error Reporting Toggle:**

   * Users can toggle the error reporting function on or off.

   * When the toggle is off, the plugin will not display detailed error messages.

## Usage

1. **Installation (Method 1):**

   * Copy the plugin code to the `public/scripts/extensions/third-party` directory of SillyTavern.

   * Ensure that the `js` field in the `manifest.json` file points to the correct `zerxzLib.js` file path.

2. **Installation (Method 2):**

   * In the extensions page of SillyTavern, click the "Install Extension" button in the upper right corner.

   * Enter the repository address of this plugin in the popup window (e.g., `https://github.com/ZerxZ/SillyTavern-Extension-ZerxzLib`) to install.

3. **Configuration:**

   * In SillyTavern's API settings page (usually Google AI Studio/MakerSuite), you will see the following enhanced features:

     * A text box for entering multiple Gemini API Keys, one per line or separated by semicolons.

     * Display of the currently used key and the previously used key.

     * A "Fetch New Models" button to manually pull new models.

     * A "Save Key" button to save the configuration of multiple API Keys.

     * A "Key Switching Settings" button to enable or disable the key rotation function.

     * A "View Error Reasons" button to display common Gemini API error messages.

     * An "Error Reporting Toggle" button to enable or disable the error reporting function.

4. **Multiple API Keys:**

   * Enter your multiple Gemini API Keys in the text box, one per line or separated by semicolons.

   * The plugin will automatically rotate these Keys, when the current Key is unavailable, it will switch to the next Key.

5. **Automatic Fetching of New Models:**

   * The plugin will automatically detect new models from the Gemini API and add them to SillyTavern's model selection list.

   * You can also manually trigger this by clicking the "Fetch New Models" button.

6. **Error Message Interpretation:**

   * When the Gemini API returns an error, if this feature is enabled, the plugin will pop up a window containing error details and solutions.

   * Provides explanations for common error codes, making it easy for users to quickly identify problems.

   * Users can choose whether to enable this feature to display detailed error information only when needed.

   * Error messages will be displayed in a popup window, with a detailed table of error reasons and solutions.

7. **Key Switching Toggle:**

   * Click the "Key Switching Settings" button to enable or disable the key rotation function.

8. **Error Reporting Toggle:**

   * Click the "Error Reporting Toggle" button to enable or disable the error reporting function.

## Notes

* Please ensure your API Key is valid.

* If the plugin is not working correctly, please check the error messages in the Console.

* **Upon initial loading of the plugin, all Gemini models will be added to the list.**

* For `Internal Server Error`, mobile users should use Clash and not third-party proxy software. PC users should enable service mode and TUN mode. If this error still occurs, please delete the address in the reverse proxy address.

## File Structure
