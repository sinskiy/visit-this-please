import test, { before, it } from "node:test";
import request from "supertest";
import { app } from "../app.ts";
import { strictEqual, match } from "node:assert/strict";

test("sign up", async () => {
  await it("should create a user", async () => {
    const randomUsername = generateString(100);
    const res = await request(app)
      .post("/sign-up")
      .send({ username: randomUsername, password: "123" });
    strictEqual(res.status, 200);
    match(res.headers["set-cookie"]![0]!, /connect.sid=/);
    strictEqual(res.body.user.username, randomUsername);
  });

  await it("shouldn't create a user", async () => {
    const randomUsername = generateString(101);
    const res = await request(app)
      .post("/sign-up")
      .send({ username: randomUsername, password: "123" });
    strictEqual(res.status, 400);
  });

  await it("shouldn't create a user", async () => {
    const randomPassword = generateString(101);
    const res = await request(app)
      .post("/sign-up")
      .send({ username: "a", password: randomPassword });
    strictEqual(res.status, 400);
  });
});

let cookie: string;
test("log out", async () => {
  before(async () => {
    const randomUsername = generateString(100);
    const res = await request(app)
      .post("/sign-up")
      .send({ username: randomUsername, password: "123" });
    cookie = res.headers["set-cookie"]!;
  });
  await it("should log out user", async () => {
    const res = await request(app)
      .post("/log-out")
      .set("Cookie", [cookie])
      .send();
    strictEqual(res.body.status, "success");
    strictEqual(
      res.headers["set-cookie"]![0]!.split("=")[1]!.split(";")[0],
      ""
    );
  });
});

function generateString(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
