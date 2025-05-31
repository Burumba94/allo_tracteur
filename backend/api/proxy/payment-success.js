export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const BACKEND_URL = 'https://allo-tracteur-backend.vercel.app'; // directement ici
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/payment/success`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);

  } catch (error) {
    console.error('❌ Erreur proxy /payment-success:', error);
    res.status(500).json({ error: 'Erreur proxy payment success', details: error.message });
  }
}
