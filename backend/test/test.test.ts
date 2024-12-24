import { strictEqual } from "node:assert/strict";
import test, { it } from "node:test";

test("test of node test runner", () => {
  it("should pass", () => {
    strictEqual(true, true);
  });
});
