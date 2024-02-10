// Import necessary modules
import * as imageProcessing from './imageProcessing.js';
import { createZipFile, generateZipURL } from './fileIO.js';
import * as utils from './utils.js';

// Event listener for when the DOM has finished loading
document.addEventListener('DOMContentLoaded', initializePage);

// Function to initialize the page
function initializePage() {
    // Get references to various HTML elements
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-upload');
    const gridSizeInput = document.getElementById('grid');
    const prefixInput = document.getElementById('prefix');
    const downloadButton = document.getElementById('download');
    const commandTextArea = document.getElementById('commandTextArea');
    const commandJustCopyTextArea = document.getElementById('commandJustCopyTextArea');

    let imageUrl = null; // Variable to store the URL of the selected image
    let zipUrl = null; // Variable to store the URL of the generated zip file

    // Variable to store the file name (initialized as an empty string)
    let fileName = "";

    // Event listeners for various input elements
    gridSizeInput.addEventListener('input', updateGridLines);
    fileInput.addEventListener('change', handleFileChange);
    uploadForm.addEventListener('submit', handleFormSubmit);
    downloadButton.addEventListener('click', downloadZip);

    downloadButton.disabled = true; // Disable download button initially

    // Function to update grid lines based on user input
    function updateGridLines() {
        const gridSize = parseInt(gridSizeInput.value);
        if (imageUrl) {
            clearCanvas(); // Clear the canvas
            renderPreview(imageUrl);
            drawGridLines(imageUrl, gridSize);
        }
    }
    
    /**
     * Form submission handler that processes the selected image and generates a zip file.
     * @param {Event} event - The form submission event.
     */
    function handleFileChange(event) {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === 'image/gif') {
                alert('GIF files are not supported currently. Please select a different image format.');
                return;
            }
            imageUrl = URL.createObjectURL(selectedFile);
            fileName = selectedFile.name;
            document.getElementById('file-name').textContent = fileName;
            clearCanvas(); // Clear the canvas
            renderPreview(imageUrl);
        }
    }

    /**
     * Handles changes in the selected file by updating the displayed image preview.
     * @param {Event} event - The change event on the file input.
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        if (!imageUrl) {
            alert('Please select an image to split.');
            return;
        }
        const gridSize = parseInt(gridSizeInput.value);
        const prefix = prefixInput.value;
        downloadButton.disabled = true;

        fileName = utils.getFileNameFromItem(fileName, prefix);

        // Perform image processing and generate zip file
        imageProcessing.createSmallerImages(imageUrl, gridSize, fileName)
            .then(({ images, textCommand }) => {
                const zip = createZipFile(fileName, images, textCommand, gridSize);
                return generateZipURL(zip);
            })
            .then((url) => {
                zipUrl = url;
                downloadButton.disabled = false;
                clearCanvas(); // Clear the canvas
                renderPreview(imageUrl);
                drawGridLines(imageUrl, gridSize);
                commandTextArea.value = utils.generateSlackbotCommand(gridSize, fileName);
                commandJustCopyTextArea.value = utils.generateSlackbotCommand(gridSize, fileName, true);
            });
    }

    // Function to handle downloading the generated zip file
    function downloadZip() {
        if (zipUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.href = zipUrl;
            downloadLink.download = `${fileName || 'bigmoji'}.zip`;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    /**
     * Renders a preview of the selected image in the designated HTML element.
     * @param {string} imageUrl - The URL of the selected image.
     */
    function renderPreview(imageUrl) {
        const previewDiv = document.getElementById('preview-div');
        previewDiv.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageUrl;
        previewDiv.style.position = 'relative';
        img.style.width = '100%'; // Set the image width to 100%
        img.style.height = 'auto'; // Set the image height to auto
        previewDiv.appendChild(img);
    }

    /**
     * Draws grid lines on the image preview canvas.
     * @param {string} imageUrl - The URL of the selected image.
     * @param {number} gridSize - The number of grid lines to draw.
     */
    function drawGridLines(imageUrl, gridSize) {
        const previewDiv = document.getElementById('preview-div');
        const containerDiv = document.createElement('div');
        containerDiv.style.position = 'relative';

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%'; // Set the canvas width to 100%
        canvas.style.height = 'auto'; // Set the canvas height to auto

        const context = canvas.getContext('2d');

        const img = new Image();
        img.src = imageUrl;

        // Draw the image on the canvas
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            canvas.height = canvas.width / aspectRatio; // Set the canvas height based on aspect ratio

            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            context.strokeStyle = 'red';
            const cellSize = canvas.width / gridSize;

            // Draw grid lines
            for (let i = 1; i < gridSize; i++) {
                const position = i * cellSize;
                context.beginPath();

                context.moveTo(position, 0);
                context.lineTo(position, canvas.height);
                context.moveTo(0, position);
                context.lineTo(canvas.width, position);

                context.stroke();
            }

            containerDiv.appendChild(canvas);
            previewDiv.innerHTML = ''; // Clear previous content
            previewDiv.appendChild(containerDiv);
        };
    }

    // Event listener to clear input fields before unloading the page
    window.addEventListener('beforeunload', clearInputFields);

    // Function to clear input fields
    function clearInputFields() {
        fileInput.value = '';
        gridSizeInput.value = '2';
        prefixInput.value = '';
        commandTextArea.value = '';
        commandJustCopyTextArea.value = '';
    }

    // Function to clear the image preview canvas
    function clearCanvas() {
        const previewDiv = document.getElementById('preview-div');
        previewDiv.innerHTML = '';
    }
}
