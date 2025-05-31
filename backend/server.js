import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

dotenv.config(); // Charge les variables d'environnement

const app = express();
const PORT = process.env.PORT || 5000;

// CORS sécurisé pour la production
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173', // domaine autorisé
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

//gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erreur serveur');
});

app.get('/', (req, res) => res.send(' API Allô Tracteur opérationnelle'));

app.listen(PORT, () => {
  console.log(` Serveur backend lancé sur http://localhost:${PORT}`);
});
