import express from 'express';
import {
  dashboardLoginPage,
  dashboardPage,
  dashboardSignupPage,
} from '../controllers/auth.controller.js';
import {
  protectDashboard,
  redirectIfAuthenticated,
} from '../middlewares/auth.middleware.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/login', redirectIfAuthenticated, dashboardLoginPage);
dashboardRouter.get('/signup', redirectIfAuthenticated, dashboardSignupPage);
dashboardRouter.get('/', protectDashboard, dashboardPage);
dashboardRouter.use('/', redirectIfAuthenticated, (req, res) => {
  return res.redirect('/dashboard/login');
});

export default dashboardRouter;
