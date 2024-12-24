import express from "express";
import { createServer } from "node:http";
import env from "../src/env.ts";
import cors from "cors";
import { Test } from "./db/config.ts";

export const app = express();
app.use(cors({ origin: env.CLIENT_URL }));
const server = createServer(app);

app.get("/", async (_req, res) => {
  const test1 = await Test.findOne().exec();
  res.json({ hello: test1?.hello });
});

const port = env.PORT;
server.listen(port, () => {
  if (env.NODE_ENV === "development") {
    console.log(`http://localhost:${port}`);
  }
});
