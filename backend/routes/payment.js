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

// INITIER LE PAIEMENT
router.post('/initiate', async (req, res) => {
  const { amount, reservationId } = req.body;

  console.log('📩 Données reçues :', { amount, reservationId });

  try {
    // Validation des données
    if (!amount || !reservationId || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Montant ou ID réservation invalide' });
    }

    if (amount > 3000000) {
      return res.status(400).json({ error: 'Le montant maximum autorisé est 3 000 000 FCFA.' });
    }

    const unitPrice = parseFloat(amount);

    if (isNaN(unitPrice) || typeof unitPrice !== 'number') {
      return res.status(400).json({ error: 'Montant non numérique ou invalide' });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);
    invoice.addItem('Réservation tracteur', 1, unitPrice, unitPrice);
    invoice.totalAmount = unitPrice;
    invoice.description = `Réservation ID ${reservationId}`;

    invoice.customData = { reservationId };
    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL;
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    const success = await invoice.create();

    if (success) {
      console.log(' Facture créée avec succès. Redirection vers :', invoice.url);
      res.status(200).json({ redirect_url: invoice.url });
    } else {
      console.error(' Échec création facture PayDunya :', {
        response_code: invoice.response_code,
        response_text: invoice.response_text,
        response: invoice.response,
      });
      res.status(400).json({
        error: invoice.response_text || 'Erreur création facture',
        code: invoice.response_code,
        raw: invoice.response,
      });
    }
  } catch (error) {
    console.error(' Erreur /initiate PayDunya :', error.response?.data || error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// IPN : Confirmation de paiement par PayDunya
router.post('/ipn', express.urlencoded({ extended: true }), async (req, res) => {
  const { data, hash } = req.body;

  try {
    const expectedHash = crypto
      .createHash('sha512')
      .update(process.env.PAYDUNYA_MASTER_KEY)
      .digest('hex');

    if (hash !== expectedHash) {
      console.warn(' IPN reçu avec hash invalide');
      return res.status(400).json({ message: 'Hash invalide' });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);
    await invoice.confirm(data.token);

    if (invoice.status === 'completed') {
      // Mettre à jour ta BDD ici si besoin
      console.log(' Paiement confirmé pour réservation ID :', invoice.customData?.reservationId);
      res.status(200).json({ message: 'Paiement confirmé' });
    } else {
      console.warn(' Paiement non complété pour :', invoice.customData?.reservationId);
      res.status(200).json({ message: 'Paiement non complété' });
    }
  } catch (error) {
    console.error(' Erreur IPN PayDunya :', error);
    res.status(500).json({ message: 'Erreur serveur IPN' });
  }
});

export default router;
