/**
 * Shared canvas utilities used across imageProcessing and gifProcessing.
 */

/**
 * Gets a 2D rendering context from a canvas element.
 * Throws rather than returning null so callers don't need to repeat the guard.
 */
export function get2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire 2D canvas context');
    return ctx;
}

/**
 * Creates a canvas with the given dimensions and returns it with its context.
 */
export function makeCanvas(
    width: number,
    height: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return { canvas, ctx: get2DContext(canvas) };
}

/**
 * Converts a flat tile index (row-major) to { col, row } coordinates.
 */
export function indexToColRow(index: number, gridSize: number): { col: number; row: number } {
    return {
        col: index % gridSize,
        row: Math.floor(index / gridSize),
    };
}
