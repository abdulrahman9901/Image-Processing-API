import express from 'express';
import { promises as fsPromises ,constants } from 'fs';
import { Request, Response } from 'express';

// Extend Request interface to include file property from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  body?: any;
}

import { Imageprocessing, upload, validateImageUpload, processUploadedImage } from '../../utilities';

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

  const NotvalidData: null | string  = await validateData(req.query.filename,req.query.width,req.query.height);
  if(NotvalidData) {
    console.log(NotvalidData)
    res.send(NotvalidData);
    return;
  }

  const filename: string = req.query.filename;
  const height: number = +req.query.height;
  const width: number = +req.query.width;

  res.setHeader('Content-Type', 'image/jpg');
  res.setHeader('Content-Length', ''); // Image size here
  res.setHeader('Access-Control-Allow-Origin', '*'); // If needs to be public
  res.send(await Imageprocessing(filename,width,height));

});

// POST endpoint for uploading new images
images.post('/images', upload.single('image'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    // Validate the uploaded file
    const validationError = validateImageUpload(req.file);
    if (validationError) {
      res.status(400).json({
        success: false,
        error: validationError
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
      return;
    }

    // Extract optional processing parameters from request body
    const { width, height, quality, autoProcess } = req.body;
    let processedPath: string | null = null;

    // Auto-process image if requested
    if (autoProcess === 'true') {
      const processingOptions: any = {};
      
      if (width) processingOptions.width = parseInt(width);
      if (height) processingOptions.height = parseInt(height);
      if (quality) processingOptions.quality = parseInt(quality);

      try {
        processedPath = await processUploadedImage(req.file.path, processingOptions);
      } catch (error) {
        console.error('Image processing failed:', error);
        // Continue without processing - original file is still saved
      }
    }

    // Response with upload details
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        originalName: req.file.originalname,
        savedAs: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadPath: req.file.path,
        processedPath: processedPath,
        // Extract filename without extension for use with existing GET endpoint
        filenameForApi: req.file.filename.replace(/\.[^/.]+$/, "")
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during file upload'
    });
  }
});

// GET endpoint for listing all available images
images.get('/images/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await fsPromises.readdir('./assets/full');
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    ).map(file => ({
      filename: file,
      filenameForApi: file.replace(/\.[^/.]+$/, ""),
      extension: file.split('.').pop()
    }));

    res.json({
      success: true,
      images: imageFiles,
      count: imageFiles.length
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list images'
    });
  }
});

export default images;
