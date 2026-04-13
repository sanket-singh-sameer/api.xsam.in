import rateLimit from 'express-rate-limit';
import Auth from '../models/Auth.js';
import { verifyRefreshToken } from '../utils/tokens.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../utils/cookies.js';
import { issueTokens, clearAuthCookies } from '../middlewares/auth.middleware.js';
import { sha256 } from '../utils/crypto.js';

const invalidCredentialsMessage = 'Invalid email or password';

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(password);
};

const sanitizeAuth = (auth) => ({
  id: auth._id,
  name: auth.name,
  email: auth.email,
  role: auth.role,
  createdAt: auth.createdAt,
  updatedAt: auth.updatedAt,
});

const isFormRequest = (req) => req.is('application/x-www-form-urlencoded');

const redirectWithError = (res, path, error) => {
  return res.redirect(`${path}?error=${encodeURIComponent(error)}`);
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many auth attempts. Please try again in a few minutes.',
  },
});

export const apiSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      if (isFormRequest(req)) {
        return redirectWithError(res, '/dashboard/signup', 'All fields are required');
      }
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!isValidEmail(email)) {
      if (isFormRequest(req)) {
        return redirectWithError(res, '/dashboard/signup', 'Invalid email address');
      }
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (!isStrongPassword(password)) {
      if (isFormRequest(req)) {
        return redirectWithError(
          res,
          '/dashboard/signup',
          'Password must include upper, lower, and number'
        );
      }
      return res.status(400).json({
        error:
          'Password must be 8-72 chars and include upper, lower, and a number',
      });
    }

    const existingAuth = await Auth.findOne({ email: email.toLowerCase().trim() });
    if (existingAuth) {
      if (isFormRequest(req)) {
        return redirectWithError(res, '/dashboard/signup', 'Email already in use');
      }
      return res.status(409).json({ error: 'Email is already in use' });
    }

    const auth = await Auth.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const { accessToken } = await issueTokens(auth, res);

    if (isFormRequest(req)) {
      return res.redirect('/dashboard');
    }

    return res.status(201).json({
      message: 'Signup successful',
      auth: sanitizeAuth(auth),
      accessToken,
    });
  } catch (error) {
    if (isFormRequest(req)) {
      return redirectWithError(res, '/dashboard/signup', 'Could not create account');
    }
    return res.status(500).json({ error: 'Could not sign up auth' });
  }
};

export const apiLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      if (isFormRequest(req)) {
        return redirectWithError(res, '/dashboard/login', 'Email and password are required');
      }
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const auth = await Auth.findOne({ email: email.toLowerCase().trim() }).select(
      '+password +refreshTokenHash +refreshTokenExpiresAt'
    );

    if (!auth) {
      if (isFormRequest(req)) {
        return redirectWithError(res, '/dashboard/login', 'Invalid credentials');
      }
      return res.status(401).json({ error: invalidCredentialsMessage });
    }

    const isPasswordValid = await auth.comparePassword(password);
    if (!isPasswordValid) {
      if (isFormRequest(req)) {
        return redirectWithError(res, '/dashboard/login', 'Invalid credentials');
      }
      return res.status(401).json({ error: invalidCredentialsMessage });
    }

    const { accessToken } = await issueTokens(auth, res);

    if (isFormRequest(req)) {
      return res.redirect('/dashboard');
    }

    return res.status(200).json({
      message: 'Login successful',
      auth: sanitizeAuth(auth),
      accessToken,
    });
  } catch (error) {
    if (isFormRequest(req)) {
      return redirectWithError(res, '/dashboard/login', 'Could not log in');
    }
    return res.status(500).json({ error: 'Could not log in auth' });
  }
};

export const apiRefresh = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.[REFRESH_TOKEN_COOKIE] || req.body?.refreshToken || null;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const auth = await Auth.findById(decoded.sub).select(
      '+refreshTokenHash +refreshTokenExpiresAt _id name email role createdAt updatedAt'
    );

    if (!auth || !auth.refreshTokenHash) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const isHashMatch = sha256(refreshToken) === auth.refreshTokenHash;
    const isExpired =
      !auth.refreshTokenExpiresAt || auth.refreshTokenExpiresAt.getTime() < Date.now();

    if (!isHashMatch || isExpired) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Refresh token expired or invalid' });
    }

    const { accessToken } = await issueTokens(auth, res);

    return res.status(200).json({
      message: 'Token refreshed',
      accessToken,
      auth: sanitizeAuth(auth),
    });
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Refresh token expired or invalid' });
  }
};

export const apiLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] || null;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await Auth.findByIdAndUpdate(decoded.sub, {
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

    if (isFormRequest(req)) {
      return res.redirect('/dashboard/login');
    }

    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    clearAuthCookies(res);

    if (isFormRequest(req)) {
      return res.redirect('/dashboard/login');
    }

    return res.status(200).json({ message: 'Logout successful' });
  }
};

export const apiMe = async (req, res) => {
  return res.status(200).json({ auth: req.auth });
};

export const dashboardLoginPage = (req, res) => {
  return res.render('dashboard/login', {
    pageTitle: 'Dashboard Login',
    error: req.query.error || null,
  });
};

export const dashboardSignupPage = (req, res) => {
  return res.render('dashboard/signup', {
    pageTitle: 'Dashboard Signup',
    error: req.query.error || null,
  });
};

export const dashboardPage = (req, res) => {
  return res.render('dashboard/index', {
    pageTitle: 'Dashboard',
    auth: req.auth,
  });
};
