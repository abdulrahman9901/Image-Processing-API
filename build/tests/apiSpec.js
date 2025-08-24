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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const request = (0, supertest_1.default)(index_1.app);
describe('Test endpoint responses', () => {
    it('Should return 200 OK (Image API works)', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images?filename=icelandwaterfall&height=100&width=500');
        expect(response.status).toBe(200);
    })),
        it('Should return 404 Not Found (Image Not Found )', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield request.get('/api/images?filename=0&height=100&width=500');
            expect(response.text).toEqual("Please provide a valid filename");
        }));
    it('Should return Not valid width ', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images?filename=icelandwaterfall&height=100');
        expect(response.text).toEqual("Please provide a positive numerical value for image width.");
    }));
    it('Should return Not valid height ', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/images?filename=icelandwaterfall&height=0&width=500');
        expect(response.text).toEqual("Please provide a positive numerical value for image height.");
    }));
    it('POST Should return 200 OK with valid JSON body', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request
            .post('/api/images')
            .send({ filename: 'icelandwaterfall', width: 500, height: 100 })
            .set('Accept', 'application/json');
        expect(response.status).toBe(200);
    }));
    it('POST Should return filename error for invalid file', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request
            .post('/api/images')
            .send({ filename: '0', width: 500, height: 100 })
            .set('Accept', 'application/json');
        expect(response.text).toEqual("Please provide a valid filename");
    }));
    it('POST Should return width validation error when missing/invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request
            .post('/api/images')
            .send({ filename: 'icelandwaterfall', height: 100 })
            .set('Accept', 'application/json');
        expect(response.text).toEqual("Please provide a positive numerical value for image width.");
    }));
    it('POST Should return height validation error when invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request
            .post('/api/images')
            .send({ filename: 'icelandwaterfall', width: 500, height: 0 })
            .set('Accept', 'application/json');
        expect(response.text).toEqual("Please provide a positive numerical value for image height.");
    }));
});
