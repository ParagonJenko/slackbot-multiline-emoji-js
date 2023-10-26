// import sharp from 'sharp'
import Jimp from "jimp";
import fs from 'fs'
import JSZip from 'jszip'
import path from 'path'

const imageNames = ['public/edited/cupidburn.png', 'public/edited/braindamage.png', 'public/edited/selflove.png'];

async function prepareImage(item, gridSize = 2, prefix) {
    try {
        const fileName = prefix || path.parse(path.basename(item)).name;
        // const metadata = await sharp(item).metadata();
        
        const images = [];
        let textCommand = ""
        
        // Create a new instance of JSZip
        const zip = new JSZip();

        

        for (let i = 0; i < gridSize * gridSize; i++) {
            const image = await Jimp.read(item);
            const width = Math.floor(image.bitmap.width / gridSize);
            const height = Math.floor(image.bitmap.height / gridSize);

            let row = Math.floor((i) / gridSize);
            let col = i % gridSize;

            const x = Math.floor(col * width);
            const y = Math.floor(row * height);

            console.log(`Run ${i} ${item} / Left: ${x} / Top: ${y} / Width: ${width} / Height: ${height} / Col ${col} Row ${row}`)

            if(col === gridSize - 1) {
                textCommand += `:${fileName}:\\n`;
            } else {
                textCommand += `:${fileName}:`;
            }

            console.log(textCommand);

            await image.crop(x, y, width, height); // Corrected the await here.
            const data = await image.getBufferAsync(Jimp.MIME_PNG); // Get the image data.

            images.push(data);
            zip.file(`${fileName}-${col}-${row}.png`, data);
        }

        zip.file("command.txt", textCommand);
         zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(`${fileName}.zip`))
            .on('finish', () => {
                console.log(`ZIP file saved to ${fileName}.zip`);
            });

    
    } catch (error){
        console.log(error);
    }
}

async function testing() {
    prepareImage(imageNames[0])
    // prepareImage(imageNames[1])
    // prepareImage(imageNames[2])
}

testing();