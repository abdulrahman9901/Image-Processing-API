"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const utilities_1 = require("../../utilities");
function checkFileExists(file) {
    return fs_1.promises.access(file, fs_1.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
const images = express_1.default.Router();
const validateData = (filename, inwidth, inheight) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield checkFileExists(`./assets/full/${filename}.jpg`))) {
        return "Please provide a valid filename";
    }
    if (!inwidth && !inheight) {
        return null; // No size values
    }
    // Check for valid width value
    const width = parseInt(inwidth || '');
    console.log(width);
    if (Number.isNaN(width) || width < 1) {
        return "Please provide a positive numerical value for image width.";
    }
    // Check for valid height value
    const height = parseInt(inheight || '');
    if (Number.isNaN(height) || height < 1) {
        return "Please provide a positive numerical value for image height.";
    }
    return null;
});
images.get('/images', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const NotvalidData = yield validateData(req.query.filename, req.query.width, req.query.height);
    if (NotvalidData) {
        console.log(NotvalidData);
        res.send(NotvalidData);
        return;
    }
    const filename = req.query.filename;
    const height = +req.query.height;
    const width = +req.query.width;
    res.setHeader('Content-Type', 'image/jpg');
    res.setHeader('Content-Length', ''); // Image size here
    res.setHeader('Access-Control-Allow-Origin', '*'); // If needs to be public
    res.send(yield (0, utilities_1.Imageprocessing)(filename, width, height));
}));
// POST endpoint for uploading new images
images.post('/images', utilities_1.upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the uploaded file
        const validationError = (0, utilities_1.validateImageUpload)(req.file);
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
        let processedPath = null;
        // Auto-process image if requested
        if (autoProcess === 'true') {
            const processingOptions = {};
            if (width)
                processingOptions.width = parseInt(width);
            if (height)
                processingOptions.height = parseInt(height);
            if (quality)
                processingOptions.quality = parseInt(quality);
            try {
                processedPath = yield (0, utilities_1.processUploadedImage)(req.file.path, processingOptions);
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during file upload'
        });
    }
}));
// GET endpoint for listing all available images
images.get('/images/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield fs_1.promises.readdir('./assets/full');
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)).map(file => ({
            filename: file,
            filenameForApi: file.replace(/\.[^/.]+$/, ""),
            extension: file.split('.').pop()
        }));
        res.json({
            success: true,
            images: imageFiles,
            count: imageFiles.length
        });
    }
    catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list images'
        });
    }
}));
exports.default = images;
