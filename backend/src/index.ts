import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import studentRoutes from './routes/studentRoutes';
import observationRoutes from './routes/observationRoutes';
import ragRoutes from './routes/ragRoutes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/rag', ragRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EduTrack Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Triggering restart for nodemon.json
