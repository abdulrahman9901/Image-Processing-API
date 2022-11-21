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
const images = express_1.default.Router();
images.get('/images', function (req, res) {
    const filename = req.query.filename;
    const height = req.query.height;
    const width = req.query.width;
    const image = (0, sharp_1.default)('./assets/full/encenadaport.jpg');
    image.resize(200, 200).toFile('./assets/thumb/encenadaport-thumb.jpg').then((data) => __awaiter(this, void 0, void 0, function* () {
        console.log(data);
    }));
    res.send({ filename, height, width });
});
exports.default = images;
