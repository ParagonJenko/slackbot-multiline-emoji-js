import { makeCanvas, indexToColRow } from './canvas';

/**
 * Splits an image URL into an NxN grid of PNG tiles.
 * The source image is decoded once and all tiles are sliced in parallel.
 *
 * @param imageUrl - Object URL of the source image.
 * @param gridSize - NxN grid dimension.
 * @returns Array of base64 data URL PNGs in row-major order.
 */
export function createSmallerImages(
    imageUrl: string,
    gridSize: number,
): Promise<string[]> {
    return loadImage(imageUrl).then((img) =>
        Promise.all(
            Array.from({ length: gridSize * gridSize }, (_, i) =>
                sliceTile(img, gridSize, i),
            ),
        ),
    );
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

function sliceTile(img: HTMLImageElement, gridSize: number, index: number): string {
    const tileW = Math.floor(img.width / gridSize);
    const tileH = Math.floor(img.height / gridSize);
    const { col, row } = indexToColRow(index, gridSize);
    const { canvas, ctx } = makeCanvas(tileW, tileH);
    ctx.drawImage(img, 0 - col * tileW, 0 - row * tileH);
    return canvas.toDataURL('image/png');
}
