import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseService } from './services/database.js';
import entityRoutes from './routes/entities.js';
import taxReturnRoutes from './routes/taxReturns.js';
import summaryRoutes from './routes/summary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

await DatabaseService.initialize();

app.use('/api/entities', entityRoutes);
app.use('/api/tax-returns', taxReturnRoutes);
app.use('/api', summaryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Tax Analyzer Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});