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
exports.Imageprocessing = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
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
