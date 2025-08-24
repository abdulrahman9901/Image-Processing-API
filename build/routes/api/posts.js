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
const postUtilities_1 = require("../../postUtilities");
const posts = express_1.default.Router();
// POST - Create a new post
posts.post('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const validationError = (0, postUtilities_1.validatePostData)(req.body);
        if (validationError) {
            res.status(400).json({
                success: false,
                error: validationError
            });
            return;
        }
        // Set defaults
        const postData = {
            title: req.body.title.trim(),
            content: req.body.content.trim(),
            author: req.body.author.trim(),
            category: req.body.category.trim(),
            tags: req.body.tags || [],
            status: req.body.status || 'draft',
            imageUrl: req.body.imageUrl || undefined
        };
        // Create the post
        const newPost = yield (0, postUtilities_1.createPost)(postData);
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: newPost
        });
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while creating post'
        });
    }
}));
// GET - Retrieve all posts with optional filters
posts.get('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {
            category: req.query.category,
            status: req.query.status,
            author: req.query.author,
            tag: req.query.tag,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined
        };
        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });
        const { posts: filteredPosts, total } = yield (0, postUtilities_1.getPostsWithFilters)(filters);
        res.json({
            success: true,
            data: filteredPosts,
            pagination: {
                total,
                limit: filters.limit || 10,
                offset: filters.offset || 0,
                hasMore: total > (filters.offset || 0) + filteredPosts.length
            }
        });
    }
    catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while retrieving posts'
        });
    }
}));
// GET - Retrieve a specific post by ID
posts.get('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const post = yield (0, postUtilities_1.getPostById)(id);
        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        res.json({
            success: true,
            data: post
        });
    }
    catch (error) {
        console.error('Error retrieving post:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while retrieving post'
        });
    }
}));
// PUT - Update a post by ID
posts.put('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        // Validate request data (excluding ID and timestamps)
        const validationError = (0, postUtilities_1.validatePostData)(req.body);
        if (validationError) {
            res.status(400).json({
                success: false,
                error: validationError
            });
            return;
        }
        const updates = {
            title: (_a = req.body.title) === null || _a === void 0 ? void 0 : _a.trim(),
            content: (_b = req.body.content) === null || _b === void 0 ? void 0 : _b.trim(),
            author: (_c = req.body.author) === null || _c === void 0 ? void 0 : _c.trim(),
            category: (_d = req.body.category) === null || _d === void 0 ? void 0 : _d.trim(),
            tags: req.body.tags,
            status: req.body.status,
            imageUrl: req.body.imageUrl
        };
        // Remove undefined values
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) {
                delete updates[key];
            }
        });
        const updatedPost = yield (0, postUtilities_1.updatePost)(id, updates);
        if (!updatedPost) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Post updated successfully',
            data: updatedPost
        });
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while updating post'
        });
    }
}));
// DELETE - Delete a post by ID
posts.delete('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield (0, postUtilities_1.deletePost)(id);
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while deleting post'
        });
    }
}));
// GET - Search posts
posts.get('/posts/search/:query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.params;
        if (!query || query.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
            return;
        }
        const searchResults = yield (0, postUtilities_1.searchPosts)(query.trim());
        res.json({
            success: true,
            data: searchResults,
            count: searchResults.length
        });
    }
    catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while searching posts'
        });
    }
}));
// GET - Get categories (unique categories from all posts)
posts.get('/posts/meta/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allPosts = yield (0, postUtilities_1.getAllPosts)();
        const categories = [...new Set(allPosts.map(post => post.category))].sort();
        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    }
    catch (error) {
        console.error('Error retrieving categories:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while retrieving categories'
        });
    }
}));
// GET - Get tags (unique tags from all posts)
posts.get('/posts/meta/tags', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allPosts = yield (0, postUtilities_1.getAllPosts)();
        const tags = [...new Set(allPosts.flatMap(post => post.tags))].sort();
        res.json({
            success: true,
            data: tags,
            count: tags.length
        });
    }
    catch (error) {
        console.error('Error retrieving tags:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while retrieving tags'
        });
    }
}));
exports.default = posts;
