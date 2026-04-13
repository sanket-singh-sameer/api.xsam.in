import Auth from '../models/Auth.js';
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

const buildAuthPayload = (auth) => ({
  sub: auth._id.toString(),
  role: auth.role,
  email: auth.email,
  name: auth.name,
});

export const issueTokens = async (auth, res) => {
  const payload = buildAuthPayload(auth);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  auth.refreshTokenHash = sha256(refreshToken);
  auth.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await auth.save({ validateBeforeSave: false });

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
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);
    const auth = await Auth.findById(decoded.sub).select('_id name email role');

    if (!auth) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.auth = auth;
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
    const auth = await Auth.findById(decoded.sub).select('_id name email role');

    if (!auth) {
      clearAuthCookies(res);
      return res.redirect('/dashboard/login');
    }

    req.auth = auth;
    return next();
  } catch (error) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      clearAuthCookies(res);
      return res.redirect('/dashboard/login');
    }

    try {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      const auth = await Auth.findById(decodedRefresh.sub).select(
        '+refreshTokenHash +refreshTokenExpiresAt _id name email role'
      );

      if (!auth || !auth.refreshTokenHash) {
        clearAuthCookies(res);
        return res.redirect('/dashboard/login');
      }

      const incomingHash = sha256(refreshToken);
      const isHashMatch = incomingHash === auth.refreshTokenHash;
      const isExpired =
        !auth.refreshTokenExpiresAt || auth.refreshTokenExpiresAt.getTime() < Date.now();

      if (!isHashMatch || isExpired) {
        clearAuthCookies(res);
        return res.redirect('/dashboard/login');
      }

      await issueTokens(auth, res);
      req.auth = auth;
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
      const auth = await Auth.findById(decodedRefresh.sub).select(
        '+refreshTokenHash +refreshTokenExpiresAt _id name email role'
      );

      if (!auth || !auth.refreshTokenHash) {
        clearAuthCookies(res);
        return next();
      }

      const incomingHash = sha256(refreshToken);
      const isHashMatch = incomingHash === auth.refreshTokenHash;
      const isExpired =
        !auth.refreshTokenExpiresAt || auth.refreshTokenExpiresAt.getTime() < Date.now();

      if (!isHashMatch || isExpired) {
        clearAuthCookies(res);
        return next();
      }

      await issueTokens(auth, res);
      return res.redirect('/dashboard');
    } catch (refreshError) {
      clearAuthCookies(res);
      return next();
    }
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    const auth = await Auth.findById(decoded.sub).select('_id name email role');

    if (!auth) {
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
      const auth = await Auth.findById(decodedRefresh.sub).select(
        '+refreshTokenHash +refreshTokenExpiresAt _id name email role'
      );

      if (!auth || !auth.refreshTokenHash) {
        clearAuthCookies(res);
        return next();
      }

      const incomingHash = sha256(refreshToken);
      const isHashMatch = incomingHash === auth.refreshTokenHash;
      const isExpired =
        !auth.refreshTokenExpiresAt || auth.refreshTokenExpiresAt.getTime() < Date.now();

      if (!isHashMatch || isExpired) {
        clearAuthCookies(res);
        return next();
      }

      await issueTokens(auth, res);
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
