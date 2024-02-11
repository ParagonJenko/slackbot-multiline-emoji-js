// Import necessary modules
import * as imageProcessing from './imageProcessing.js';
import { createZipFile, generateZipURL } from './fileIO.js';
import * as utils from './utils.js';
import Cropper from 'cropperjs';
import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'

// Event listener for when the DOM has finished loading
document.addEventListener('DOMContentLoaded', initializePage);

const analytics = Analytics({
    app: 'bigmoji',
    version: 200,
    plugins: [
        segmentPlugin({
            writeKey: 'blSky9pOzH5qeOIjO9haVC1jaRWbvFgw'
        })
    ]
  })

// Function to initialize the page
function initializePage() {
    analytics.page();
    // Get references to various HTML elements
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-upload');
    const gridSizeInput = document.getElementById('grid');
    const prefixInput = document.getElementById('prefix');
    const downloadButton = document.getElementById('download');
    const commandTextArea = document.getElementById('commandTextArea');
    const commandJustCopyTextArea = document.getElementById('commandJustCopyTextArea');
    const cropperImage = document.getElementById('imageCropper');

    document.getElementById("upload-form").addEventListener("submit", function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();
    });
    
    let fileInputText =  document.getElementById('file-name');
    let imageUrl = null; // Variable to store the URL of the selected image
    let zipUrl = null; // Variable to store the URL of the generated zip file
    let isSquareImage = null;

    // Variable to store the file name (initialized as an empty string)
    let fileName = "";
    let fileNameWithoutExtension = "";
    let fileNameChosenOutput = "";

    // Event listeners for various input elements

    downloadButton.disabled = true; // Disable download button initially
    fileInput.addEventListener('change', processUploadedFile)
    downloadButton.addEventListener('click', downloadZip);
    /*

    Flow:
    - User uploads an image
    - If it is a square set that as image
    - If it is not a square show crop page and set result as image
    - 
    */

    /* 
    Multi-step Form
    */
    const stepsArray = [
        'stepImageUpload', 'stepImageCrop', 'stepGridSize', 'stepPrefix', 'stepPreviewDownload'
    ];

    let stepImageUploadButton = document.getElementById('stepImageUploadButton')
    let stepImageCropButton = document.getElementById('stepImageCropButton')
    let stepGridSizeButton = document.getElementById('stepGridSizeButton')
    let stepPrefixButton = document.getElementById('stepPrefixButton')
    let stepPreviewDownloadButton = document.getElementById('stepPreviewDownloadButton')
    let resetFormButton = document.getElementById('resetFormButton');

    stepImageUploadButton.onclick = function () {
        if (fileInput.files.length === 0) {
            alert("No file selected.");
        } else {
            if(!isSquareImage){
                imageCropper.src = imageUrl;
                initaliseCropper();
                nextItem(stepsArray[0], stepsArray[1]);
            }
            else {
                nextItem(stepsArray[0], stepsArray[2]);
            }
        }
    }
    stepGridSizeButton.onclick = function () {
        nextItem(stepsArray[2], stepsArray[3])
    }
    stepPrefixButton.onclick = function () {
        nextItem(stepsArray[3], stepsArray[4])
        displayPreview();
        processDownload();
    }
    resetFormButton.onclick = function () {
        clearInputFields();
        nextItem(stepsArray[4], stepsArray[0])
    }

    function nextItem(currentId, nextId) {
        var current = document.getElementById(currentId);
        var next = document.getElementById(nextId);

        // Add slide-fade class to current
        current.classList.add('slide-fade', 'slide-left');

        // Remove the element from the DOM after transition
        current.addEventListener('transitionend', function() {
            current.style.display = 'none';
            current.classList.remove('slide-fade', 'slide-left');
        });

        // Display and add slide-fade class to next
        next.style.display = 'block';
        setTimeout(function() {
            next.classList.add('slide-fade');
        }, 10); // Delay to ensure the display style is applied before adding class
    }


    /**
     * A function to process the uploaded file
     * @param {*} event 
     * @returns null
     */
    function processUploadedFile(event){
        const selectedFile = event.target.files[0];

        // Verify the file exists, that the file is an image and that it isn't a gif
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                alert('Only image files are supported. Please select a different file.');
                return;
            }
            else if (selectedFile.type === 'image/gif') {
                alert('GIF files are not supported currently. Please select a different image format.');
                return;
            }
        }

        // Change file name text
        fileName = selectedFile.name;
        fileInputText.textContent = fileName;
        fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.')

        imageUrl = URL.createObjectURL(selectedFile);
        isSquare();
    }
    /* 
    End of Multi-step Form
    */

    /**
     * Displays the preview image
     */
    function displayPreview(){
        const previewDiv = document.getElementById('preview-div');
        previewDiv.innerHTML = '';
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        previewDiv.style.position = 'relative';
        imgElement.style.width = '100%'; // Set the image width to 100%
        imgElement.style.height = 'auto'; // Set the image height to auto
        previewDiv.appendChild(imgElement);

        const containerDiv = document.createElement('div');
        containerDiv.style.position = 'relative';

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%'; // Set the canvas width to 100%
        canvas.style.height = 'auto'; // Set the canvas height to auto

        const context = canvas.getContext('2d');

        const img = new Image();
        const gridSize = parseInt(gridSizeInput.value);
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

    /**
     * Helper function: Clears input fields on form reload
     */
    function clearInputFields() {
        fileInput.value = null;
        gridSizeInput.value = '2';
        prefixInput.value = '';
        commandTextArea.value = '';
        commandJustCopyTextArea.value = '';
        fileInputText.innerHTML = 'No file selected.';
        cropperImage.src = null;
        URL.revokeObjectURL(imageUrl)
    }

    /**
     * Checks if the image is square
     * @returns boolean 
     */
    function isSquare() {
        var img = new Image();
        img.src = imageUrl;
        img.onload = function() {
            if (img.naturalWidth === img.naturalHeight) {
                isSquareImage = true;
            } else {
                isSquareImage = false;
            }
        };
    }

    /**
     * Initialises the cropper library and overwrites the uploaded file with the cropped version
     */
    function initaliseCropper() {
        const cropper = new Cropper(cropperImage, {
            aspectRatio: 1 / 1,
            viewMode: 3,
            crop(event) {
            },
        });

        stepImageCropButton.onclick = function () {
            if (cropper) {
                cropper.getCroppedCanvas({width: 256, height: 256}).toBlob(blob => {
                    if (blob) {
                        if (imageUrl) {
                            URL.revokeObjectURL(imageUrl);
                        }
                        imageUrl = URL.createObjectURL(blob);
                        cropper.destroy();
                        analytics.track('croppedImage', {
                            file: fileName,
                        })
                        nextItem(stepsArray[1], stepsArray[2]);
                    } else {
                        console.error("Failed to crop image.");
                    }
                });
            } else {
                console.error("Cropper instance is not initialized.");
            }
        }
    }

    /**
     * Processes the download and appends this to the download button
     */
    function processDownload() {
        const gridSize = parseInt(gridSizeInput.value);
        fileNameChosenOutput = prefixInput.value.trim() || fileNameWithoutExtension
        downloadButton.disabled = true;

        // Perform image processing and generate zip file
        imageProcessing.createSmallerImages(imageUrl, gridSize, fileName)
            .then(({ images, textCommand }) => {
                const zip = createZipFile(fileNameChosenOutput, images, textCommand, gridSize);
                return generateZipURL(zip);
            })
            .then((url) => {
                zipUrl = url;
                downloadButton.disabled = false;
                commandTextArea.value = utils.generateSlackbotCommand(gridSize, fileNameChosenOutput);
                commandJustCopyTextArea.value = utils.generateSlackbotCommand(gridSize, fileNameChosenOutput, true);
                /* Track a custom event */
                analytics.track('processDownload', {
                    file: fileNameChosenOutput,
                })
            });
    }

    /**
     * Processes the downloading of the zip file
     */
    function downloadZip() {
        if (zipUrl) {
            const downloadLink = document.createElement('a');
            downloadLink.href = zipUrl;
            downloadLink.download = `${fileNameChosenOutput || 'bigmoji'}.zip`;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

             /* Track a custom event */
            analytics.track('downloadZip', {
                file: fileNameChosenOutput,
            })
        }
    }
}
