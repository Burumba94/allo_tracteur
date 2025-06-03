// routes/payment.js
import express from 'express';
import paydunya from 'paydunya';
//import axios from 'axios';

const router = express.Router();

//Configuration PayDunya
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
});

// Route POST pour initier un paiement
router.post('/initiate', async (req, res) => {
  console.log(' Requête paiement reçue :', req.body);
  const { amount, reservationId } = req.body;
  
/* const totalAmount = parseInt(amount, 10);
  
  if (totalAmount || isNaN(totalAmount) || totalAmount <= 0 || totalAmount > 3000000) {
    return res.status(400).JSON({ error: 'Montant invalide ou trop élevé' });
  }
  if (!reservationId) {
    return res.status(400).json({ error: 'ID reservation manquant '});
  }

  const invoicePayload = {
    invoice: {
      items: [
        {
          name: 'Location de tracteur',
          quantity: 1,
          unit_price: totalAmount,
          total_price: totalAmount,
          description: `Réservation Sharetribe ID ${reservationId}`,
        },
      ],
      totalAmount: totalAmount,
      description: `Réservation Allô Tracteur #${reservationId}`,
      return_url: process.env.PAYDUNYA_RETURN_URL,
      cancel_url: process.env.PAYDUNYA_CANCEL_URL,
      callback_url: process.env.PAYDUNYA_IPN_URL,
      customer: {
        email: 'client@example.com',
        fullname: 'Client Allô tracteur',
        phone: '771234567'
      }
    },
    store: {
      name: 'ALLô Tracteur',
      tagline: 'Location de matériel agricole',
      phone: '221781244497',
      postal_address: 'Dakar, Sénégal'
    } 
  };

  try {
    const response = await axios.post(
      'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create',
      invoicePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
          'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
          'PAYDUNYA-PUBLIC-KEY': process.env.PAYDUNYA_PUBLIC_KEY,
          'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
        },
      }
    );

    if (response.data.response_code === '00') {
      console.log('Facture PAYDUNYA créée: ', response.data.invoice_url);
      return res.status(200).json({ redirect_url: response.data.invoice_url });
    } else {
      console.error('Erreur Paydunya:', response.data);
      return res.status(400).json({ error: response.data.response_text || 'Erreur création de facture.' });
    }
  } catch (err) {
    console.error('Exception Paydunya:', err);
    return res.status(500).json({ error: 'Erreur lors de la création de facture Paydunya.' });
  }
});

export default router; */
  try {
    const unitPrice = parseInt(amount);

    if (!unitPrice || !reservationId || isNaN(unitPrice) || unitPrice <= 0) {
      return res.status(400).json({ error: 'Montant ou ID réservation invalide' });
    }

    if (unitPrice > 3000000) {
      return res.status(400).json({ error: 'Montant trop élevé. Maximum autorisé : 3 000 000 FCFA.' });
    }

    const invoice = new paydunya.CheckoutInvoice(setup, store);

    invoice.addItem('Location de tracteur', 1, unitPrice, unitPrice, {
      description: `Réservation tracteur ID ${reservationId}`,
    });

    invoice.totalAmount = unitPrice;

    invoice.addCustomData("reservationId", reservationId);
    invoice.addCustomData("clientSource", "AlloTracteurApp");


    invoice.addTax('TVA (18%)', 6300);
    invoice.addTax('Livraison', 1000);


    invoice.callbackURL = process.env.PAYDUNYA_IPN_URL;
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    const success = await invoice.create();

    if (success) {
      console.log(' Facture PayDunya créée :', invoice.url);
      return res.status(200).json({ redirect_url: invoice.url });
    } else {
      console.error(' Erreur PayDunya:', invoice.response_text);
      return res.status(400).json({
        error: invoice.response_text || 'Erreur création facture.',
        response: invoice.response || null,
      });
    }
  } catch (error) {
    console.error(' Exception /initiate:', error);
    return res.status(500).json({ error: 'Erreur serveur paiement.' });
  }
});

export default router; 
