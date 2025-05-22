router.post('/initiate', async (req, res) => {
  const { amount, reservationId } = req.body;

  try {
    const invoice = new paydunya.CheckoutInvoice(setup, store);
    invoice.addItem('Réservation tracteur', 1, parseInt(amount), parseInt(amount));
    invoice.description = `Réservation ID ${reservationId}`;
    invoice.totalAmount = parseInt(amount);
    invoice.returnURL = process.env.PAYDUNYA_RETURN_URL;
    invoice.cancelURL = process.env.PAYDUNYA_CANCEL_URL;

    const response = await invoice.create();
    if (response.response_code === '00') {
      res.json({ redirect_url: response.response_text });
    } else {
      res.status(400).json({ error: 'Erreur lors de la création de la facture' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initiation du paiement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});
