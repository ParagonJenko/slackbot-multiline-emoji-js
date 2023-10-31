import * as imageProcessing from './imageProcessing.js';
import { createZipFile, generateZipURL } from './fileIO.js';
import * as utils from './utils.js';

document.addEventListener('DOMContentLoaded', initializePage);

function initializePage() {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-upload');
    const gridSizeInput = document.getElementById('grid');
    const prefixInput = document.getElementById('prefix');
    const downloadButton = document.getElementById('download');
    const commandTextArea = document.getElementById('commandTextArea');
    
    let imageUrl = null;
    let zipUrl = null;
    /*
     I feel like we could do the fileName better 

     In handleFileChange() we get this from the files name itself.
     In handleFormSubmit() we get this from the name of the item - I'm not sure if we need to anymore - maybe one to refactor!
     */
    let fileName = "";
    
    gridSizeInput.addEventListener('input', updateGridLines);
    fileInput.addEventListener('change', handleFileChange);
    uploadForm.addEventListener('submit', handleFormSubmit);
    downloadButton.addEventListener('click', downloadZip);

    downloadButton.disabled = true;

    function updateGridLines() {
        // console.log("updateGridLines");
        const gridSize = parseInt(gridSizeInput.value);
        if (imageUrl) {
            clearCanvas(); // Clear the canvas
            renderPreview(imageUrl);
            drawGridLines(imageUrl, gridSize);
        }
    }

    function handleFileChange(event) {
        // console.log("handleFileChange");
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

    function handleFormSubmit(event) {
        // console.log("handleFormSubmit");
        event.preventDefault();
        if (!imageUrl) {
            alert('Please select an image to split.');
            return;
        }
        const gridSize = parseInt(gridSizeInput.value);
        const prefix = prefixInput.value;
        downloadButton.disabled = true;

        fileName = utils.getFileNameFromItem(fileName, prefix);
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
                const slackbotCommand = utils.generateSlackbotCommand(gridSize, prefix);
                commandTextArea.value = slackbotCommand;
            });
    }

    function downloadZip() {
        if (zipUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.href = zipUrl;
            downloadLink.download = `${prefixInput.value || 'bigmoji'}.zip`;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    function renderPreview(imageUrl) {
        // console.log("renderPreview");
        const previewDiv = document.getElementById('preview-div');
        previewDiv.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageUrl;
        previewDiv.style.position = 'relative';
        img.style.width = '100%'; // Set the image width to 100%
        img.style.height = 'auto'; // Set the image height to auto
        previewDiv.appendChild(img);
    }

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

        img.onload = () => {
            const aspectRatio = img.width / img.height;
            canvas.height = canvas.width / aspectRatio; // Set the canvas height based on aspect ratio

            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            context.strokeStyle = 'red';
            const cellSize = canvas.width / gridSize;

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
    
    window.addEventListener('beforeunload', clearInputFields);

    function clearInputFields() {
        fileInput.value = '';
        gridSizeInput.value = '2';
        prefixInput.value = '';
        commandTextArea.value = '';
    }

    function clearCanvas() {
        const previewDiv = document.getElementById('preview-div');
        previewDiv.innerHTML = '';
    }
}

