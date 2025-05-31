// /api/proxy/listings.js

export default async function handler(req, res) {
  const BACKEND_URL = 'https://allo-tracteur-backend.vercel.app/api/listings/query';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000); // 9s

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy /listings error:', error);
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Le serveur distant a mis trop de temps à répondre.' });
    } else {
      res.status(500).json({ error: 'Erreur de proxy listings', details: error.message });
    }
  }
}
