import sharp from 'sharp';
import { promises as fsPromises ,constants } from 'fs';
import path from 'path';

function checkFileExists(file:string):Promise<boolean> {
    return fsPromises.access(file, constants.F_OK)
             .then(() => true)
             .catch(() => false)
  }

export const Imageprocessing = async (filename:string ,width:number , height:number):Promise<Buffer|string>=>{

    if(Number.isNaN(width)  && Number.isNaN(height)){
        return  await fsPromises.readFile(`./assets/full/${filename}.jpg`)
    }

    if(await checkFileExists(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`)){
        console.log('already processed image');
        return await fsPromises.readFile(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`) ;
    }
    await sharp(`./assets/full/${filename}.jpg`).resize(width, height)
        .toFile(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`)
        .then(() => {
            console.log('not processed .');
        })
    const myFile = await fsPromises.readFile(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`);

    return myFile;
}