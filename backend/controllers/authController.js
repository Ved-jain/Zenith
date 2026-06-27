const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/UserModel");

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: Number(process.env.COOKIE_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000,
});

const getPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    const token = signToken(user);
    res.cookie("token", token, getCookieOptions());

    return res.status(201).json({ user: getPublicUser(user) });
  } catch (error) {
    console.error("Registration failed:", error.message);
    return res.status(500).json({
      message: "Registration failed.",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    res.cookie("token", token, getCookieOptions());

    return res.json({ user: getPublicUser(user) });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({
      message: "Login failed.",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", getCookieOptions());
  return res.json({ message: "Logged out." });
};

const me = (req, res) => {
  return res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  logout,
  me,
};
