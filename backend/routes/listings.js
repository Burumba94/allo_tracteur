// backend/routes/listings.js
import express from 'express';
import sdk from '../utils/sdk';

const router = express.Router();

router.get('/api/listings/query', async (req, res) => {
  try {
    const response = await sdk.listings.query({ perPage: 5, include: ['images'] });
    res.json({
      data: response.data,
      included: response.included
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des listings :", error.response?.data || error);
    res.status(500).json({ error: 'Erreur lors de la récupération des listings' });
  }
});

export default router;
