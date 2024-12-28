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

  const userExists = await User.findOne({ username });
  if (userExists) {
    throw new ErrorWithStatus("Username is not unique", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await User.insertMany([
    { username, password: hashedPassword },
  ]);

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
    failureRedirect: "/auth",
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

router.get("/auth", (req, res) => {
  if (!req.user) {
    throw new ErrorWithStatus("Unauthorized", 401);
  }

  res.json({ user: req.user });
});

export default router;
