import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const getEnvOrThrow = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const signAccessToken = (payload) => {
  const secret = getEnvOrThrow('JWT_ACCESS_SECRET');
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_TTL });
};

export const signRefreshToken = (payload) => {
  const secret = getEnvOrThrow('JWT_REFRESH_SECRET');
  return jwt.sign(payload, secret, { expiresIn: REFRESH_TOKEN_TTL });
};

export const verifyAccessToken = (token) => {
  const secret = getEnvOrThrow('JWT_ACCESS_SECRET');
  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token) => {
  const secret = getEnvOrThrow('JWT_REFRESH_SECRET');
  return jwt.verify(token, secret);
};
