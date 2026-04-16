import { describe, it, expect } from 'vitest';
import { generateSlackbotCommand } from './utils';

describe('generateSlackbotCommand', () => {
    describe('display mode (copy = false)', () => {
        it('produces correct emoji tokens for a 2×2 grid', () => {
            const result = generateSlackbotCommand(2, 'test');
            expect(result).toBe(':test0-0::test1-0:\\n:test0-1::test1-1:\\n');
        });

        it('produces correct emoji tokens for a 3×3 grid', () => {
            const result = generateSlackbotCommand(3, 'emoji');
            // Row 0
            expect(result).toContain(':emoji0-0::emoji1-0::emoji2-0:');
            // Row separator
            expect(result).toContain('\\n');
            // Row 1
            expect(result).toContain(':emoji0-1::emoji1-1::emoji2-1:');
            // Row 2
            expect(result).toContain(':emoji0-2::emoji1-2::emoji2-2:');
        });

        it('ends with a trailing \\n token', () => {
            const result = generateSlackbotCommand(2, 'x');
            expect(result.endsWith('\\n')).toBe(true);
        });

        it('uses literal \\n (two characters) not a real newline', () => {
            const result = generateSlackbotCommand(2, 'x');
            expect(result).not.toContain('\n');
            expect(result).toContain('\\n');
        });

        it('falls back to "bigmoji" when prefix is empty', () => {
            const result = generateSlackbotCommand(2, '');
            expect(result).toContain(':bigmoji');
        });
    });

    describe('copy mode (copy = true)', () => {
        it('uses real newlines between rows', () => {
            const result = generateSlackbotCommand(2, 'test', true);
            expect(result).toContain('\n');
            expect(result).not.toContain('\\n');
        });

        it('does not add a trailing newline', () => {
            const result = generateSlackbotCommand(2, 'test', true);
            expect(result.endsWith('\n')).toBe(false);
        });

        it('produces the correct number of real newlines for a 3×3 grid', () => {
            const result = generateSlackbotCommand(3, 'x', true);
            // 3 rows → 2 separating newlines
            expect(result.split('\n').length).toBe(3);
        });
    });

    describe('grid coordinates', () => {
        it('uses col-row ordering (x before y)', () => {
            const result = generateSlackbotCommand(3, 'p');
            // First tile is col=0, row=0
            expect(result.startsWith(':p0-0:')).toBe(true);
            // Third tile in row 0 is col=2, row=0
            expect(result).toContain(':p2-0:');
            // First tile in row 1 is col=0, row=1
            expect(result).toContain(':p0-1:');
        });

        it('produces gridSize² tokens for any valid grid size', () => {
            for (const size of [2, 3, 5, 10]) {
                const result = generateSlackbotCommand(size, 'e', true);
                const tokens = result.split('\n').join('').match(/:[^:]+:/g) ?? [];
                expect(tokens.length).toBe(size * size);
            }
        });
    });
});
