// routes/payment.js

import express from 'express';
import { PayTech } from 'paytech-node-ts-sdk';

const router = express.Router();

// Configuration du SDK PayTech
const paytech = new PayTech({
  apiKey: process.env.PAYTECH_API_KEY,
  apiSecret: process.env.PAYTECH_API_SECRET,
});

// Route POST pour initier un paiement
router.post('/initiate', async (req, res) => {
  console.log('Requête paiement reçue :', req.body);
  const { amount, reservationId } = req.body;

  const totalAmount = parseInt(amount, 10);

  if (isNaN(totalAmount) || totalAmount <= 0 || totalAmount > 3000000) {
    return res.status(400).json({ error: 'Montant invalide ou trop élevé' });
  }

  if (!reservationId) {
    return res.status(400).json({ error: 'ID réservation manquant' });
  }

  const payload = {
    item_name: 'Location de tracteur',
    item_price: totalAmount.toString(),
    ref_command: reservationId,
    command_name: `Réservation tracteur #${reservationId}`,
    currency: 'XOF',
    success_url: process.env.PAYTECH_SUCCESS_URL,
    cancel_url: process.env.PAYTECH_CANCEL_URL,
    ipn_url: process.env.PAYTECH_IPN_URL,
    env: 'test'
  };

  try {
    const response = await paytech.createPayment(payload);
    console.log('Réponse de Paytech:', response);
    if (response.redirect_url) {
      console.log('Redirection PayTech:', response.redirect_url);
      return res.status(200).json({ redirect_url: response.redirect_url });
    } else {
      console.error('Erreur PayTech:', response);
      return res.status(400).json({ error: response.response_text || 'Erreur création de facture.' });
    }
  } catch (err) {
    console.error('Erreur serveur PayTech:', err.message);
    return res.status(500).json({ error: 'Erreur lors de la création du paiement PayTech.' });
  }
});

export default router;
