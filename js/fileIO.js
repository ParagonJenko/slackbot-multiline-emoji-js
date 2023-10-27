import JSZip from "jszip";

// Function to create a ZIP file and add images and Slackbot command
export function createZipFile(fileName, images, textCommand, gridSize) {
    const zip = new JSZip();
    images.forEach((data, i) => {
        zip.file(`${fileName}-${i % gridSize}-${Math.floor(i / gridSize)}.png`, data.split(',')[1], { base64: true });
    });
    zip.file("command.txt", textCommand);
    return zip;
}

// Function to generate a URL for the ZIP file
export function generateZipURL(zip) {
    return new Promise((resolve) => {
        zip.generateAsync({ type: 'blob' })
            .then((blob) => {
                resolve(URL.createObjectURL(blob));
            });
    });
}