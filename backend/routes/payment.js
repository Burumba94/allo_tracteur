// routes/payment.js
import express from 'express';
//import paydunya from 'paydunya';
import axios from 'axios';

const router = express.Router();

/*Configuration PayDunya
const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: "test"
}); 

const store = new paydunya.Store({
  name: 'Allô Tracteur',
  tagline: 'Location de matériel agricole',
  phoneNumber: '221781284497',
  postalAddress: 'Dakar, Sénégal',
  returnURL: process.env.PAYDUNYA_RETURN_URL,
  cancelURL: process.env.PAYDUNYA_CANCEL_URL,
}); */

// Route POST pour initier un paiement
router.post('/initiate', async (req, res) => {
  console.log(' Requête paiement reçue :', req.body);
  const { amount, reservationId } = req.body;
  
  const totalAmount = parseInt(amount, 10);
  
  if (totalAmount || isNaN(totalAmount) || totalAmount <= 0 || totalAmount > 3000000) {
    return res.status(400).JSON({ error: 'Montant invalide ou trop élevé' });
  }
  if (!reservationId) {
    return res.status(400).json({ error: 'ID reservation manquant '});
  }

  const payload = {
    item_name: 'Location de tracteur',
    item_price: totalAmount,
    ref_command: reservation_id,
    command_name: `Réservation tracteur #${reservationId}`,
    currency: 'XOF',
    success_url: process.env.PAYTECH_SUCCESS_URL,
    cancel_url: process.env.PAYTECH_CANCEL_URL,
    ipn_url: process.env.PAYTECH_IPN_URL,
    customer: {
      name: 'Client Allô Tracteur',
      email: 'client@allotracteur.sn',
      phone_number: '770000000',
    }
  };

  try {
    const response = await axios.post(
      'https://paytech.sn/api/payment/request-payment',
      payload,
      {
        headers: {
          API_KEY: process.env.PAYTECH_API_KEY,
          API_SECRET: process.env.PAYTECH_API_SECRET
        },
      }
    );

    if (response.data && response.data.redirect_url) {
      console.log('Redirection PayTech: ', response.data.redirect_url);
      return res.status(200).json({ redirect_url: response.data.redirect_url });
    } else {
      console.error('Erreur PayTech:', response.data);
      return res.status(400).json({ error: response.data.response_text || 'Erreur création de facture.' });
    }
  } catch (err) {
    console.error('Erreur serveur PayTech: ', err.response?.data || err.message);
    return res.status(500).json({ error: 'Erreur lors de la création du paiement Paytech.' });
  }
});

export default router; 
