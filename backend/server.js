import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS sécurisé mais fonctionnel pour Vercel et localhost
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://allo-tracteur.vercel.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Pour les requêtes OPTIONS (pré-vol) : obligatoire pour Render
app.options('*', cors(corsOptions));

// Routes API
app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

app.get('/', (req, res) => res.send('API Allô Tracteur opérationnelle'));

// Middleware global d’erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erreur serveur');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend opérationnel sur http://localhost:${PORT}`);
});
