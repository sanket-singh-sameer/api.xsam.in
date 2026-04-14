import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';


import connectDB from './configs/connectDB.js';
import transferAuthToUsers from './configs/migrateAuthToUsers.js';
import authApiRouter from './routes/api/auth.api.routes.js';
import dashboardRouter from './routes/page/dashboard.page.routes.js';
import usersApiRouter from './routes/api/user.api.routes.js';
import projectsApiRouter from './routes/api/project.api.routes.js';
import skillsApiRouter from './routes/api/skill.api.routes.js';
import timelinesApiRouter from './routes/api/timeline.api.routes.js';
import messagesApiRouter from './routes/api/message.api.routes.js';
import socialsApiRouter from './routes/api/social.api.routes.js';
import { protectDashboard } from './middlewares/auth.middleware.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the xsam.in API' });
});


app.get('/portfolio', async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  try {
    const [projectsRes, skillsRes, timelinesRes, socialsRes, userRes] = await Promise.all([
      fetch(`${baseUrl}/api/project`),
      fetch(`${baseUrl}/api/skill`),
      fetch(`${baseUrl}/api/timeline`),
      fetch(`${baseUrl}/api/social`),
      fetch(`${baseUrl}/api/user/public`),
    ]);

    const projectsRaw = projectsRes.ok ? await projectsRes.json() : [];
    const skillsRaw = skillsRes.ok ? await skillsRes.json() : [];
    const timelinesRaw = timelinesRes.ok ? await timelinesRes.json() : [];
    const socialsRaw = socialsRes.ok ? await socialsRes.json() : [];
    const userRaw = userRes.ok ? await userRes.json() : null;

    const projects = Array.isArray(projectsRaw)
      ? projectsRaw.map((project) => ({
          title: project.title,
          description: project.description,
          image: project.image || null,
          tech: Array.isArray(project.technologies)
            ? project.technologies.map((item) => String(item))
            : [],
          link: project.liveLink || project.githubLink || '#',
        }))
      : [];

    const skills = Array.isArray(skillsRaw)
      ? skillsRaw.map((skill) => ({
          name: skill.name,
          icon: skill.icon || null,
        })).filter((skill) => Boolean(skill.name))
      : [];

    const timelines = Array.isArray(timelinesRaw)
      ? timelinesRaw.map((timeline) => ({
          title: timeline.title,
          organization: timeline.organization,
          type: timeline.type,
          startDate: timeline.startDate,
          endDate: timeline.endDate,
        }))
      : [];

    const socials = Array.isArray(socialsRaw)
      ? socialsRaw.map((social) => ({
          name: social.name,
          iconUrl: social.iconUrl || null,
          profileUrl: social.profileUrl || '#',
        }))
      : [];

    res.render('home', {
      pageTitle: 'Home',
      name: userRaw?.name || 'Sanket Singh Sameer',
      role: userRaw?.tagline || 'Full Stack Developer',
      about:
        userRaw?.bio ||
        'I build clear, practical web experiences with strong foundations in backend engineering and modern frontend tooling.',
      email: userRaw?.email || 'mail@xsam.in',
      projects,
      skills,
      timelines,
      socials,
    });
  } catch (error) {
    res.render('home', {
      pageTitle: 'Home',
      name: 'Sanket Singh Sameer',
      role: 'Full Stack Developer',
      about: 'I build clear, practical web experiences with strong foundations in backend engineering and modern frontend tooling.',
      email: 'mail@xsam.in',
      projects: [],
      skills: [],
      timelines: [],
      socials: [],
    });
  }
});



app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use('/api/auth', authApiRouter);
app.use('/api/user', usersApiRouter);
app.use('/api/project', projectsApiRouter);
app.use('/api/skill', skillsApiRouter);
app.use('/api/timeline', timelinesApiRouter);
app.use('/api/message', messagesApiRouter);
app.use('/api/social', socialsApiRouter);


app.use('/dashboard', dashboardRouter);

app.get('/projects', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/projects');
});
app.get('/projects/add', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/projects/add');
});
app.get('/projects/:id', protectDashboard, (req, res) => {
  return res.redirect(`/dashboard/projects/${req.params.id}`);
});

app.get('/skills', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/skills');
});
app.get('/skills/add', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/skills/add');
});
app.get('/skills/:id', protectDashboard, (req, res) => {
  return res.redirect(`/dashboard/skills/${req.params.id}`);
});

app.get('/timelines', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/timelines');
});
app.get('/timeline', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/timelines');
});
app.get('/timelines/add', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/timelines/add');
});
app.get('/timelines/:id', protectDashboard, (req, res) => {
  return res.redirect(`/dashboard/timelines/${req.params.id}`);
});

app.get('/socials', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/socials');
});
app.get('/socials/add', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/socials/add');
});
app.get('/socials/:id', protectDashboard, (req, res) => {
  return res.redirect(`/dashboard/socials/${req.params.id}`);
});

app.get('/profile', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/profile');
});

app.get('/messages', protectDashboard, (req, res) => {
  return res.redirect('/dashboard/messages');
});



app.use((req, res) => {
  const message = `Route '${req.originalUrl}' does not exist.`;

  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: message });
  }

  return res.status(404).send(message);
});

app.use((err, req, res, next) => {
  console.error(err);

  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({ error: 'Internal server error' });
  }

  return res.status(500).send('Internal server error');
});

const bootstrap = async () => {
  try {
    await connectDB();
    await transferAuthToUsers();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();
