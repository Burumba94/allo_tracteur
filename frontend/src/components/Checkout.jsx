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

    if (initialAmount) {
      // Convertir de centimes à FCFA si montant brut (ex: 8000000 => 80000)
      const adjusted = parseInt(initialAmount, 10) / 100;
      setAmount(adjusted.toString());
    }

    if (initialReservationId) {
      setReservationId(initialReservationId);
    }
  }, [searchParams]);

  const handlePayment = async () => {
    const numericAmount = parseInt(amount);

    if (!numericAmount || !reservationId) {
      setMessage('Veuillez remplir tous les champs.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage('Montant invalide.');
      return;
    }

    if (numericAmount > 3000000) {
      setMessage('Montant max autorisé : 3 000 000 FCFA.');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        //credentials: 'include', 
        body: JSON.stringify({
          amount: numericAmount,
          reservationId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        setMessage(data.error || 'Erreur lors du paiement.');
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
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
          Paiement Mobile Money
        </h2>

        <input
          className="border border-green-300 p-2 w-full rounded mb-3"
          type="number"
          placeholder="Montant en FCFA"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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

        {message && (
          <p className="mt-4 text-red-500 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}