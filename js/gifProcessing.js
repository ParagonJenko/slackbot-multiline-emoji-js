/*

We need to:
1. Get the GIF into a readable format.
2. Split the GIF into an array of frames.
3. For each frame, split this into gridSize.
4. For each frame, encode this back into a frame.
5. Return the full GIF both in a file, and onto the canvas.

Other thoughts:
- We can move the drawing on the canvas out of the processing functions.

*/

// Function to create a smaller image from a grid
export async function createSmallerGif(item, gridSize, fileName) {
    
}


// Function to create a single smaller image
async function createSingleSmallerGif(item, gridSize, index) {
    
}

// Function to calculate dimensions and position of a smaller image
function calculateGifDimensions(gridSize, img, index) {
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
function drawGifOnCanvas(img, canvas, x, y) {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, -x, -y);
    return canvas.toDataURL('image/gif');
}