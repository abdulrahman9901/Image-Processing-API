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
app.use('/', index_1.default);
app.listen(port, () => console.log(`server running on port ${port}`));
