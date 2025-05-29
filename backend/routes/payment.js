// ✅ Fichier backend payment.js corrigé pour PayDunya
import express from 'express';
import paydunya from 'paydunya';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

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

router.post('/initiate', async (req, res) => {
  const { amount, reservationId } = req.body;

  try {
    const unitPrice = parseInt(amount);

    if (!unitPrice || !reservationId || isNaN(unitPrice) || unitPrice <= 0) {
      return res.status(400).json({ error: 'Montant ou ID réservation invalide' });
    }

    if (unitPrice > 3000000) {
      return res.status(400).json({ error: 'Montant trop élevé. Maximum autorisé : 3 000 000 FCFA.' });
    }

    console.log('💸 Création facture PayDunya avec montant :', unitPrice);

    const invoice = new paydunya.CheckoutInvoice(setup, store);

    invoice.addItem('Location de tracteur', 1, unitPrice, unitPrice, {
      description: `Réservation tracteur ID ${reservationId}`,
    });

    invoice.totalAmount = unitPrice;

    invoice.setCustomData({
      reservationId: reservationId,
      clientSource: 'AlloTracteurApp',
    });

    invoice.setTaxes({
      VAT: 0,
      SERVICE: 0,
    });

    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL;
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    const success = await invoice.create();

    if (success) {
      console.log('✅ Facture PayDunya créée :', invoice.token);
      return res.status(200).json({ redirect_url: invoice.url });
    } else {
      console.error('❌ PayDunya error:', invoice.response_text);
      return res.status(400).json({
        error: invoice.response_text || 'Erreur création facture.',
        response: invoice.response || null,
      });
    }
  } catch (error) {
    console.error('🔥 Exception /initiate:', error);
    return res.status(500).json({ error: 'Erreur serveur paiement.' });
  }
});

export default router;

