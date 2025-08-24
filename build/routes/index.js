"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const images_1 = __importDefault(require("./api/images"));
const posts_1 = __importDefault(require("./api/posts"));
const routes = express_1.default.Router();
routes.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Image Processing & Posts API',
        version: '1.0.0',
        endpoints: {
            images: {
                'GET /api/images': 'Resize existing images with query params: filename, width, height',
                'POST /api/images': 'Upload new images with optional auto-processing',
                'GET /api/images/list': 'List all available images'
            },
            posts: {
                'GET /api/posts': 'Get all posts with optional filters (category, status, author, tag, limit, offset)',
                'POST /api/posts': 'Create a new post',
                'GET /api/posts/:id': 'Get a specific post by ID',
                'PUT /api/posts/:id': 'Update a post by ID',
                'DELETE /api/posts/:id': 'Delete a post by ID',
                'GET /api/posts/search/:query': 'Search posts by title, content, or tags',
                'GET /api/posts/meta/categories': 'Get all unique categories',
                'GET /api/posts/meta/tags': 'Get all unique tags'
            }
        }
    });
});
routes.use('/api', images_1.default);
routes.use('/api', posts_1.default);
exports.default = routes;
