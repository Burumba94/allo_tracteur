// routes/flex.js
import express from 'express';
import sdkPkg from 'sharetribe-flex-integration-sdk';

const { createInstance, types } = sdkPkg;
const router = express.Router();

// ⚙️ Chargement des variables d'environnement
const clientId = process.env.FLEX_INTEGRATION_CLIENT_ID;
const clientSecret = process.env.FLEX_INTEGRATION_CLIENT_SECRET;
const baseUrl = process.env.FLEX_API_BASE_URL;

if (!clientId || !clientSecret || !baseUrl) {
  throw new Error("Les variables d'environnement nécessaires sont manquantes.");
}

// ✅ Initialisation SDK Sharetribe
const sdk = createInstance({
  clientId,
  clientSecret,
  baseUrl,
});

/**
 * 🔄 Route : transition manuelle (ex: après IPN PayDunya)
 * POST /api/flex/transition
 */
router.post('/transition', async (req, res) => {
  const { transactionId, transition } = req.body;

  if (!transactionId || !transition) {
    return res.status(400).json({ error: 'transactionId et transition sont requis.' });
  }

  try {
    const response = await sdk.transactions.transition({
      id: types.uuid(transactionId),
      transition,
      params: {},
    });

    res.status(200).json({
      message: 'Transition effectuée avec succès',
      result: response.data,
    });
  } catch (error) {
    console.error('❌ Erreur transition Flex :', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de la transition Flex',
      detail: error.response?.data,
    });
  }
});

/**
 * 🎯 Route : création d’une réservation initiale (sans Stripe)
 * POST /api/flex/initiate
 */
router.post('/initiate', async (req, res) => {
  const { listingId, start, end, customerId } = req.body;

  if (!listingId || !start || !end || !customerId) {
    return res.status(400).json({ error: 'Paramètres requis manquants.' });
  }

  try {
    const response = await sdk.transactions.initiate({
      processAlias: 'default-booking/default',
      transition: 'transition/request-payment',
      params: {
        listingId: types.uuid(listingId),
        customerId: types.uuid(customerId),
        bookingStart: new Date(start),
        bookingEnd: new Date(end),
        protectedData: {
          paymentStatus: 'pending',
          paymentMethod: 'mobile_money',
        },
      },
    });

    res.status(200).json({
      message: 'Transaction créée avec succès',
      transaction: response.data,
    });
  } catch (error) {
    console.error('❌ Erreur création transaction Flex:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de la création de la transaction',
      detail: error.response?.data,
    });
  }
});

/**
 * 📦 Route : récupération de listings Flex
 * GET /api/flex/listings/query
 */
router.get('/listings/query', async (req, res) => {
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
