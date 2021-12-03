import { sum } from "../src/index";

describe("test add function", () => {
    it("should return 15 for add(10,5)", () => {
        expect(sum(10, 5)).toBe(15);
    });
    it("should return 5 for add(2,3)", () => {
        expect(sum(2, 3)).toBe(5);
    });
});
