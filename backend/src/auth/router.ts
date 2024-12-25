import { Router } from "express";
import { ErrorWithStatus } from "../lib/error.ts";
import bcrypt from "bcryptjs";
import { User } from "../db/config.ts";
import passport from "passport";
import { object, string } from "zod";

const router = Router();

const UserRequestSchema = object({
  username: string().min(1).max(100),
  password: string().min(1).max(100),
});

const UserSchema = object({
  id: string(),
  username: string().min(1).max(100),
});

router.post("/sign-up", async (req, res) => {
  if (!req.body?.username || !req.body?.password) {
    throw new ErrorWithStatus("No username or password", 400);
  }

  const parsedBody = UserRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    throw new ErrorWithStatus("Incorrect username or password", 400);
  }

  const { username, password } = parsedBody.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await User.insertMany({ username, password: hashedPassword });

  const parsedUser = UserSchema.safeParse(user);
  if (!parsedUser.success) {
    throw new Error();
  }

  req.login(parsedUser.data, (err) => {
    if (err) {
      throw new ErrorWithStatus("Couldn't log in", 500);
    }
    res.json({ user: parsedUser.data });
  });
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    failureRedirect: "/log-in/error",
    successRedirect: "/auth",
  })
);

router.post("/log-out", (req, res) => {
  res.clearCookie("connect.sid", { path: "/", httpOnly: true });
  req.logout((err) => {
    if (err) {
      throw new ErrorWithStatus("Couldn't log out", 500);
    }
    res.json({ status: "success" });
  });
});

// TODO: make ESLint working
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get("/log-in/error", (_req, _res) => {
  throw new ErrorWithStatus("Unauthorized", 401);
});

export default router;
