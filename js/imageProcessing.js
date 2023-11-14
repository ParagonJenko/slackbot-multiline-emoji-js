import { generateSlackbotCommand } from "./utils";

/**
 * Creates smaller images from a grid and generates a Slackbot command.
 * @param {string} item - The base image to split into smaller images.
 * @param {number} gridSize - The number of rows and columns in the grid.
 * @param {string} fileName - The base name for the generated images.
 * @returns {Promise<{ images: Array<string>, textCommand: string }>} - A promise resolving to an object containing the generated images and Slackbot command.
 */
export async function createSmallerImages(item, gridSize, fileName) {
    const images = [];
    let textCommand =  generateSlackbotCommand(gridSize, fileName);

    for (let i = 0; i < gridSize * gridSize; i++) {
        const image = await createSingleSmallerImage(item, gridSize, i);
        images.push(image);
    }

    // console.log(textCommand);

    return { images, textCommand };
}


/**
 * Creates a single smaller image from the provided base image.
 * @param {string} item - The base image to split into smaller images.
 * @param {number} gridSize - The number of rows and columns in the grid.
 * @param {number} index - The index of the smaller image in the grid.
 * @returns {Promise<string>} - A promise resolving to the base64-encoded data URL of the generated smaller image.
 */
async function createSingleSmallerImage(item, gridSize, index) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = item;
        img.onload = () => {
            const { width, height, x, y } = calculateImageDimensions(gridSize, img, index);
            const canvas = createCanvas(width, height);
            const dataURL = drawImageOnCanvas(img, canvas, x, y);
            resolve(dataURL);
        };
        img.onerror = reject;
    });
}

/**
 * Calculates dimensions and position of a smaller image within the grid.
 * @param {number} gridSize - The number of rows and columns in the grid.
 * @param {HTMLImageElement} img - The original image.
 * @param {number} index - The index of the smaller image in the grid.
 * @returns {{ width: number, height: number, x: number, y: number }} - An object containing the calculated dimensions and position.
 */
function calculateImageDimensions(gridSize, img, index) {
    const width = Math.floor(img.width / gridSize);
    const height = Math.floor(img.height / gridSize);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const x = Math.floor(col * width);
    const y = Math.floor(row * height);
    return { width, height, x, y };
}

/**
 * Creates a canvas element with the specified dimensions.
 * @param {number} width - The width of the canvas.
 * @param {number} height - The height of the canvas.
 * @returns {HTMLCanvasElement} - The created canvas element.
 */
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

/**
 * Draws an image on a canvas at the specified position.
 * @param {HTMLImageElement} img - The image to be drawn.
 * @param {HTMLCanvasElement} canvas - The canvas on which to draw the image.
 * @param {number} x - The x-coordinate of the position to draw the image.
 * @param {number} y - The y-coordinate of the position to draw the image.
 * @returns {string} - The base64-encoded data URL of the drawn image on the canvas.
 */
function drawImageOnCanvas(img, canvas, x, y) {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, -x, -y);
    return canvas.toDataURL('image/png');
}