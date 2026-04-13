import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';


import connectDB from './configs/connectDB.js';
import authApiRouter from './routes/auth.api.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
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
  res.status(200).json({ "message": "Welcome to the Portfolio API!" });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use('/api/auth', authApiRouter);
app.use('/dashboard', dashboardRouter);



app.get('/home', (req, res) => {
  res.render('home', {
    pageTitle: 'Home', name: "Sanket Singh Sameer", role: "Full Stack Developer", about: "I build clear, practical web experiences with strong foundations in backend engineering and modern frontend tooling.", email: "mail@xsam.in", projects: [
      { title: 'Portfolio API', description: 'Express-based API powering dynamic portfolio content and contact flows.', tech: ['Node.js', 'Express', 'MongoDB'], link: '#' },
      { title: 'Realtime Dashboard', description: 'Lightweight metrics dashboard with real-time updates and auth support.', tech: ['Socket.IO', 'EJS', 'Chart.js'], link: '#' },
      { title: 'Ecommerce Backend', description: 'Clean service-layer architecture for products, orders, and payments.', tech: ['REST', 'JWT', 'Stripe'], link: '#' }
    ], skills: ['JavaScript', 'Node.js', 'Express', 'EJS', 'MongoDB', 'REST APIs', 'Git', 'GraphQL', 'Docker', 'AWS']
  });
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

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();
