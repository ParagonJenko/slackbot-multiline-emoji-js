import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSmallerImages } from './imageProcessing';

// ── Image stub factory ────────────────────────────────────────────────────────

function makeImageClass(width: number, height: number, fail = false) {
    return class MockImage {
        width = width;
        height = height;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        set src(_url: string) {
            if (fail) {
                setTimeout(() => this.onerror?.(), 0);
            } else {
                setTimeout(() => this.onload?.(), 0);
            }
        }
    };
}

describe('createSmallerImages', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns gridSize² tiles', async () => {
        vi.stubGlobal('Image', makeImageClass(60, 60));
        const result = await createSmallerImages('blob:fake', 3);
        expect(result.length).toBe(9);
        vi.unstubAllGlobals();
    });

    it('returns base64 data URLs', async () => {
        vi.stubGlobal('Image', makeImageClass(100, 100));
        const result = await createSmallerImages('blob:fake', 2);
        result.forEach((tile) => expect(tile.startsWith('data:')).toBe(true));
        vi.unstubAllGlobals();
    });

    it('draws each tile with the correct negative offset for a 3×3 grid on a 60×60 image', async () => {
        vi.stubGlobal('Image', makeImageClass(60, 60));

        const drawCalls: Array<{ dx: number; dy: number }> = [];
        const origGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = vi.fn(function () {
            return {
                drawImage: vi.fn((_img: unknown, dx: number, dy: number) => drawCalls.push({ dx, dy })),
                clearRect: vi.fn(),
                putImageData: vi.fn(),
                getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => new ImageData(w, h)),
                createImageData: vi.fn((w: number, h: number) => new ImageData(w, h)),
                fillRect: vi.fn(),
            } as unknown as CanvasRenderingContext2D;
        }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

        await createSmallerImages('blob:fake', 3);

        // 60×60 → tiles are 20×20
        // index 0 → col=0, row=0 → offset (0, 0)
        expect(drawCalls[0]).toEqual({ dx: 0, dy: 0 });
        // index 1 → col=1, row=0 → offset (-20, 0)
        expect(drawCalls[1]).toEqual({ dx: -20, dy: 0 });
        // index 3 → col=0, row=1 → offset (0, -20)
        expect(drawCalls[3]).toEqual({ dx: 0, dy: -20 });
        // index 4 → col=1, row=1 → offset (-20, -20)
        expect(drawCalls[4]).toEqual({ dx: -20, dy: -20 });

        HTMLCanvasElement.prototype.getContext = origGetContext;
        vi.unstubAllGlobals();
    });

    it('rejects when the image fails to load', async () => {
        vi.stubGlobal('Image', makeImageClass(0, 0, true));
        await expect(createSmallerImages('blob:bad', 2)).rejects.toThrow('Failed to load image');
        vi.unstubAllGlobals();
    });

    it('all tiles are created in parallel (image decoded only once)', async () => {
        let instanceCount = 0;
        const ImageClass = makeImageClass(40, 40);
        const WrappedImage = class extends ImageClass {
            constructor() {
                super();
                instanceCount++;
            }
        };
        vi.stubGlobal('Image', WrappedImage);

        await createSmallerImages('blob:fake', 2);

        // loadImage creates exactly one Image instance for 4 tiles
        expect(instanceCount).toBe(1);
        vi.unstubAllGlobals();
    });
});
