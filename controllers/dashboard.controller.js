import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Timeline from '../models/Timeline.js';
import Message from '../models/Message.js';
import Social from '../models/Social.js';
import User from '../models/User.js';

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

export const dashboardPage = async (req, res) => {
  const [projectsCount, skillsCount, timelinesCount, messagesCount, socialsCount] = await Promise.all([
    Project.countDocuments({}),
    Skill.countDocuments({}),
    Timeline.countDocuments({}),
    Message.countDocuments({ status: { $ne: 'deleted' } }),
    Social.countDocuments({}),
  ]);

  return res.render('dashboard/index', {
    pageTitle: 'Dashboard',
    auth: req.auth,
    activeMenu: 'dashboard',
    stats: {
      projectsCount,
      skillsCount,
      timelinesCount,
      messagesCount,
      socialsCount,
    },
  });
};

export const dashboardProjectsPage = async (req, res) => {
  const projects = await Project.find({}).sort({ createdAt: -1 });
  return res.render('dashboard/projects/index', {
    pageTitle: 'Manage Projects',
    auth: req.auth,
    activeMenu: 'projects',
    projects,
  });
};

export const dashboardProjectAddPage = (req, res) => {
  return res.render('dashboard/projects/form', {
    pageTitle: 'Add Project',
    auth: req.auth,
    activeMenu: 'projects-add',
    project: null,
  });
};

export const dashboardProjectEditPage = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).render('dashboard/projects/form', {
      pageTitle: 'Project Not Found',
      auth: req.auth,
      activeMenu: 'projects',
      project: null,
      error: 'Project not found',
    });
  }

  return res.render('dashboard/projects/form', {
    pageTitle: 'Edit Project',
    auth: req.auth,
    activeMenu: 'projects',
    project,
  });
};

export const dashboardSkillsPage = async (req, res) => {
  const skills = await Skill.find({}).sort({ createdAt: -1 });
  return res.render('dashboard/skills/index', {
    pageTitle: 'Manage Skills',
    auth: req.auth,
    activeMenu: 'skills',
    skills,
  });
};

export const dashboardSkillAddPage = (req, res) => {
  return res.render('dashboard/skills/form', {
    pageTitle: 'Add Skill',
    auth: req.auth,
    activeMenu: 'skills-add',
    skill: null,
  });
};

export const dashboardSkillEditPage = async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).render('dashboard/skills/form', {
      pageTitle: 'Skill Not Found',
      auth: req.auth,
      activeMenu: 'skills',
      skill: null,
      error: 'Skill not found',
    });
  }

  return res.render('dashboard/skills/form', {
    pageTitle: 'Edit Skill',
    auth: req.auth,
    activeMenu: 'skills',
    skill,
  });
};

export const dashboardTimelinesPage = async (req, res) => {
  const timelines = await Timeline.find({}).sort({ createdAt: -1 });
  return res.render('dashboard/timelines/index', {
    pageTitle: 'Manage Timelines',
    auth: req.auth,
    activeMenu: 'timelines',
    timelines,
  });
};

export const dashboardTimelineAddPage = (req, res) => {
  return res.render('dashboard/timelines/form', {
    pageTitle: 'Add Timeline',
    auth: req.auth,
    activeMenu: 'timelines-add',
    timeline: null,
  });
};

export const dashboardTimelineEditPage = async (req, res) => {
  const timeline = await Timeline.findById(req.params.id);

  if (!timeline) {
    return res.status(404).render('dashboard/timelines/form', {
      pageTitle: 'Timeline Not Found',
      auth: req.auth,
      activeMenu: 'timelines',
      timeline: null,
      error: 'Timeline not found',
    });
  }

  return res.render('dashboard/timelines/form', {
    pageTitle: 'Edit Timeline',
    auth: req.auth,
    activeMenu: 'timelines',
    timeline,
  });
};

export const dashboardSocialsPage = async (req, res) => {
  const socials = await Social.find({}).sort({ createdAt: -1 });
  return res.render('dashboard/socials/index', {
    pageTitle: 'Manage Socials',
    auth: req.auth,
    activeMenu: 'socials',
    socials,
  });
};

export const dashboardSocialAddPage = (req, res) => {
  return res.render('dashboard/socials/form', {
    pageTitle: 'Add Social',
    auth: req.auth,
    activeMenu: 'socials-add',
    social: null,
  });
};

export const dashboardSocialEditPage = async (req, res) => {
  const social = await Social.findById(req.params.id);

  if (!social) {
    return res.status(404).render('dashboard/socials/form', {
      pageTitle: 'Social Not Found',
      auth: req.auth,
      activeMenu: 'socials',
      social: null,
      error: 'Social not found',
    });
  }

  return res.render('dashboard/socials/form', {
    pageTitle: 'Edit Social',
    auth: req.auth,
    activeMenu: 'socials',
    social,
  });
};

export const dashboardProfilePage = async (req, res) => {
  const profile = await User.findById(req.auth._id).select(
    '_id name email tagline bio avatar location website role'
  );

  return res.render('dashboard/profile/form', {
    pageTitle: 'Edit Profile',
    auth: req.auth,
    activeMenu: 'profile',
    profile,
  });
};

export const dashboardMessagesPage = async (req, res) => {
  const selectedStatus = typeof req.query.status === 'string' ? req.query.status : 'all';
  const query = { status: { $ne: 'deleted' } };

  if (
    selectedStatus &&
    selectedStatus !== 'all' &&
    ['new', 'read', 'replied', 'archived', 'spam'].includes(selectedStatus)
  ) {
    query.status = selectedStatus;
  }

  const messages = await Message.find(query).sort({ createdAt: -1 });

  return res.render('dashboard/messages/index', {
    pageTitle: 'Messages',
    auth: req.auth,
    activeMenu: 'messages',
    selectedStatus,
    messages,
  });
};

export const dashboardUploadsPage = async (req, res) => {
  return res.render('dashboard/uploads/index', {
    pageTitle: 'Manage Uploads',
    auth: req.auth,
    activeMenu: 'uploads',
    NODE_ENV: process.env.NODE_ENV,
  });
};