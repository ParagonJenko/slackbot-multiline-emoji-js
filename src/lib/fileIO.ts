import JSZip from 'jszip';
import { indexToColRow } from './canvas';

/**
 * Creates a ZIP file containing image tiles and a Slackbot command file.
 *
 * @param fileName - Base name used for tile filenames.
 * @param images - Row-major array of base64 data URLs (PNG) or raw bytes (GIF).
 * @param textCommand - Slackbot command text written to command.txt.
 * @param gridSize - NxN grid dimension; must be consistent with images.length.
 * @param ext - File extension for tile files.
 */
export function createZipFile(
    fileName: string,
    images: Array<string | Uint8Array>,
    textCommand: string,
    gridSize: number,
    ext: 'png' | 'gif' = 'png',
): JSZip {
    if (images.length !== gridSize * gridSize) {
        throw new Error(
            `Expected ${gridSize * gridSize} tiles for a ${gridSize}×${gridSize} grid, got ${images.length}.`,
        );
    }

    const zip = new JSZip();

    images.forEach((data, i) => {
        const { col, row } = indexToColRow(i, gridSize);
        const name = `${fileName}-${col}-${row}.${ext}`;

        if (typeof data === 'string') {
            const commaIdx = data.indexOf(',');
            if (commaIdx === -1) throw new Error(`Tile ${i} is not a valid data URL.`);
            zip.file(name, data.slice(commaIdx + 1), { base64: true });
        } else {
            zip.file(name, data);
        }
    });

    zip.file('command.txt', textCommand);
    return zip;
}

/**
 * Generates a blob URL for a ZIP file.
 *
 * @remarks The caller is responsible for revoking the returned URL with
 * `URL.revokeObjectURL` once the download is complete to avoid memory leaks.
 */
export function generateZipURL(zip: JSZip): Promise<string> {
    return zip
        .generateAsync({ type: 'blob' })
        .then((blob) => URL.createObjectURL(blob));
}
