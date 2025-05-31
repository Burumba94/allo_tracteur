// /api/proxy/payment.js

export default async function handler(req, res) {
  const BACKEND_URL = 'https://allo-tracteur-backend.vercel.app/api/payment/initiate';

  try {
    // Préparer la requête vers le backend
    const response = await fetch(BACKEND_URL, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && {
          Authorization: req.headers.authorization
        })
      },
      body: req.method === 'GET' ? null : JSON.stringify(req.body)
    });

    // Lire la réponse du backend
    const data = await response.json();

    // Répondre au frontend avec les mêmes données
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Erreur proxy:', error);
    res.status(500).json({ error: 'Erreur proxy', message: error.message });
  }
}
