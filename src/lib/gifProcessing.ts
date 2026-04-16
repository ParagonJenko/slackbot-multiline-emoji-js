import { parseGIF, decompressFrames } from 'gifuct-js';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { makeCanvas, indexToColRow } from './canvas';

/**
 * Splits an animated GIF into NxN animated GIF tiles.
 *
 * Each output tile is an animated GIF containing one spatial crop region
 * across all frames of the source, preserving per-frame delay and transparency.
 *
 * @param file - The source GIF file.
 * @param gridSize - NxN grid dimension.
 * @param onProgress - Optional callback receiving 0–100 progress value.
 * @returns Row-major array of encoded animated GIF bytes.
 */
export async function splitGif(
    file: File,
    gridSize: number,
    onProgress?: (pct: number) => void,
): Promise<Uint8Array[]> {
    const buffer = await file.arrayBuffer();
    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);

    if (!frames.length) throw new Error('No frames found in GIF.');

    const gifWidth: number = gif.lsd.width;
    const gifHeight: number = gif.lsd.height;
    const tileW = Math.floor(gifWidth / gridSize);
    const tileH = Math.floor(gifHeight / gridSize);
    const totalTiles = gridSize * gridSize;

    // ── Phase 1: composite all frames ────────────────────────────────────────
    // Handles disposal modes and partial-frame offsets so optimised GIFs
    // (which only store changed regions per frame) render correctly.
    const { canvas: compositeCanvas, ctx } = makeCanvas(gifWidth, gifHeight);
    const compositedFrames: ImageData[] = [];
    let preFrameSnapshot: ImageData | null = null;

    for (let fi = 0; fi < frames.length; fi++) {
        const frame = frames[fi];
        const { dims, patch } = frame;

        // Apply previous frame's disposal before painting this frame
        if (fi > 0) {
            const prev = frames[fi - 1];
            if (prev.disposalType === 3 && preFrameSnapshot) {
                // Restore to state before previous frame was painted
                ctx.putImageData(preFrameSnapshot, 0, 0);
            } else if (prev.disposalType === 2) {
                // Clear the region occupied by the previous frame
                ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
            }
            // disposalType 0 and 1: leave canvas as-is
        }

        // Snapshot canvas state before painting (needed if next frame uses disposal 3)
        preFrameSnapshot = ctx.getImageData(0, 0, gifWidth, gifHeight);

        // Paint this frame's patch directly using putImageData with offset — no
        // intermediate canvas needed.
        const imageData = new ImageData(
            new Uint8ClampedArray(patch),
            dims.width,
            dims.height,
        );
        ctx.putImageData(imageData, dims.left, dims.top);

        compositedFrames.push(ctx.getImageData(0, 0, gifWidth, gifHeight));
        onProgress?.(Math.round(((fi + 1) / frames.length) * 40));
    }

    // ── Phase 2: encode one animated GIF per tile ─────────────────────────────
    const tileGifs: Uint8Array[] = [];

    for (let tileIdx = 0; tileIdx < totalTiles; tileIdx++) {
        const { col, row } = indexToColRow(tileIdx, gridSize);
        const srcX = col * tileW;
        const srcY = row * tileH;
        const encoder = GIFEncoder();

        for (let fi = 0; fi < compositedFrames.length; fi++) {
            // Extract tile region directly from the composited full frame.
            // We use the composited frame stored in Phase 1, not ctx.getImageData,
            // so the correct frame data is used regardless of canvas state.
            const composited = compositedFrames[fi];
            const pixelCount = tileW * tileH;

            // Crop the tile from the full composited frame manually — we can't use
            // ctx.getImageData with offsets on the stored ImageData directly.
            const tileRgba = new Uint8Array(pixelCount * 4);
            for (let py = 0; py < tileH; py++) {
                for (let px = 0; px < tileW; px++) {
                    const srcOff = ((srcY + py) * gifWidth + (srcX + px)) * 4;
                    const dstOff = (py * tileW + px) * 4;
                    tileRgba[dstOff]     = composited.data[srcOff];
                    tileRgba[dstOff + 1] = composited.data[srcOff + 1];
                    tileRgba[dstOff + 2] = composited.data[srcOff + 2];
                    tileRgba[dstOff + 3] = composited.data[srcOff + 3];
                }
            }

            // Track fully-transparent pixels before quantising.
            const isTransparent = new Uint8Array(pixelCount);
            for (let p = 0; p < pixelCount; p++) {
                isTransparent[p] = tileRgba[p * 4 + 3] === 0 ? 1 : 0;
            }

            // gifenc's quantize/applyPalette both expect an RGBA Uint8Array whose
            // byte length is a multiple of 4.  We pass 255 colours so index 255
            // stays available as the transparency sentinel.
            const palette = quantize(tileRgba, 255);
            const index = applyPalette(tileRgba, palette);

            // Map fully-transparent pixels to the reserved transparency index (255)
            const hasTransparency = isTransparent.some(Boolean);
            if (hasTransparency) {
                for (let p = 0; p < index.length; p++) {
                    if (isTransparent[p]) index[p] = 255;
                }
                // Pad palette to 256 entries so slot 255 is valid
                while (palette.length < 256) palette.push([0, 0, 0]);
            }

            // GIF delay is in centiseconds (1/100s); gifuct gives milliseconds.
            // Use ?? not || so a legitimate 0ms delay is not coerced to 100ms.
            const delayCs = Math.round((frames[fi].delay ?? 100) / 10);

            encoder.writeFrame(index, tileW, tileH, {
                palette,
                delay: delayCs,
                ...(hasTransparency && { transparent: true, transparentIndex: 255 }),
            });
        }

        encoder.finish();
        tileGifs.push(encoder.bytes());
        onProgress?.(40 + Math.round(((tileIdx + 1) / totalTiles) * 60));
    }

    // Clean up the composite canvas
    compositeCanvas.width = 0;
    compositeCanvas.height = 0;

    return tileGifs;
}
