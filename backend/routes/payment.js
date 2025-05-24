import express from 'express';
import paydunya from 'paydunya';
import crypto from 'crypto';

const router = express.Router();

// Configuration PayDunya
const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: 'live', // ou 'test'
});

const store = new paydunya.Store({
  name: 'Allô Tracteur',
  tagline: 'Location de matériel agricole',
  phoneNumber: '221781284497',
  postalAddress: 'Dakar, Sénégal',
  returnURL: process.env.PAYDUNYA_RETURN_URL,
  cancelURL: process.env.PAYDUNYA_CANCEL_URL,
});

// === ROUTE POUR INITIER LE PAIEMENT ===
router.post('/initiate', async (req, res) => {
  const { amount, reservationId } = req.body;

  try {
    const numericAmount = parseFloat(amount);

    // ✅ Validation des données
    if (!reservationId || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Montant ou ID réservation invalide' });
    }

    if (numericAmount > 3000000) {
      return res.status(400).json({ error: 'Le montant ne doit pas dépasser 3 000 000 FCFA' });
    }

    // ✅ Création de la facture
    const invoice = new paydunya.CheckoutInvoice(setup, store);

    invoice.addItem('Réservation tracteur', 1, numericAmount, numericAmount);
    invoice.totalAmount = numericAmount;
    invoice.description = `Réservation ID ${reservationId}`;
    invoice.customData = { reservationId };

    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL;
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    const success = await invoice.create();

    if (success) {
      return res.status(200).json({ redirect_url: invoice.url });
    } else {
      console.error('Échec de création de facture :', invoice.response_text);
      return res.status(400).json({ error: invoice.response_text || 'Erreur création facture' });
    }

  } catch (error) {
    console.error('Erreur /initiate PayDunya:', error.response?.data || error.message || error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// === ROUTE IPN POUR CONFIRMATION DE PAYDUNYA ===
router.post('/ipn', express.urlencoded({ extended: true }), async (req, res) => {
  const { data, hash } = req.body;

  try {
    const expectedHash = crypto
      .createHash('sha512')
      .update(process.env.PAYDUNYA_MASTER_KEY)
      .digest('hex');

    if (hash !== expectedHash) {
      return res.status(400).json({ message: 'Hash invalide' });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);
    await invoice.confirm(data.token);

    if (invoice.status === 'completed') {
      // TODO: Mettre à jour la réservation dans ta base de données ici
      return res.status(200).json({ message: 'Paiement confirmé' });
    } else {
      return res.status(200).json({ message: 'Paiement non complété' });
    }

  } catch (error) {
    console.error('Erreur IPN PayDunya:', error.message || error);
    return res.status(500).json({ message: 'Erreur serveur IPN' });
  }
});

export default router;
