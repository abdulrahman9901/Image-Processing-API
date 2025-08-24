import sharp from 'sharp';
import { promises as fsPromises ,constants } from 'fs';
import path from 'path';
import multer from 'multer';

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

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/full/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = path.parse(file.originalname).name;
        const extension = path.extname(file.originalname);
        cb(null, originalName + '-' + uniqueSuffix + extension);
    }
});

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter
});

// Validate uploaded image
export const validateImageUpload = (file: Express.Multer.File | undefined): string | null => {
    if (!file) {
        return 'No file uploaded';
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        return 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed';
    }
    
    if (file.size > 10 * 1024 * 1024) {
        return 'File too large. Maximum size is 10MB';
    }
    
    return null;
};

// Process uploaded image (optional auto-resize and optimization)
export const processUploadedImage = async (
    filePath: string, 
    options?: { width?: number; height?: number; quality?: number }
): Promise<string> => {
    const { width, height, quality = 80 } = options || {};
    
    try {
        let sharpInstance = sharp(filePath);
        
        // Resize if dimensions provided
        if (width || height) {
            sharpInstance = sharpInstance.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        
        // Optimize and save
        const processedPath = filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-processed.$1');
        
        await sharpInstance
            .jpeg({ quality })
            .toFile(processedPath);
            
        return processedPath;
    } catch (error) {
        throw new Error(`Failed to process image: ${error}`);
    }
};