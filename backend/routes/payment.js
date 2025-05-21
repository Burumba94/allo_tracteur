// backend/routes/payment.js
import express from 'express';
import paydunya from 'paydunya';
import crypto from 'crypto';

const router = express.Router();

const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: 'test', // ou 'live' pour la production
});

const store = new paydunya.Store({
  name: 'Allô Tracteur',
  tagline: 'Location de matériel agricole',
  phoneNumber: '221781284497',
  postalAddress: 'Dakar, Sénégal',
  returnURL: process.env.PAYDUNYA_RETURN_URL,
  cancelURL: process.env.PAYDUNYA_CANCEL_URL,
});

router.post('/ipn', express.urlencoded({ extended: true }), async (req, res) => {
  const { data, hash } = req.body;

  try {
    // Vérification du hash pour s'assurer que la notification provient de PayDunya
    const expectedHash = crypto
      .createHash('sha512')
      .update(process.env.PAYDUNYA_MASTER_KEY)
      .digest('hex');

    if (hash !== expectedHash) {
      return res.status(400).json({ message: 'Hash invalide' });
    }

    // Traitement de la notification
    const invoice = new paydunya.CheckoutInvoice(setup, store);
    await invoice.confirm(data.token);

    if (invoice.status === 'completed') {
      // Mettre à jour le statut de la réservation dans ta base de données
      // Exemple : await Reservation.update({ status: 'paid' }, { where: { id: data.reservationId } });

      res.status(200).json({ message: 'Paiement confirmé' });
    } else {
      res.status(200).json({ message: 'Paiement non complété' });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'IPN:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

export default router;
