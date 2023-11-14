/**
 * Generates a Slackbot command for displaying images in a grid.
 * @param {number} gridSize - The number of rows and columns in the grid.
 * @param {string} prefix - The prefix to be added to the image tags.
 * @param {boolean} [copy=false] - Indicates whether the command is for copying (true) or displaying (false).
 * @returns {string} - The generated Slackbot command.
 */
export function generateSlackbotCommand(gridSize, prefix, copy = false) {
    const fileName = prefix || 'bigmoji';
    let command = '';

    for (let i = 0; i < gridSize * gridSize; i++) {
        if (i % gridSize === 0 & i != 0 & copy === false) {
            command += '\\n';  // Start a new row in the Slackbot command
        }
        else if (i % gridSize === 0 & i != 0 &  copy === true){
             command += '\n';
        }

        const col = i % gridSize;
        const row = Math.floor(i / gridSize);

        command += `:${fileName}${col}-${row}:`; // Add the image tag to the command
    }

    if (copy === false) {
        command += '\\n'; // Add a newline character at the end
    }

    return command.trim();
}

/**
 * Extracts the file name from a URL or file name.
 * @param {string} item - The URL or file name from which to extract the file name.
 * @param {string} prefix - The prefix to be added to the file name (if not present, it defaults to the file name).
 * @returns {string} - The extracted or modified file name.
 */
export function getFileNameFromItem(item, prefix) {
    return prefix || item.split('/').pop().split('.')[0];
}
