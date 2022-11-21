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
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
const images = express_1.default.Router();
images.get('/images', function (req, res) {
    const filename = req.query.filename;
    const height = +req.query.height;
    const width = +req.query.width;
    const sendImage = (res, image) => {
        res.setHeader('Content-Type', 'image/jpg');
        res.setHeader('Content-Length', ''); // Image size here
        res.setHeader('Access-Control-Allow-Origin', '*'); // If needs to be public
        res.send(image);
    };
    fs_1.promises
        .readFile(`./assets/full/${filename}.jpg`)
        .then(() => {
        const OriginalImage = (0, sharp_1.default)(`./assets/full/${filename}.jpg`);
        if (height <= 0 || width <= 0) {
            res.send('Not valid dimension');
        }
        fs_1.promises
            .readFile(`./assets/thumb/${filename}-thumb.jpg`)
            .then((image) => {
            const img = (0, sharp_1.default)(image);
            img
                .metadata()
                .then((data) => {
                return data;
            })
                .then((info) => {
                if ((info.width == width, info.height == height)) {
                    console.log('Already processed');
                    sendImage(res, image);
                }
                else {
                    OriginalImage.resize(width, height)
                        .toFile(`./assets/thumb/${filename}-thumb.jpg`)
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        console.log('Already processed but with different dimensions');
                        const myFile = yield fs_1.promises.readFile(`./assets/thumb/${filename}-thumb.jpg`);
                        sendImage(res, myFile);
                    }));
                }
            });
        })
            .catch(() => OriginalImage.resize(width, height)
            .toFile(`./assets/thumb/${filename}-thumb.jpg`)
            .then(() => __awaiter(this, void 0, void 0, function* () {
            console.log('not processed .');
            const myFile = yield fs_1.promises.readFile(`./assets/thumb/${filename}-thumb.jpg`);
            sendImage(res, myFile);
        }))
            .catch(() => {
            res.send('Not valid dimension');
        }));
    })
        .catch(() => {
        res.status(404);
        res.send('Image Not Found');
    });
});
exports.default = images;
