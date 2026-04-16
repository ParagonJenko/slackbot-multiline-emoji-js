/**
 * Global test setup — runs before every test file.
 * Polyfills browser APIs that jsdom does not implement.
 */
import { vi } from 'vitest';

// ── ImageData polyfill ────────────────────────────────────────────────────────
// jsdom doesn't expose ImageData as a global constructor.
if (typeof ImageData === 'undefined') {
    (globalThis as unknown as Record<string, unknown>).ImageData = class ImageData {
        readonly width: number;
        readonly height: number;
        readonly data: Uint8ClampedArray;

        constructor(widthOrArray: number | Uint8ClampedArray, width?: number, height?: number) {
            if (typeof widthOrArray === 'number') {
                this.width = widthOrArray;
                this.height = width!;
                this.data = new Uint8ClampedArray(widthOrArray * width! * 4);
            } else {
                this.data = widthOrArray;
                this.width = width!;
                this.height = height ?? widthOrArray.length / (width! * 4);
            }
        }
    };
}

// ── Canvas 2D context stub ────────────────────────────────────────────────────
// jsdom ships without a canvas implementation. We provide a minimal stub so
// that canvas-based lib code can run in tests without the `canvas` npm package.
HTMLCanvasElement.prototype.getContext = vi.fn(function (
    this: HTMLCanvasElement,
    _type: string,
) {
    return {
        drawImage: vi.fn(),
        clearRect: vi.fn(),
        putImageData: vi.fn(),
        getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => new ImageData(w, h)),
        createImageData: vi.fn((w: number, h: number) => new ImageData(w, h)),
        fillRect: vi.fn(),
        stroke: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
}) as typeof HTMLCanvasElement.prototype.getContext;

// ── toDataURL stub ────────────────────────────────────────────────────────────
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,STUB');
