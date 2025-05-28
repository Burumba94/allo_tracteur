import express from 'express';
import paydunya from 'paydunya';

const router = express.Router();

// Configuration PayDunya
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
  try {
    const { amount, reservationId } = req.body;

    // Validation simple du montant et réservation
    const unitPrice = parseInt(amount, 10);

    if (!unitPrice || isNaN(unitPrice) || unitPrice <= 0) {
      return res.status(400).json({ error: 'Montant invalide.' });
    }
    if (!reservationId) {
      return res.status(400).json({ error: 'ID réservation manquant.' });
    }

    // Limite du montant si besoin (exemple: max 3 000 000 FCFA)
    if (unitPrice > 3000000) {
      return res.status(400).json({ error: 'Montant trop élevé (max 3 000 000 FCFA).' });
    }

    // Création facture PayDunya
    const invoice = new paydunya.CheckoutInvoice(setup, store);

    invoice.addItem('Réservation tracteur', 1, unitPrice, unitPrice);
    invoice.totalAmount = unitPrice;
    invoice.description = `Réservation ID ${reservationId}`;
    invoice.customData = { reservationId };

    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL;
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    // Création invoice PayDunya
    const success = await invoice.create();

    // Debug réponse PayDunya (log côté serveur)
    console.log('PayDunya response:', invoice.response);
    console.log('PayDunya response text:', invoice.response_text);

    if (success) {
      // On retourne l'URL de redirection vers la page de paiement
      return res.status(200).json({ redirect_url: invoice.url });
    } else {
      return res.status(400).json({
        error: invoice.response_text || 'Erreur lors de la création de la facture PayDunya.',
        response: invoice.response || null,
      });
    }
  } catch (error) {
    console.error('Erreur /api/payment/initiate:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l\'initiation du paiement.' });
  }
});

export default router;
