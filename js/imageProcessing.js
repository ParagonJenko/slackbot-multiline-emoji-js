import { generateSlackbotCommand } from "./utils";

// Function to create a smaller image from a grid
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


// Function to create a single smaller image
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

// Function to calculate dimensions and position of a smaller image
function calculateImageDimensions(gridSize, img, index) {
    const width = Math.floor(img.width / gridSize);
    const height = Math.floor(img.height / gridSize);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const x = Math.floor(col * width);
    const y = Math.floor(row * height);
    return { width, height, x, y };
}

// Function to create a canvas element
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

// Function to draw an image on a canvas
function drawImageOnCanvas(img, canvas, x, y) {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, -x, -y);
    return canvas.toDataURL('image/png');
}