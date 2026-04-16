import { describe, it, expect } from 'vitest';
import { get2DContext, makeCanvas, indexToColRow } from './canvas';

// Canvas stubs are provided globally by src/test-setup.ts.

describe('indexToColRow', () => {
    it('maps index 0 to col=0, row=0', () => {
        expect(indexToColRow(0, 3)).toEqual({ col: 0, row: 0 });
    });

    it('maps the last index in a row to the correct col', () => {
        expect(indexToColRow(2, 3)).toEqual({ col: 2, row: 0 });
    });

    it('wraps to the next row correctly', () => {
        expect(indexToColRow(3, 3)).toEqual({ col: 0, row: 1 });
    });

    it('maps the final tile in a 3×3 grid', () => {
        expect(indexToColRow(8, 3)).toEqual({ col: 2, row: 2 });
    });

    it('works for a 2×2 grid', () => {
        expect(indexToColRow(0, 2)).toEqual({ col: 0, row: 0 });
        expect(indexToColRow(1, 2)).toEqual({ col: 1, row: 0 });
        expect(indexToColRow(2, 2)).toEqual({ col: 0, row: 1 });
        expect(indexToColRow(3, 2)).toEqual({ col: 1, row: 1 });
    });

    it('works for a 10×10 grid', () => {
        expect(indexToColRow(99, 10)).toEqual({ col: 9, row: 9 });
        expect(indexToColRow(50, 10)).toEqual({ col: 0, row: 5 });
    });

    it('round-trips through all indices of a 4×4 grid', () => {
        const seen = new Set<string>();
        for (let i = 0; i < 16; i++) {
            const { col, row } = indexToColRow(i, 4);
            expect(col).toBeGreaterThanOrEqual(0);
            expect(col).toBeLessThan(4);
            expect(row).toBeGreaterThanOrEqual(0);
            expect(row).toBeLessThan(4);
            seen.add(`${col},${row}`);
        }
        // All 16 unique positions covered
        expect(seen.size).toBe(16);
    });
});

describe('makeCanvas', () => {
    it('returns a canvas with the specified dimensions', () => {
        const { canvas } = makeCanvas(100, 50);
        expect(canvas.width).toBe(100);
        expect(canvas.height).toBe(50);
    });

    it('returns a context with drawImage', () => {
        const { ctx } = makeCanvas(10, 10);
        expect(typeof ctx.drawImage).toBe('function');
    });
});

describe('get2DContext', () => {
    it('returns a 2D context for a valid canvas', () => {
        const canvas = document.createElement('canvas');
        const ctx = get2DContext(canvas);
        expect(ctx).toBeDefined();
        expect(typeof ctx.drawImage).toBe('function');
    });
});
