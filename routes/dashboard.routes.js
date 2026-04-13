import express from 'express';
import {
  dashboardLogin,
  dashboardLoginPage,
  dashboardLogout,
  dashboardPage,
  dashboardSignup,
  dashboardSignupPage,
} from '../controllers/auth.controller.js';
import { protectDashboard } from '../middlewares/auth.middleware.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/login', dashboardLoginPage);
dashboardRouter.post('/login', dashboardLogin);
dashboardRouter.get('/signup', dashboardSignupPage);
dashboardRouter.post('/signup', dashboardSignup);
dashboardRouter.post('/logout', dashboardLogout);
dashboardRouter.get('/', protectDashboard, dashboardPage);

export default dashboardRouter;
