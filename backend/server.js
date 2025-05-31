import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ CORS en production
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = ['https://allo-tracteur.vercel.app', 'http://localhost:5173'];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 🟢 CORS DOIT être en haut
app.use(cors(corsOptions));

// ⚠️ Gérer les requêtes OPTIONS globalement
app.options('*', cors(corsOptions));

app.use(express.json());

app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

// Page d'accueil
app.get('/', (req, res) => {
  res.send('API Allô Tracteur opérationnelle');
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.stack);
  res.status(500).send('Erreur serveur');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur http://localhost:${PORT}`);
});
