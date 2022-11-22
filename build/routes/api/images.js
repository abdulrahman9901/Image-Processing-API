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
exports.default = images;
