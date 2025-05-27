import express from 'express';
import sdkPkg from 'sharetribe-flex-integration-sdk';

const { createInstance } = sdkPkg;
const router = express.Router();

const clientId = process.env.FLEX_INTEGRATION_CLIENT_ID;
const clientSecret = process.env.FLEX_INTEGRATION_CLIENT_SECRET;
const baseUrl = process.env.FLEX_API_BASE_URL;

if (!clientId || !clientSecret || !baseUrl) {
  throw new Error('Les variables d\'environnement nécessaires sont manquantes.');
}

const sdk = createInstance({
  clientId,
  clientSecret,
  baseUrl,
});

// 🔄 Route pour déclencher une transition Flex (appelée depuis l’IPN)
router.post('/api/flex/transition', async (req, res) => {
  const { transactionId, transition } = req.body;

  if (!transactionId || !transition) {
    return res.status(400).json({ error: 'transactionId et transition sont requis.' });
  }

  try {
    const response = await sdk.transactions.transition({
      id: transactionId,
      transition: transition,
      params: {},
    });

    res.status(200).json({ message: 'Transition effectuée avec succès', result: response.data });
  } catch (error) {
    console.error('❌ Erreur transition Flex :', error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur lors de la transition Flex', detail: error.response?.data });
  }
});

// Exemple route listing (inchangée)
router.get('/api/listings/query', async (req, res) => {
  try {
    const response = await sdk.listings.query({ perPage: 5 });
    if (response.data?.data) {
      res.json(response.data.data);
    } else {
      res.status(404).json({ error: 'Aucune annonce trouvée' });
    }
  } catch (error) {
    console.error('Erreur API Flex:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Erreur interne du serveur',
    });
  }
});

export default router;
