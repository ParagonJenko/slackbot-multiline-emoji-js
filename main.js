import sharp from 'sharp'
import fs from 'fs'
import JSZip from 'jszip'
import path from 'path'

const imageNames = ['public/edited/cupidburn.png', 'public/edited/braindamage.png', 'public/edited/selflove.png'];

async function prepareImage(item, m_gridSize = 2) {
    try {

        const fileName = path.parse(path.basename(item)).name;
        const metadata = await sharp(item).metadata();
        const gridSize = m_gridSize; // Change this to the desired grid size (e.g., 2 for a 2x2 grid)
        const images = [];
        
        // Create a new instance of JSZip
        const zip = new JSZip();


        for (let i = 1; i <= gridSize * gridSize; i++) {
            let row = Math.floor((i - 1) / gridSize);
            let col = (i - 1) % gridSize;

            const width = Math.floor(metadata.width / gridSize);
            const height = Math.floor(metadata.height / gridSize);
            const left = Math.floor(col * width);
            const top = Math.floor(row * height);

            console.log(`Run ${i} ${item} / Left: ${left} / Top: ${top} / Width: ${width} / Height: ${height} / Col ${col} Row ${row}`)

            await sharp(item)
            .extract({
                left: left,
                top: top,
                width: width,
                height: height,
            })
            // .toFile(newFile)
            .png()
            .toBuffer()
            .then(data => {
                images.push(data);
                zip.file(`${fileName}-${col}-${row}.png`, data);
            })
        }

         zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(`${fileName}.zip`))
            .on('finish', () => {
                console.log(`ZIP file saved to public/edited/${item}.zip`);
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