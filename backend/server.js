// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sharetribeIntegrationSdk from 'sharetribe-flex-integration-sdk';

const app = express();
const port = process.env.PORT || 5000;

const sdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.FLEX_INTEGRATION_CLIENT_SECRET,
  tokenStore: sharetribeIntegrationSdk.tokenStore.memoryStore(),
});

app.use(cors());
app.use(express.json());

app.get('/api/listings', async (req, res) => {
  try {
    const response = await sdk.listings.query({ perPage: 5 });
    res.json(response.data);
  } catch (error) {
    console.error('Erreur API Flex:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Erreur interne du serveur',
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
