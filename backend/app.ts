import express from "express";
import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import env from "./env.ts";

const app = express();
const server = createServer(
  {
    key: readFileSync("private-key.pem"),
    cert: readFileSync("certificate.pem"),
  },
  app
);

const port = env.PORT;
server.listen(port, () => {
  if (env.NODE_ENV === "development") {
    console.log(`http://localhost:${port}`);
  }
});
