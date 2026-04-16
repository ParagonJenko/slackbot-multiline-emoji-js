import { describe, it, expect } from 'vitest';
import { splitGif } from './gifProcessing';

// ── Minimal GIF binary ────────────────────────────────────────────────────────
// A real 2×2, 2-frame animated GIF (no disposal, 2 colours, 10ms delay).
// Inline bytes so the test has no external file dependency.
const MINIMAL_GIF_2x2 = new Uint8Array([
    // GIF89a header
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
    // Logical Screen Descriptor: 2w × 2h
    0x02, 0x00, 0x02, 0x00, 0x80, 0x00, 0x00,
    // Global Colour Table: black, white
    0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
    // Graphic Control Extension: delay=1 (10ms), no transparency
    0x21, 0xF9, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00,
    // Image Descriptor: x=0, y=0, 2w × 2h, no local CT
    0x2C, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x02, 0x00, 0x00,
    // Image Data (LZW)
    0x02, 0x05, 0x84, 0x1D, 0x81, 0x7A, 0x50, 0x00,
    // Graphic Control Extension: frame 2
    0x21, 0xF9, 0x04, 0x00, 0x02, 0x00, 0x00, 0x00,
    // Image Descriptor: frame 2
    0x2C, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x02, 0x00, 0x00,
    // Image Data: frame 2
    0x02, 0x05, 0x84, 0x1D, 0x81, 0x7A, 0x50, 0x00,
    // Trailer
    0x3B,
]);

function makeGifFile(data = MINIMAL_GIF_2x2): File {
    return new File([data], 'test.gif', { type: 'image/gif' });
}

// Canvas stubs are provided globally by src/test-setup.ts.

describe('splitGif', () => {
    it('returns gridSize² tile buffers', async () => {
        const tiles = await splitGif(makeGifFile(), 2);
        expect(tiles.length).toBe(4);
    });

    it('each tile is a non-empty Uint8Array', async () => {
        const tiles = await splitGif(makeGifFile(), 2);
        tiles.forEach((tile) => {
            expect(tile).toBeInstanceOf(Uint8Array);
            expect(tile.length).toBeGreaterThan(0);
        });
    });

    it('each tile starts with the GIF89a signature', async () => {
        const tiles = await splitGif(makeGifFile(), 2);
        const GIF_HEADER = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
        tiles.forEach((tile) => {
            GIF_HEADER.forEach((byte, i) => expect(tile[i]).toBe(byte));
        });
    });

    it('calls onProgress with values between 0 and 100', async () => {
        const values: number[] = [];
        await splitGif(makeGifFile(), 2, (pct) => values.push(pct));
        expect(values.length).toBeGreaterThan(0);
        expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...values)).toBeLessThanOrEqual(100);
    });

    it('last onProgress call is 100', async () => {
        const values: number[] = [];
        await splitGif(makeGifFile(), 2, (pct) => values.push(pct));
        expect(values[values.length - 1]).toBe(100);
    });

    it('works for a 1×1 grid', async () => {
        const tiles = await splitGif(makeGifFile(), 1);
        expect(tiles.length).toBe(1);
    });

    it('throws for an empty / invalid file', async () => {
        const empty = new File([new Uint8Array(0)], 'empty.gif', { type: 'image/gif' });
        await expect(splitGif(empty, 2)).rejects.toThrow();
    });
});
