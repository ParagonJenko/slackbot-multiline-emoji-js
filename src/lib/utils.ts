import { indexToColRow } from './canvas';

/**
 * Generates a Slackbot command string for a bigmoji grid.
 *
 * @param gridSize - The NxN grid dimension.
 * @param prefix - Prefix for emoji names (falls back to 'bigmoji').
 * @param copy - If true, uses real newlines; if false, uses literal \n tokens
 *               suitable for pasting into the Slackbot /remind command.
 */
export function generateSlackbotCommand(
    gridSize: number,
    prefix: string,
    copy = false,
): string {
    const name = prefix || 'bigmoji';
    const newline = copy ? '\n' : '\\n';
    let command = '';

    for (let i = 0; i < gridSize * gridSize; i++) {
        if (i > 0 && i % gridSize === 0) command += newline;
        const { col, row } = indexToColRow(i, gridSize);
        command += `:${name}${col}-${row}:`;
    }

    // Trailing newline token is required by the Slackbot command format.
    if (!copy) command += newline;

    return command;
}
