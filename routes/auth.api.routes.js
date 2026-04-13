import express from 'express';
import {
  apiLogin,
  apiLogout,
  apiMe,
  apiRefresh,
  apiSignup,
  authLimiter,
} from '../controllers/auth.controller.js';
import { protectApi } from '../middlewares/auth.middleware.js';

const authApiRouter = express.Router();

authApiRouter.use(authLimiter);
authApiRouter.post('/signup', apiSignup);
authApiRouter.post('/login', apiLogin);
authApiRouter.post('/refresh', apiRefresh);
authApiRouter.post('/logout', apiLogout);
authApiRouter.get('/me', protectApi, apiMe);

export default authApiRouter;
