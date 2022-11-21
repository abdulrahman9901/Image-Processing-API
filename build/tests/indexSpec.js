"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
describe("basic test ", () => {
    it('should return 3000 ', () => {
        expect((0, index_1.getPort)()).toBe(3000);
    });
});
