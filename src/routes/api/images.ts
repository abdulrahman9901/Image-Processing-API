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

  const query = req.query as { filename?: string; width?: string; height?: string };
  const filename: string = query.filename || '';
  const widthStr: string = query.width || '';
  const heightStr: string = query.height || '';

  const NotvalidData: null | string  = await validateData(filename, widthStr, heightStr);
  if(NotvalidData) {
    console.log(NotvalidData)
    res.send(NotvalidData);
    return;
  }

  const width: number = widthStr ? parseInt(widthStr, 10) : NaN;
  const height: number = heightStr ? parseInt(heightStr, 10) : NaN;

  res.setHeader('Content-Type', 'image/jpg');
  res.setHeader('Content-Length', ''); // Image size here
  res.setHeader('Access-Control-Allow-Origin', '*'); // If needs to be public
  res.send(await Imageprocessing(filename,width,height));

});

images.post('/images', async (req: Request, res: Response): Promise<void> => {
  const { filename, width, height } = (req.body || {}) as { filename?: string; width?: number | string; height?: number | string };

  const fileParam: string = (filename as string) || '';
  const widthStr: string = width === undefined || width === null ? '' : String(width);
  const heightStr: string = height === undefined || height === null ? '' : String(height);

  const validationMessage: null | string = await validateData(fileParam, widthStr, heightStr);
  if (validationMessage) {
    res.send(validationMessage);
    return;
  }

  const parsedWidth: number = widthStr ? parseInt(widthStr, 10) : NaN;
  const parsedHeight: number = heightStr ? parseInt(heightStr, 10) : NaN;

  res.setHeader('Content-Type', 'image/jpg');
  res.setHeader('Content-Length', '');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(await Imageprocessing(fileParam, parsedWidth, parsedHeight));
});

export default images;
