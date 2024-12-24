import express from "express";
import { createServer } from "node:http";
import env from "../src/env.ts";
import cors from "cors";

export const app = express();
app.use(cors({ origin: env.CLIENT_URL }));
const server = createServer(app);

app.get("/", (_req, res) => {
  console.log("hello!");
  res.json({ hello: "world" });
});

const port = env.PORT;
server.listen(port, () => {
  if (env.NODE_ENV === "development") {
    console.log(`http://localhost:${port}`);
  }
});
