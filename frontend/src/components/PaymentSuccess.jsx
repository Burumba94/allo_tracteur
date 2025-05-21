import { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
    const [ searchParams ] = useSearchParams();
    const [ status, setStatus ] = useState('pending');

    const reservationId = searchParams.get('reservationId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        const confirmReservation = async () => {
            try {
                const response = await fetch('https://allo-tracteur.onrender.com/api/payment/success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reservationId })
                });

                if (!response.ok) throw new Error();
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        };
        if (reservationId) confirmReservation();
    }, [reservationId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200">
            <div className="bg-white shadow-md rounded-xl p-6 max-w-md w-full text-center">
                {status === 'pending' && <p className="text-gray-500">Confirmation en cours...</p>}
                {status === 'success' && (
                    <>
                       <h2 className="text-2xl font-bold text-green-600 mb-4"> Paiement réussi !</h2>
                       <p className="mb-2">Montant : <strong>{amount / 100} F CFA </strong></p>
                       <p className="mb-4"> Votre réservation a bien été confirmée </p>
                       <a href="https://allo-tracteur-test.sharetribe.com" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"> Retour aux annonces</a>
                    </>
                )}
                {status === 'error' && (
                    <>
                      <h2 className="text-2xl font-bold text-red-600 mb-4"> Erreur de confirmation </h2>
                      <p className="mb-4"> Une erreur est survenue. Veuillez contacter le support. </p>
                    </>
                )}
            </div>
        </div>
    );
}