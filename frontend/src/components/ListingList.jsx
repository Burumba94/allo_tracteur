// ✅ ListingList.jsx stylisé et fonctionnel avec lien vers tunnel de paiement externe
import React, { useEffect, useState } from 'react';

const ListingList = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('https://allo-tracteur.onrender.com/api/listings');

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        setListings(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement des annonces...</p>;
  if (error) return <p className="text-center text-red-600">Erreur : {error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Nos Tracteurs Disponibles</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {listings.map((listing) => {
          const { id, attributes, images } = listing;
          const imageUrl = images?.length ? images[0].attributes.variants.default.url : 'https://via.placeholder.com/300x200?text=Image+Non+disponible';
          const amount = attributes.price?.amount || 0;

          return (
            <div key={id.uuid} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img src={imageUrl} alt={attributes.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{attributes.title}</h2>
                <p className="text-gray-600 mb-1">{attributes.description}</p>
                <p className="text-green-600 font-semibold mb-3">{amount / 100} F CFA</p>
                <div className="flex justify-between">
                  <a
                    href={`https://allo-tracteur-test.sharetribe.com/l/${attributes.slug}/${id.uuid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Voir l'annonce
                  </a>
                  <a
                    href={`https://allo-tracteur.vercel.app/checkout?reservationId=${id.uuid}&amount=${amount}`}
                    className="text-white bg-green-600 hover:bg-green-700 text-sm px-3 py-1 rounded"
                  >
                    Réserver
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListingList;
