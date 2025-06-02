import React, { useEffect, useState } from 'react';


const ListingList = () => {
  const [listings, setListings] = useState([]);
  const [included, setIncluded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${process.env.API_URL/api/listings/query}`);
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data = await response.json();
        setListings(data.data.data || []);
        setIncluded(data.data.included || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const getImageUrl = (listing) => {
    const imageRef = listing?.relationships?.images?.data?.[0];
    if (!imageRef) return null;

    const image = included.find(
      (img) =>
        img.type === 'image' &&
        (img.id?.uuid === imageRef.id?.uuid || img.id === imageRef.id)
    );

    return image?.attributes?.variants?.default?.url || null;
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">Erreur : {error}</p>;

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-30 z-0"
        style={{ backgroundImage: "url('/bg-tract.jpg')" }}
      ></div>

      <div className="relative z-10 p-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-900">
          Nos Tracteurs Disponibles
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const { id, attributes } = listing;
            const imageUrl = getImageUrl(listing) || 'https://via.placeholder.com/300x200?text=Image+non+disponible';
            const amount = attributes.price?.amount || 0;

            return (
              <div key={id.uuid} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={imageUrl}
                  alt={attributes.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{attributes.title}</h2>
                  <p className="text-gray-600 mb-1">{attributes.description}</p>
                  <p className="text-green-600 font-semibold mb-3">{amount / 100} F CFA</p>
                  <div className="flex justify-between">
                    <a
                      href={`https://allotracteurcom-6v0zbd.mysharetribe-test.com/l/${attributes.slug}/${id.uuid}`}
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
    </div>
  );
};

export default ListingList;
