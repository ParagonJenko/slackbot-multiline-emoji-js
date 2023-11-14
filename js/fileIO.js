import JSZip, { file } from "jszip";

/**
 * Creates a ZIP file and adds images and a Slackbot command to it.
 * @param {string} fileName - The base name for the ZIP file and the images.
 * @param {Array<string>} images - An array of base64-encoded image data.
 * @param {string} textCommand - The Slackbot command text to be added to the ZIP file.
 * @param {number} gridSize - The number of rows and columns in the grid.
 * @returns {JSZip} - The created JSZip object containing the files.
 */
export function createZipFile(fileName, images, textCommand, gridSize) {
    const zip = new JSZip();
    images.forEach((data, i) => {
        zip.file(`${fileName}-${i % gridSize}-${Math.floor(i / gridSize)}.png`, data.split(',')[1], { base64: true });
    });
    zip.file("command.txt", textCommand);
    return zip;
}

/**
 * Generates a URL for the provided ZIP file.
 * @param {JSZip} zip - The JSZip object representing the ZIP file.
 * @returns {Promise<string>} - A promise resolving to the URL of the generated ZIP file.
 */
export function generateZipURL(zip) {
    return new Promise((resolve) => {
        zip.generateAsync({ type: 'blob' })
            .then((blob) => {
                resolve(URL.createObjectURL(blob));
            });
    });
}