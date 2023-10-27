 // Function to generate the Slackbot command for displaying images
export function generateSlackbotCommand(gridSize, prefix) {
    const fileName = prefix || 'bigmoji';
    let command = '';

    for (let i = 0; i < gridSize * gridSize; i++) {
        if (i % gridSize === 0) {
            command += '\\n';  // Start a new row in the Slackbot command
        }

        const col = i % gridSize;
        const row = Math.floor(i / gridSize);

        command += `:${fileName}${col}-${row}:`; // Add the image tag to the command
    }

    command += '\\n'; // Add a newline character at the end

    return command;
}

    // Function to extract the file name from a URL or file name
export function getFileNameFromItem(item, prefix) {
    return prefix || item.split('/').pop().split('.')[0];
}
