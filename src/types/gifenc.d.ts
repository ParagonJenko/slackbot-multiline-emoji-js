declare module 'gifenc' {
    export interface GIFEncoder {
        writeFrame(
            index: Uint8Array,
            width: number,
            height: number,
            options?: {
                palette?: number[][];
                delay?: number;
                repeat?: number;
                transparent?: boolean;
                transparentIndex?: number;
            },
        ): void;
        finish(): void;
        bytes(): Uint8Array;
        bytesView(): Uint8Array;
    }

    export function GIFEncoder(options?: { initialCapacity?: number; auto?: boolean }): GIFEncoder;

    export function quantize(
        rgba: Uint8Array | Uint8ClampedArray,
        maxColors: number,
        options?: { format?: string; oneBitAlpha?: boolean },
    ): number[][];

    export function applyPalette(
        rgba: Uint8Array | Uint8ClampedArray,
        palette: number[][],
        format?: string,
    ): Uint8Array;
}
