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
exports.processUploadedImage = exports.validateImageUpload = exports.upload = exports.Imageprocessing = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
function checkFileExists(file) {
    return fs_1.promises.access(file, fs_1.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
const Imageprocessing = (filename, width, height) => __awaiter(void 0, void 0, void 0, function* () {
    if (Number.isNaN(width) && Number.isNaN(height)) {
        return yield fs_1.promises.readFile(`./assets/full/${filename}.jpg`);
    }
    if (yield checkFileExists(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`)) {
        console.log('already processed image');
        return yield fs_1.promises.readFile(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`);
    }
    yield (0, sharp_1.default)(`./assets/full/${filename}.jpg`).resize(width, height)
        .toFile(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`)
        .then(() => {
        console.log('not processed .');
    });
    const myFile = yield fs_1.promises.readFile(`./assets/thumb/${filename}-${height}x${width}-thumb.jpg`);
    return myFile;
});
exports.Imageprocessing = Imageprocessing;
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/full/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = path_1.default.parse(file.originalname).name;
        const extension = path_1.default.extname(file.originalname);
        cb(null, originalName + '-' + uniqueSuffix + extension);
    }
});
// File filter to only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter
});
// Validate uploaded image
const validateImageUpload = (file) => {
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
exports.validateImageUpload = validateImageUpload;
// Process uploaded image (optional auto-resize and optimization)
const processUploadedImage = (filePath, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { width, height, quality = 80 } = options || {};
    try {
        let sharpInstance = (0, sharp_1.default)(filePath);
        // Resize if dimensions provided
        if (width || height) {
            sharpInstance = sharpInstance.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        // Optimize and save
        const processedPath = filePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-processed.$1');
        yield sharpInstance
            .jpeg({ quality })
            .toFile(processedPath);
        return processedPath;
    }
    catch (error) {
        throw new Error(`Failed to process image: ${error}`);
    }
});
exports.processUploadedImage = processUploadedImage;
