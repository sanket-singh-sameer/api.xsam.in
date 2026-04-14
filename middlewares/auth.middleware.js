import User from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/tokens.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from '../utils/cookies.js';
import { sha256 } from '../utils/crypto.js';

const buildAuthPayload = (user) => ({
  sub: user._id.toString(),
  role: user.role,
  email: user.email,
  name: user.name,
});

export const issueTokens = async (user, res) => {
  const payload = buildAuthPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokenHash = sha256(refreshToken);
  user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);

  return { accessToken, refreshToken };
};

export const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
};

export const protectApi = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE] || null;
    const token = bearerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select('_id name email role');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.auth = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const protectDashboard = async (req, res, next) => {
  const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (!accessToken) {
    return res.redirect('/dashboard/login');
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    const user = await User.findById(decoded.sub).select('_id name email role');

    if (!user) {
      clearAuthCookies(res);
      return res.redirect('/dashboard/login');
    }

    req.auth = user;
    return next();
  } catch (error) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      clearAuthCookies(res);
      return res.redirect('/dashboard/login');
    }

    try {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      const user = await User.findById(decodedRefresh.sub).select(
        '+refreshTokenHash +refreshTokenExpiresAt _id name email role'
      );

      if (!user || !user.refreshTokenHash) {
        clearAuthCookies(res);
        return res.redirect('/dashboard/login');
      }

      const incomingHash = sha256(refreshToken);
      const isHashMatch = incomingHash === user.refreshTokenHash;
      const isExpired =
        !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() < Date.now();

      if (!isHashMatch || isExpired) {
        clearAuthCookies(res);
        return res.redirect('/dashboard/login');
      }

      await issueTokens(user, res);
      req.auth = user;
      return next();
    } catch (refreshError) {
      clearAuthCookies(res);
      return res.redirect('/dashboard/login');
    }
  }
};

export const redirectIfAuthenticated = async (req, res, next) => {
  const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!accessToken) {
    if (!refreshToken) {
      return next();
    }

    try {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      const user = await User.findById(decodedRefresh.sub).select(
        '+refreshTokenHash +refreshTokenExpiresAt _id name email role'
      );

      if (!user || !user.refreshTokenHash) {
        clearAuthCookies(res);
        return next();
      }

      const incomingHash = sha256(refreshToken);
      const isHashMatch = incomingHash === user.refreshTokenHash;
      const isExpired =
        !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() < Date.now();

      if (!isHashMatch || isExpired) {
        clearAuthCookies(res);
        return next();
      }

      await issueTokens(user, res);
      return res.redirect('/dashboard');
    } catch (refreshError) {
      clearAuthCookies(res);
      return next();
    }
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    const user = await User.findById(decoded.sub).select('_id name email role');

    if (!user) {
      clearAuthCookies(res);
      return next();
    }

    return res.redirect('/dashboard');
  } catch (error) {
    if (!refreshToken) {
      clearAuthCookies(res);
      return next();
    }

    try {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      const user = await User.findById(decodedRefresh.sub).select(
        '+refreshTokenHash +refreshTokenExpiresAt _id name email role'
      );

      if (!user || !user.refreshTokenHash) {
        clearAuthCookies(res);
        return next();
      }

      const incomingHash = sha256(refreshToken);
      const isHashMatch = incomingHash === user.refreshTokenHash;
      const isExpired =
        !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() < Date.now();

      if (!isHashMatch || isExpired) {
        clearAuthCookies(res);
        return next();
      }

      await issueTokens(user, res);
      return res.redirect('/dashboard');
    } catch (refreshError) {
      clearAuthCookies(res);
      return next();
    }
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return res.status(403).send('Forbidden');
    }

    return next();
  };
};
