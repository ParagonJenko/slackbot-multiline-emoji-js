document.addEventListener('DOMContentLoaded', init);

const VALID_EXTENSIONS = [
  '.svg',
  '.jpg',
  '.jpeg',
  '.png',
  '.bmp',
  '.tiff',
  '.webp'
]

let fileUpload, squares, prefix, fileName, txt, progress, numOfTiles;
let previewDiv, prev;
let download, timeTaken;

const section = document.createElement('canvas');
const ctx = section.getContext('2d');

function init() {

  /*
  file-upload = image
  squares = int of squares
  prefix = string for name of emoji
  */

  fileUpload = document.getElementById("file-upload");
  horizontalSquares = document.getElementById("squares");
  prefixInput = document.getElementById("prefix");
  fileName = document.getElementById("file-name");
  progress = document.getElementById("download-progress");

  previewDiv = document.getElementById("preview-div");
  prev = document.getElementById("preview-box");

  form = document.getElementById("form");

  txt = document.getElementById("commandTextArea");

  download = document.getElementById("download");

  timeTaken = document.getElementById("time-taken");

  form.addEventListener('submit', e => e.preventDefault());
  addEventListeners();
}

const toBlob = (d) => new Promise((res) => d.toBlob(res));
const isValidFile = (file) => !!file && VALID_EXTENSIONS.some(ext => file.name.endsWith(ext));

function addEventListeners () {
    form.addEventListener('submit', splitImages);
    fileUpload.addEventListener('change', handleFileChange);
}

function save () {
    saveAs(currentZip, 'emojis.zip');
}

function handleFileChange () {
    file = fileUpload.files[ 0 ] || file;
    if (!isValidFile(file)) return;
    fileName.innerText = file.name;
}

async function splitImages(){
  if (!isValidFile(file)) return;
  const size = +horizontalSquares.value;
  submit.classList.add('is-loading');

  form.removeEventListener('submit', splitImages);
  fileUpload.removeEventListener('change', handleFileChange);

    // Clear preview from previous image splitting
  for (const el of document.querySelectorAll('div.imageRow'))
      el.parentNode.removeChild(el);

  txt.value = '';
  let done = 0;
  let w, h, numOfTiles;
  const prefix = (prefixInput.value || file.name.replace(/\.\w+$/, '')).replace(/\s+/g, '_').replace(/[^\w]/g, '');
  const zip = new JSZip();
  let str  = `\`${ prefix }\`\\n`;
  const startTime = Date.now();

  let img = new Image();
  img.src= URL.createObjectURL(file); 
  
  await new Promise((res, rej) => {
    img.addEventListener('load', async function (){

      w = horizontalSquares.value;
      h = horizontalSquares.value;
      numOfTiles = w * h;
      tileSize = img.height / size;

      section.width = section.height = img.height / size;

      const previewSize = prev.offsetWidth / size;

      for (let y = 0; y > -h; y--) {
          const row = document.createElement('div');
          row.classList.add('imageRow');
          row.style.height = `${ previewSize }px`;
          for (let x = 0; x > -w; x--) {
              ctx.drawImage(img, x * tileSize, y * tileSize);
              const blob = await toBlob(section);

              zip.file(`${ prefix }_${ -x }_${ -y }.png`, blob);

              const preview = document.createElement('img');
              // preview.classList.add('image');
              preview.src = URL.createObjectURL(blob);
              preview.width = preview.height = previewSize;
              row.appendChild(preview);

              ctx.clearRect(0, 0, tileSize, tileSize);
              str += `:${ prefix }_${ -x }_${ -y }:`;
              progress.innerText = `Progress: ${ ++done }/${ numOfTiles }`;
          }

          previewDiv.appendChild(row);
          str += '\\n';
      }
      res();
    })
  });

  submit.classList.remove('is-loading');
  progress.innerText = `Progress: ${ numOfTiles }/${ numOfTiles }`;

  txt.value += str;

  zip.file('emojis.txt', str);
  currentZip = await zip.generateAsync({ type: 'blob' });

  download.removeAttribute("disabled", "")
  timeTaken.innerText = `Time taken: ${ Date.now() - startTime }ms`;
  submit.value = 'Split';

  download.removeEventListener('click', save);
  download.addEventListener('click', save);

  addEventListeners();
}

