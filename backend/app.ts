import express from "express";
import { readFileSync } from "node:fs";
import { createServer } from "node:https";
import { DEFAULT_PORT } from "./const.ts";

const app = express();
const server = createServer(
  {
    key: readFileSync("private-key.pem"),
    cert: readFileSync("certificate.pem"),
  },
  app
);

const port = process.env.PORT ?? DEFAULT_PORT;
server.listen(port, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`http://localhost:${port}`);
  }
});
