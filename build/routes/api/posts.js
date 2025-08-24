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
const path_1 = __importDefault(require("path"));
const posts = express_1.default.Router();
const POSTS_DIR = path_1.default.resolve(process.cwd(), 'assets', 'posts');
function ensurePostsDirExists() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_1.promises.mkdir(POSTS_DIR, { recursive: true });
    });
}
posts.post('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensurePostsDirExists();
        const { title, body } = req.body;
        if (!title || !body) {
            res.status(400).json({ error: 'title and body are required' });
            return;
        }
        const safeSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${safeSlug || 'post'}-${timestamp}.json`;
        const filePath = path_1.default.join(POSTS_DIR, filename);
        const postContent = {
            title,
            body,
            createdAt: new Date().toISOString()
        };
        yield fs_1.promises.writeFile(filePath, JSON.stringify(postContent, null, 2), 'utf-8');
        res.status(201).json({ message: 'Post created', id: filename, path: filePath });
    }
    catch (error) {
        console.error('Failed to create post', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = posts;
