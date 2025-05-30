import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sharetribeIntegrationSdk from 'sharetribe-flex-integration-sdk';

import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

const app = express();
const port = process.env.PORT || 5000;

// 🌍 Liste des origines autorisées
const allowedOrigins = [
  'http://localhost:5173',
  'https://allo-tracteur.vercel.app'
];

// ✅ Middleware CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Middleware manuel pour gérer les requêtes OPTIONS (préflight)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Répond OK à toutes les requêtes préflight
  }

  next();
});

// 🧠 Important : body parser
app.use(express.json());

// ✅ Routes
app.get('/', (req, res) => {
  res.send('✅ Backend Allô Tracteur est en ligne !');
});

app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});

