import express from 'express';
import paydunya from 'paydunya';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

const euroToCfa = (euroAmount) => Math.round(euroAmount * 655.957); // Taux officiel fixe

const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: process.env.PAYDUNYA_MODE || 'test',
});

const store = new paydunya.Store({
  name: 'Allô Tracteur',
  tagline: 'Location de matériel agricole',
  phoneNumber: '221781284497',
  postalAddress: 'Dakar, Sénégal',
  returnURL: process.env.PAYDUNYA_RETURN_URL,
  cancelURL: process.env.PAYDUNYA_CANCEL_URL,
});

// INITIATE PAIEMENT
router.post('/initiate', async (req, res) => {
  const { amount, reservationId } = req.body;

  try {
    if (!amount || !reservationId || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Montant ou ID réservation invalide' });
    }

    const euroAmount = amount / 100; // ← amount vient de Sharetribe en centimes EUR
    const cfaAmount = euroToCfa(euroAmount); // ← conversion propre

    if (cfaAmount > 3000000) {
      return res.status(400).json({ error: 'Montant trop élevé. Maximum autorisé : 3 000 000 FCFA.' });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);
    invoice.addItem('Réservation tracteur', 1, cfaAmount, cfaAmount);
    invoice.totalAmount = cfaAmount;
    invoice.description = `Réservation ID ${reservationId}`;
    invoice.customData = { reservationId };

    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL;
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    const success = await invoice.create();

    if (success) {
      return res.status(200).json({ redirect_url: invoice.url });
    } else {
      console.error('❌ Échec création facture PayDunya :', invoice.response, invoice.response_text);
      return res.status(400).json({
        error: invoice.response_text || 'Erreur lors de la création de la facture.',
        response: invoice.response || null,
      });
    }
  } catch (error) {
    console.error('🔥 Exception /initiate PayDunya:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

export default router;
