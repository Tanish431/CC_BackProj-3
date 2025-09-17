import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import passport from "../passport.js";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

router.post("/user/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });
  const exists = await User.findOne({ where: { username } });
  if (exists) return res.status(409).json({ error: "User exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash: hash });
  const token = jwt.sign({ id: user.id, username, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

router.post("/user/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, username, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

// Google OAuth start
router.get("/google", (req, res, next) => {
  passport.authenticate("google", { scope: ["email", "profile"] })(req, res, next);
});

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {session: false, failureRedirect: "/user/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, username: req.user.username, role: req.user.role }, process.env.JWT_SECRET);
    const redirectUrl = process.env.CLIENT_REDIRECT_URI;
    if (redirectUrl) {
      const sep = redirectUrl.includes("?") ? "&" : "?";
      return res.redirect(`${redirectUrl}${sep}token=${token}`);
    }
    res.json({ token });
  }
);

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username, role: "admin" } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, username, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

export default router;
