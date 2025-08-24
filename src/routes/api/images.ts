import express from 'express';
import { promises as fsPromises ,constants } from 'fs';
import { Request, Response } from 'express';

import { Imageprocessing } from '../../utilities';

function checkFileExists(file:string):Promise<boolean> {
  return fsPromises.access(file, constants.F_OK)
           .then(() => true)
           .catch(() => false)
}
const images = express.Router();

const validateData = async (filename:string ,inwidth:string , inheight:string): Promise<null | string> =>{
      if(!(await checkFileExists(`./assets/full/${filename}.jpg`))){
        return  "Please provide a valid filename";
      }

      if (!inwidth && !inheight) {
        return null; // No size values
      }
    
      // Check for valid width value
      const width: number = parseInt(inwidth || '');
      console.log(width)
      if (Number.isNaN(width) || width < 1) {
        return "Please provide a positive numerical value for image width.";
      }
    
      // Check for valid height value
      const height: number = parseInt(inheight || '');
      if (Number.isNaN(height) || height < 1) {
        return "Please provide a positive numerical value for image height.";
      }   
      return null;
}
images.get('/images', async (req: Request, res: Response):Promise<void> => {

  const filenameParam = (req.query.filename as string) || '';
  const widthParam = (req.query.width as string) || '';
  const heightParam = (req.query.height as string) || '';

  const NotvalidData: null | string  = await validateData(filenameParam,widthParam,heightParam);
  if(NotvalidData) {
    console.log(NotvalidData)
    res.send(NotvalidData);
    return;
  }

  const filename: string = filenameParam;
  const height: number = parseInt(heightParam || '');
  const width: number = parseInt(widthParam || '');

  res.setHeader('Content-Type', 'image/jpg');
  res.setHeader('Content-Length', ''); // Image size here
  res.setHeader('Access-Control-Allow-Origin', '*'); // If needs to be public
  res.send(await Imageprocessing(filename,width,height));

});

export default images;
