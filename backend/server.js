// server.js mis à jour avec gestion CORS autorisant Vercel + Localhost
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sharetribeIntegrationSdk from 'sharetribe-flex-integration-sdk';
import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';

const app = express();
const port = process.env.PORT || 5000;

// Création de l'instance SDK Sharetribe
const sdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
  tokenStore: sharetribeIntegrationSdk.tokenStore.memoryStore(),
});

// Middleware CORS sécurisé pour autoriser uniquement Vercel et Localhost
const allowedOrigins = [
  'http://localhost:5173',
  'https://allo-tracteur.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS non autorisé'));
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Route d'accueil simple
app.get('/', (req, res) => {
  res.send('✅ Backend Allô Tracteur en ligne sur Render !');
});

// Routes principales
app.use('/api/listings', listingsRouter);
app.use('/api/payment', paymentRouter);

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});

