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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPosts = exports.validatePostData = exports.getPostsWithFilters = exports.deletePost = exports.updatePost = exports.getPostById = exports.createPost = exports.generatePostId = exports.saveAllPosts = exports.getAllPosts = exports.ensureDataDirectory = void 0;
const fs_1 = require("fs");
// Posts storage file path
const POSTS_FILE = './data/posts.json';
const DATA_DIR = './data';
// Ensure data directory exists
const ensureDataDirectory = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.promises.access(DATA_DIR, fs_1.constants.F_OK);
    }
    catch (_a) {
        yield fs_1.promises.mkdir(DATA_DIR, { recursive: true });
    }
});
exports.ensureDataDirectory = ensureDataDirectory;
// Check if posts file exists
const checkPostsFileExists = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.promises.access(POSTS_FILE, fs_1.constants.F_OK);
        return true;
    }
    catch (_b) {
        return false;
    }
});
// Initialize posts file if it doesn't exist
const initializePostsFile = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield checkPostsFileExists())) {
        yield fs_1.promises.writeFile(POSTS_FILE, JSON.stringify([], null, 2));
    }
});
// Read all posts from storage
const getAllPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.ensureDataDirectory)();
    yield initializePostsFile();
    try {
        const data = yield fs_1.promises.readFile(POSTS_FILE, 'utf-8');
        return JSON.parse(data) || [];
    }
    catch (error) {
        console.error('Error reading posts:', error);
        return [];
    }
});
exports.getAllPosts = getAllPosts;
// Save all posts to storage
const saveAllPosts = (posts) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.ensureDataDirectory)();
    try {
        yield fs_1.promises.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
    }
    catch (error) {
        console.error('Error saving posts:', error);
        throw new Error('Failed to save posts');
    }
});
exports.saveAllPosts = saveAllPosts;
// Generate unique ID for posts
const generatePostId = () => {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
exports.generatePostId = generatePostId;
// Create a new post
const createPost = (postData) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, exports.getAllPosts)();
    const newPost = Object.assign(Object.assign({ id: (0, exports.generatePostId)() }, postData), { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    posts.push(newPost);
    yield (0, exports.saveAllPosts)(posts);
    return newPost;
});
exports.createPost = createPost;
// Get post by ID
const getPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, exports.getAllPosts)();
    return posts.find(post => post.id === id) || null;
});
exports.getPostById = getPostById;
// Update post by ID
const updatePost = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, exports.getAllPosts)();
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) {
        return null;
    }
    posts[postIndex] = Object.assign(Object.assign(Object.assign({}, posts[postIndex]), updates), { updatedAt: new Date().toISOString() });
    yield (0, exports.saveAllPosts)(posts);
    return posts[postIndex];
});
exports.updatePost = updatePost;
// Delete post by ID
const deletePost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, exports.getAllPosts)();
    const filteredPosts = posts.filter(post => post.id !== id);
    if (filteredPosts.length === posts.length) {
        return false; // Post not found
    }
    yield (0, exports.saveAllPosts)(filteredPosts);
    return true;
});
exports.deletePost = deletePost;
// Get posts with filters
const getPostsWithFilters = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    let posts = yield (0, exports.getAllPosts)();
    // Apply filters
    if (filters.category) {
        posts = posts.filter(post => { var _a; return post.category.toLowerCase() === ((_a = filters.category) === null || _a === void 0 ? void 0 : _a.toLowerCase()); });
    }
    if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
    }
    if (filters.author) {
        posts = posts.filter(post => post.author.toLowerCase().includes(filters.author.toLowerCase()));
    }
    if (filters.tag) {
        posts = posts.filter(post => post.tags.some(tag => tag.toLowerCase().includes(filters.tag.toLowerCase())));
    }
    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = posts.length;
    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 10;
    posts = posts.slice(offset, offset + limit);
    return { posts, total };
});
exports.getPostsWithFilters = getPostsWithFilters;
// Validate post data
const validatePostData = (data) => {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
        return 'Title is required and must be a non-empty string';
    }
    if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
        return 'Content is required and must be a non-empty string';
    }
    if (!data.author || typeof data.author !== 'string' || data.author.trim().length === 0) {
        return 'Author is required and must be a non-empty string';
    }
    if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
        return 'Category is required and must be a non-empty string';
    }
    if (data.status && !['draft', 'published'].includes(data.status)) {
        return 'Status must be either "draft" or "published"';
    }
    if (data.tags && !Array.isArray(data.tags)) {
        return 'Tags must be an array';
    }
    if (data.tags && data.tags.some((tag) => typeof tag !== 'string')) {
        return 'All tags must be strings';
    }
    return null;
};
exports.validatePostData = validatePostData;
// Search posts by title or content
const searchPosts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, exports.getAllPosts)();
    const lowercaseQuery = query.toLowerCase();
    return posts.filter(post => post.title.toLowerCase().includes(lowercaseQuery) ||
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});
exports.searchPosts = searchPosts;
