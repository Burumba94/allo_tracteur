import express from 'express';
import paydunya from 'paydunya';

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
    const numericAmount = parseInt(amount);

    if (!numericAmount || !reservationId || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Montant ou ID réservation invalide' });
    }

    if (numericAmount > 3000000) {
      return res.status(400).json({ error: 'Montant trop élevé. Maximum autorisé : 3 000 000 FCFA.' });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);

    invoice.addItem('Location Tracteur', 1, numericAmount, numericAmount);
    invoice.totalAmount = numericAmount;
    invoice.description = `Réservation tracteur - ID ${reservationId}`;
    invoice.customData = { reservationId };
    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL;
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    invoice.taxes = [
      {
        name: 'TVA',
        amount: Math.round(numericAmount * 0.18),
        included: false,
      },
    ];

    invoice.metadata = {
      client_note: 'Merci pour votre réservation chez Allô Tracteur',
    };

    const success = await invoice.create();

    if (success) {
      return res.status(200).json({ redirect_url: invoice.url });
    } else {
      return res.status(400).json({
        error: invoice.response_text || 'Erreur création facture.',
        response: invoice.response || null,
      });
    }
  } catch (error) {
    console.error('Erreur /initiate:', error);
    return res.status(500).json({ error: 'Erreur serveur paiement.' });
  }
});

export default router;
