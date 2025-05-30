// server.js mis à jour avec flexRouter
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sharetribeIntegrationSdk from 'sharetribe-flex-integration-sdk';

import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js'; // ✅ Import du routeur Flex

const app = express();
const port = process.env.PORT || 5000;

// Définition des origines autorisées
const allowedOrigins = [
  'http://localhost:5173',
  'https://allo-tracteur.vercel.app'
];

// Configuration CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Route d’accueil simple
app.get('/', (req, res) => {
  res.send('✅ Backend Allô Tracteur est en ligne !');
});

// Routes API
app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter); // ✅ Montée du routeur Flex avec préfixe
// Attention : routes dans flex.js doivent être sans préfixe (/transition etc.)

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
