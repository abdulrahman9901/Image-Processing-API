"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPort = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
exports.app = app;
const port = 3000;
const getPort = () => port;
exports.getPort = getPort;
// Middleware for parsing JSON and URL-encoded data
app.use(require('express').json({ limit: '10mb' }));
app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));
// Enable CORS for cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
app.use('/', index_1.default);
app.listen(port, () => console.log(`server running on port ${port}`));
