import express from 'express';
import {
  dashboardProjectAddPage,
  dashboardProjectEditPage,
  dashboardProjectsPage,
  dashboardProfilePage,
  dashboardMessagesPage,
  dashboardLoginPage,
  dashboardPage,
  dashboardSocialAddPage,
  dashboardSocialEditPage,
  dashboardSocialsPage,
  dashboardSkillAddPage,
  dashboardSkillEditPage,
  dashboardSkillsPage,
  dashboardSignupPage,
  dashboardUploadsPage,
  dashboardTimelineAddPage,
  dashboardTimelineEditPage,
  dashboardTimelinesPage,
} from '../../controllers/dashboard.controller.js';
import {
  protectDashboard,
  redirectIfAuthenticated,
} from '../../middlewares/auth.middleware.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/login', redirectIfAuthenticated, dashboardLoginPage);
dashboardRouter.get('/signup', redirectIfAuthenticated, dashboardSignupPage);
dashboardRouter.get('/', protectDashboard, dashboardPage);
dashboardRouter.get('/projects', protectDashboard, dashboardProjectsPage);
dashboardRouter.get('/projects/add', protectDashboard, dashboardProjectAddPage);
dashboardRouter.get('/projects/:id', protectDashboard, dashboardProjectEditPage);
dashboardRouter.get('/skills', protectDashboard, dashboardSkillsPage);
dashboardRouter.get('/skills/add', protectDashboard, dashboardSkillAddPage);
dashboardRouter.get('/skills/:id', protectDashboard, dashboardSkillEditPage);
dashboardRouter.get('/timelines', protectDashboard, dashboardTimelinesPage);
dashboardRouter.get('/timelines/add', protectDashboard, dashboardTimelineAddPage);
dashboardRouter.get('/timelines/:id', protectDashboard, dashboardTimelineEditPage);
dashboardRouter.get('/socials', protectDashboard, dashboardSocialsPage);
dashboardRouter.get('/socials/add', protectDashboard, dashboardSocialAddPage);
dashboardRouter.get('/socials/:id', protectDashboard, dashboardSocialEditPage);
dashboardRouter.get('/profile', protectDashboard, dashboardProfilePage);
dashboardRouter.get('/messages', protectDashboard, dashboardMessagesPage);
dashboardRouter.get('/uploads', protectDashboard, dashboardUploadsPage);
dashboardRouter.use('/', redirectIfAuthenticated, (req, res) => {
  return res.redirect('/dashboard/login');
});

export default dashboardRouter;
