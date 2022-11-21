"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
describe('server tests ', () => {
    it('should return 3000  (Server works)', () => {
        expect((0, index_1.getPort)()).toBe(3000);
    });
});
