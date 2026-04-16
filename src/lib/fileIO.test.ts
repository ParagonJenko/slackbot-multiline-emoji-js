import { describe, it, expect } from 'vitest';
import { createZipFile } from './fileIO';

// Minimal valid 1×1 PNG as a base64 data URL
const TINY_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function makePngTiles(count: number): string[] {
    return Array.from({ length: count }, () => TINY_PNG);
}

describe('createZipFile', () => {
    it('creates a zip with the correct number of tile files for a 2×2 grid', () => {
        const zip = createZipFile('myemoji', makePngTiles(4), 'cmd', 2, 'png');
        const files = Object.keys(zip.files);
        // 4 tiles + command.txt
        expect(files.length).toBe(5);
    });

    it('names tiles using col-row format', () => {
        const zip = createZipFile('em', makePngTiles(4), 'cmd', 2, 'png');
        const names = Object.keys(zip.files);
        expect(names).toContain('em-0-0.png');
        expect(names).toContain('em-1-0.png');
        expect(names).toContain('em-0-1.png');
        expect(names).toContain('em-1-1.png');
    });

    it('includes command.txt', () => {
        const zip = createZipFile('x', makePngTiles(4), 'the-command', 2);
        expect(Object.keys(zip.files)).toContain('command.txt');
    });

    it('uses the gif extension for gif tiles', () => {
        const tiles = Array.from({ length: 4 }, () => new Uint8Array([0x47, 0x49, 0x46]));
        const zip = createZipFile('anim', tiles, 'cmd', 2, 'gif');
        const names = Object.keys(zip.files);
        expect(names).toContain('anim-0-0.gif');
        expect(names.every((n) => n === 'command.txt' || n.endsWith('.gif'))).toBe(true);
    });

    it('throws when image count does not match gridSize²', () => {
        expect(() => createZipFile('x', makePngTiles(3), 'cmd', 2)).toThrow(
            /Expected 4 tiles/,
        );
    });

    it('throws when a data URL has no comma', () => {
        expect(() => createZipFile('x', ['notadataurl'], 'cmd', 1)).toThrow(
            /not a valid data URL/,
        );
    });

    it('correctly names tiles in a 3×3 grid', () => {
        const zip = createZipFile('p', makePngTiles(9), 'cmd', 3, 'png');
        const names = Object.keys(zip.files);
        // All 9 tile positions
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                expect(names).toContain(`p-${col}-${row}.png`);
            }
        }
    });
});
