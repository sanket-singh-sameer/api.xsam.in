export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const isProduction = process.env.NODE_ENV === 'production';

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
};

export const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
