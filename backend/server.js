import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://allo-tracteur.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Middleware global pour OPTIONS compatible Express 5
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', corsOptions.origin);
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204); // No Content
  }
  next();
});

// 🔌 Routes
app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend lancé sur http://localhost:${PORT}`);
});
