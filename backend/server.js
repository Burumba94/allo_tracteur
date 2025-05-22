// server.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sharetribeIntegrationSdk from 'sharetribe-flex-integration-sdk';
import paymentRouter from './routes/payment.js'; // import du routeur paiement
import listingsRouter from './routes/listings.js'; // IMPORT du routeur listings

const app = express();
const port = process.env.PORT || 5000;

// Création de l'instance SDK Sharetribe
const sdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
  tokenStore: sharetribeIntegrationSdk.tokenStore.memoryStore(),
});

// Middlewares
app.use(cors());
app.use(express.json());

// Route d'accueil simple
app.get('/', (req, res) => {
  res.send('✅ Backend Allô Tracteur en ligne sur Render !');
});

// Utilisation du routeur listings
app.use(listingsRouter);
app.use('/api/payment', paymentRouter);

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
