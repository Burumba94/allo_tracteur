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

// Liste des origines autorisées
const allowedOrigins = [
  'http://localhost:5173', // Frontend en développement
  'https://allo-tracteur.vercel.app', // Frontend en production
  'https://allo-tracteur.vercel.app/checkout',
  'https://allo-tracteur.vercel.app/checkout?reservationId=6813a759-fbce-4bad-a6f4-c05900f341ef&amount=8000000'
];

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Appliquer le middleware CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware pour analyser les corps de requêtes JSON
app.use(express.json());

// Route principale
app.get('/', (req, res) => {
  res.send('✅ Backend Allô Tracteur est en ligne !');
});

// Routes
app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné !');
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});


