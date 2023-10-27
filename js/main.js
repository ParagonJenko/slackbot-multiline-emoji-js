import * as imageProcessing from './imageProcessing.js';
import { createZipFile, generateZipURL } from './fileIO.js';
import * as utils from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-upload');
    const gridSizeInput = document.getElementById('grid');
    const prefixInput = document.getElementById('prefix');
    const downloadButton = document.getElementById('download');
    const commandTextArea = document.getElementById('commandTextArea');

    let imageUrl = null;

    gridSizeInput.addEventListener('input', () => {
        const gridSize = parseInt(gridSizeInput.value);
        if (imageUrl) {
            // Call the drawGridLines function to update the grid overlay
            drawGridLines(imageUrl, gridSize);
        }
    });

     // Event listener for file input change event
    fileInput.addEventListener('change', (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
             // Check if the selected file is a GIF
            if (selectedFile.type === 'image/gif') {
                alert('GIF files are not supported currently. Please select a different image format.');
                return; 
            }
            imageUrl = URL.createObjectURL(selectedFile);
            const fileName = selectedFile.name;
            document.getElementById('file-name').textContent = fileName;

            renderPreview(imageUrl); // Display a preview of the selected image
        }
    });

    downloadButton.disabled = true;
    let zipUrl = null;

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!imageUrl) {
            alert('Please select an image to split.');
            return;
        }

        const gridSize = parseInt(gridSizeInput.value);
        const prefix = prefixInput.value;

        // Disable the download button while preparing the image
        downloadButton.disabled = true;

        const fileName = utils.getFileNameFromItem(imageUrl, prefix);
        const { images, textCommand } = await imageProcessing.createSmallerImages(imageUrl, gridSize, fileName);
        const zip = createZipFile(fileName, images, textCommand, gridSize);
        zipUrl = await generateZipURL(zip);

        // Enable the download button after preparing the ZIP
        downloadButton.disabled = false;

         // Call the drawGridLines function to show red grid lines
        drawGridLines(imageUrl, gridSize);

        // Generate and set the Slackbot command
        const slackbotCommand = utils.generateSlackbotCommand(gridSize, prefix);
        commandTextArea.value = slackbotCommand;

         // Generate and set the Slackbot command with line breaks and without spaces
        const slackbotCommandWithLineBreaksAndNoSpaces = slackbotCommand
            .replace(/\\n/g, '\n')
            .replace(/ /g, '');
        commandJustCopyTextArea.value = slackbotCommandWithLineBreaksAndNoSpaces;
    });

    // Attach a click event listener to the download button
    downloadButton.addEventListener('click', () => {
        if (zipUrl) {
            // Create a hidden download link and trigger a click event to start the download
            const downloadLink = document.createElement('a');
            downloadLink.href = zipUrl;
            downloadLink.download = `${prefixInput.value || 'bigmoji'}.zip`;
            downloadLink.style.display = 'none';

            // Append the link to the body and trigger the click event to start the download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    });

    // Function to render a preview of the selected image
    function renderPreview(imageUrl) {
        const previewDiv = document.getElementById('preview-div');
        previewDiv.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageUrl;
        previewDiv.appendChild(img);
    }
    
    // Function to draw red grid lines over the image
    // Function to draw red grid lines over the image
    function drawGridLines(imageUrl, gridSize) {
        const previewDiv = document.getElementById('preview-div');

        // Create a container div for the image and grid overlay
        const containerDiv = document.createElement('div');
        containerDiv.style.position = 'relative';

        // Create a fixed-size canvas element
        const canvas = document.createElement('canvas');
        canvas.width = previewDiv.clientWidth;
        canvas.height = previewDiv.clientHeight;
        const context = canvas.getContext('2d');

        // Create the image element
        const img = new Image();
        // Set the image's src to reload it
        img.src = imageUrl;

        // Wait for the image to load
        img.onload = () => {
            // Calculate the dimensions of each grid cell
            const cellWidth = canvas.width / gridSize;
            const cellHeight = canvas.height / gridSize;

            // Set the stroke color to red
            context.strokeStyle = 'red';

            // Draw the image on the canvas, scaling it to fit the canvas dimensions
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Draw vertical grid lines
            for (let i = 1; i < gridSize; i++) {
                const x = i * cellWidth;
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, canvas.height);
                context.stroke();
            }

            // Draw horizontal grid lines
            for (let i = 1; i < gridSize; i++) {
                const y = i * cellHeight;
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(canvas.width, y);
                context.stroke();
            }

            // Append the canvas to the container
            containerDiv.appendChild(canvas);
            previewDiv.innerHTML = ''; // Clear previous content
            previewDiv.appendChild(containerDiv);
        };
    }

   

    // Add an event listener to clear input fields on page reload
    window.addEventListener('beforeunload', () => {
        fileInput.value = '';
        gridSizeInput.value = '2';
        prefixInput.value = '';
        commandTextArea.value = '';
        commandJustCopyTextArea.value = '';
    });
});
