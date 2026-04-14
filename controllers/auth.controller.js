import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { verifyRefreshToken } from "../utils/tokens.js";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../utils/cookies.js";
import {
  issueTokens,
  clearAuthCookies,
} from "../middlewares/auth.middleware.js";
import { sha256 } from "../utils/crypto.js";

const invalidCredentialsMessage = "Invalid email or password";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(password);
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many auth attempts. Please try again in a few minutes.",
  },
});

export const apiSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be 8-72 chars and include upper, lower, and a number",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already in use" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const { accessToken } = await issueTokens(user, res);

    return res.status(201).json({
      message: "Signup successful",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: "Could not sign up user" });
  }
};

export const apiLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +refreshTokenHash +refreshTokenExpiresAt");

    if (!user) {
      return res.status(401).json({ error: invalidCredentialsMessage });
    }

    if (!user.password) {
      return res.status(401).json({ error: invalidCredentialsMessage });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: invalidCredentialsMessage });
    }

    const { accessToken } = await issueTokens(user, res);

    return res.status(200).json({
      message: "Login successful",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: "Could not log in user" });
  }
};

export const apiRefresh = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.[REFRESH_TOKEN_COOKIE] || req.body?.refreshToken || null;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.sub).select(
      "+refreshTokenHash +refreshTokenExpiresAt _id name email role createdAt updatedAt",
    );

    if (!user || !user.refreshTokenHash) {
      clearAuthCookies(res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const isHashMatch = sha256(refreshToken) === user.refreshTokenHash;
    const isExpired =
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt.getTime() < Date.now();

    if (!isHashMatch || isExpired) {
      clearAuthCookies(res);
      return res
        .status(401)
        .json({ error: "Refresh token expired or invalid" });
    }

    const { accessToken } = await issueTokens(user, res);

    return res.status(200).json({
      message: "Token refreshed",
      accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({ error: "Refresh token expired or invalid" });
  }
};

export const apiLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] || null;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await User.findByIdAndUpdate(decoded.sub, {
          $set: {
            refreshTokenHash: null,
            refreshTokenExpiresAt: null,
          },
        });
      } catch (error) {
        // Ignore invalid refresh token and continue logout.
      }
    }

    clearAuthCookies(res);

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    clearAuthCookies(res);

    return res.status(200).json({ message: "Logout successful" });
  }
};

export const apiMe = async (req, res) => {
  return res.status(200).json({ user: req.auth });
};
