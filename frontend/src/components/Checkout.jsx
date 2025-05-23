import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Checkout() {
  const [amount, setAmount] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initialAmount = searchParams.get('amount');
    const initialReservationId = searchParams.get('reservationId');

    if (initialAmount && !amount) setAmount(initialAmount);
    if (initialReservationId && !reservationId) setReservationId(initialReservationId);

    console.log('Montant récupéré depuis l’URL :', initialAmount);
    console.log('ID Réservation depuis l’URL :', initialReservationId);
  }, []); // Ne s’exécute qu’une seule fois au chargement

  const handlePayment = async () => {
    if (!amount || !reservationId) {
      setMessage('Veuillez remplir tous les champs.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage('Le montant est invalide.');
      return;
    }

    if (numericAmount > 3000000) {
      setMessage('Le montant maximum autorisé est de 3 000 000 FCFA.');
      return;
    }

    try {
      console.log('Montant envoyé à l’API :', numericAmount);
      console.log('ReservationId envoyé à l’API :', reservationId);

      const res = await fetch('https://allo-tracteur.onrender.com/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          reservationId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        setMessage(data.error || 'Erreur inconnue lors du paiement.');
      }
    } catch (error) {
      console.error('Erreur fetch:', error);
      setMessage('Erreur de connexion au serveur.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-30 z-0"
        style={{ backgroundImage: "url('/bg-tracteur.jpg')" }}
      ></div>

      <div className="relative z-10 bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Paiement Mobile Money</h2>

        <input
          className="border border-green-300 p-2 w-full rounded mb-3"
          type="number"
          placeholder="Montant en FCFA"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max="3000000"
        />

        <input
          className="border border-green-300 p-2 w-full rounded mb-4"
          type="text"
          placeholder="ID Réservation Sharetribe"
          value={reservationId}
          onChange={(e) => setReservationId(e.target.value)}
        />

        <button
          onClick={handlePayment}
          className="bg-green-600 w-full py-2 text-white rounded hover:bg-green-700 transition"
        >
          Payer maintenant
        </button>

        {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
      </div>
    </div>
  );
}
