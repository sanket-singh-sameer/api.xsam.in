import express from 'express';
import dotenv from 'dotenv';
import connectDB from './configs/connectDB.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).json({"message": "Welcome to the Portfolio API!"});
});

app.get('/api/health', (req, res) => {
  res.status(200).json(`{"status": "ok", "timestamp": "${new Date().toISOString()}"}`);
});


app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
