// import 'cropperjs/dist/cropper.css';
// import Cropper from 'cropperjs';

const image = document.getElementById('image');
const cropper = new Cropper(image, {
  aspectRatio: 1 / 1,
  viewMode: 3,
  crop(event) {
  },
});

const downloadBtn = document.getElementById("download");

// Add an event listener to the button
document.addEventListener('DOMContentLoaded', function() { 
    document.getElementById("download").addEventListener("click", downloadImage);
    document.getElementById("file-upload").addEventListener("change", function(event) {
        uploadImageToCrop(event.target.files[0]);
    });
});

function downloadImage(){
    console.log("Download");
    cropper.getCroppedCanvas({width: 128, height: 128}).toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cropped_image.png'; // Specify the filename here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
 })};

// Function to handle image upload
function uploadImageToCrop(file) {
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function() {
            const imageUrl = reader.result;
            document.getElementById("file-name").innerHTML = file.name;
            cropper.replace(imageUrl);
        }
        
        reader.readAsDataURL(file);
    }
}