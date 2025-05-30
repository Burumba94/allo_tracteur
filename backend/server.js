import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

const app = express();
const port = process.env.PORT || 5000;

// 🌍 Origines autorisées
const allowedOrigins = [
  'http://localhost:5173', // pour le développement local
  'https://allo-tracteur.vercel.app' // ton frontend en production
];

// 🎯 Configuration sécurisée de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les outils de test sans origine (Postman par ex.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`⛔ Origine non autorisée : ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // nécessaire si tu utilises des cookies ou des sessions
  optionsSuccessStatus: 204
};

// ✅ Middleware CORS doit être au tout début
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pour les requêtes OPTIONS préflight

// 🔍 Middleware pour parser les JSON
app.use(express.json());

// 🌐 Routes
app.get('/', (req, res) => {
  res.send('✅ Backend Allô Tracteur est en ligne !');
});

app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

// 🚀 Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});

