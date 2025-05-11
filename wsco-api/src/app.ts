import express from 'express';
import router from '@/routes/handler';
import coockieParser from 'cookie-parser';
import cors from 'cors';
import logger from './services/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(coockieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
