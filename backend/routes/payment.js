import express from 'express';
import paydunya from 'paydunya';
import crypto from 'crypto';

const router = express.Router();

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

// ROUTE POUR INITIER LE PAIEMENT
router.post('/initiate', async (req, res) => {
  const { amount, reservationId } = req.body;

  try {
    // Validation des données reçues
    if (!amount || !reservationId || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Montant ou ID réservation invalide' });
    }

    // Le montant envoyé est déjà en FCFA, donc pas besoin de division par 100
    const unitPrice = parseFloat(amount);

    // Création de la facture PayDunya
    const invoice = new paydunya.CheckoutInvoice(setup, store);
    invoice.addItem('Réservation tracteur', 1, unitPrice, unitPrice); // Le montant est déjà en FCFA
    invoice.totalAmount = unitPrice;
    invoice.description = `Réservation ID ${reservationId}`;

    invoice.customData = { reservationId };

    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL; // IPN: pour confirmer le paiement
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    // Création de la facture
    const success = await invoice.create();

    if (success) {
      res.status(200).json({ redirect_url: invoice.url }); // Redirection vers le paiement
    } else {
      res.status(400).json({ error: invoice.response_text || 'Erreur création facture' });
    }
  } catch (error) {
    console.error('Erreur /initiate PayDunya:', error.response?.data || error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ROUTE IPN POUR RECEVOIR LA CONFIRMATION DE PAYDUNYA
router.post('/ipn', express.urlencoded({ extended: true }), async (req, res) => {
  const { data, hash } = req.body;

  try {
    const expectedHash = crypto
      .createHash('sha512')
      .update(process.env.PAYDUNYA_MASTER_KEY)
      .digest('hex');

    // Vérification du hash pour assurer la sécurité
    if (hash !== expectedHash) {
      return res.status(400).json({ message: 'Hash invalide' });
    }

    // Confirmer le paiement de la facture
    const invoice = new paydunya.CheckoutInvoice(setup, store);
    await invoice.confirm(data.token);

    if (invoice.status === 'completed') {
      // TODO: Mettre à jour la réservation dans ta BDD ici
      res.status(200).json({ message: 'Paiement confirmé' });
    } else {
      res.status(200).json({ message: 'Paiement non complété' });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'IPN:', error);
    res.status(500).json({ message: 'Erreur serveur IPN' });
  }
});

export default router;
