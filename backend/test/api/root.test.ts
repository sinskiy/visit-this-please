import test, { it } from "node:test";
import request from "supertest";
import { app } from "../../src/app.ts";
import { deepEqual } from "node:assert/strict";

test("root", async () => {
  await it("should return an object with hello === world", async () => {
    const res = await request(app)
      .get("/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    deepEqual(res.body, { hello: "world" });
  });
});
