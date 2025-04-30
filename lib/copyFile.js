import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module (lib)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

// Determine the root directory of SillyTavern by finding the 'public' directory
const sillyTavern = __dirname.substring(0, __dirname.lastIndexOf('public'));

// Get the base name of the extension directory (e.g., 'SillyTavern-Extension-ZerxzLib')
const dirBasename = path.basename(path.dirname(__dirname));

// Construct the path to the extensions directory within the data folder
const extesionsDir = path.join(sillyTavern, 'data', 'default-user', 'extensions');

// Construct the full path to the extension's directory within the data folder (destination)
const extexionDir = path.join(extesionsDir, dirBasename);

/**
 * Get the path to the script file's directory based on the manifest.json.
 * Reads the manifest from the provided manifestPath.
 * @param {string} manifestPath - The full path to the manifest.json file.
 * @param {string} baseDir - The base directory to join with the script file path from the manifest.
 * @returns {string} The path to the script file's directory.
 **/
function getScriptDirPath(manifestPath, baseDir) {
    // Read and parse the manifest.json file
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // Extract the script file path from the manifest
    const { js: scriptFilepath } = manifest;
    // Return the directory name of the script file within the base directory
    return path.dirname(path.join(baseDir, scriptFilepath));
}

// Define the path to the manifest.json in the source directory
const sourceManifestPath = path.join(path.dirname(__dirname), 'manifest.json');

// Determine the path to the script directory in the destination (data) folder
// Read the manifest from the source directory, but construct the path relative to the destination extension directory
const dataExtensionScriptPath = getScriptDirPath(sourceManifestPath, extexionDir);

// Determine the path to the script directory in the source (public) folder
// Read the manifest from the source directory, and construct the path relative to the source extension directory
const publicExtensionScriptPath = getScriptDirPath(sourceManifestPath, path.dirname(__dirname));


// If the destination script directory exists, remove it recursively
if (fs.existsSync(dataExtensionScriptPath)) {
    console.log(`Removing existing destination directory: ${dataExtensionScriptPath}`);
    fs.rmdirSync(dataExtensionScriptPath, { recursive: true });
}

// If the destination script directory does not exist, create it recursively
if (!fs.existsSync(dataExtensionScriptPath)) {
    console.log(`Creating destination directory: ${dataExtensionScriptPath}`);
    fs.mkdirSync(dataExtensionScriptPath, { recursive: true });
}

// Read all files in the source script directory and copy them to the destination script directory
fs.readdirSync(publicExtensionScriptPath).forEach(file => {
    const from = path.join(publicExtensionScriptPath, file);
    const to = path.join(dataExtensionScriptPath, file);
    console.log(`Copying ${from} to ${to}`);
    fs.copyFileSync(from, to);
});

console.log('File copying complete.');
