import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './src/config/index.js';
import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';
import playersRoutes from './routes/players.js';
import matchesRoutes from './routes/matches.js';
import standingsRoutes from './routes/standings.js';

const app = express();

app.use(cors(config.cors));
app.use(express.json());

// Health check
app.get('/api', (_req, res) => res.json({ message: 'APL Cricket API', status: 'ok', env: config.nodeEnv }));
app.get('/', (_req, res) => res.send('APL Cricket API running'));

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/teams',     teamsRoutes);
app.use('/api/players',   playersRoutes);
app.use('/api/matches',   matchesRoutes);
app.use('/api/standings', standingsRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(config.port, () => console.log(`Server running on port ${config.port} [${config.nodeEnv}]`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
