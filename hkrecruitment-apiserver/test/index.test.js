"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
describe("test add function", function () {
    it("should return 15 for add(10,5)", function () {
        expect(index_1.sum(10, 5)).toBe(15);
    });
    it("should return 5 for add(2,3)", function () {
        expect(index_1.sum(2, 3)).toBe(5);
    });
});
//# sourceMappingURL=index.test.js.map