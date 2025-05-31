import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

const app = express();
const port = process.env.PORT || 5000;

// 🌍 Origines autorisées
const allowedOrigins = [
  'http://localhost:5173',                // Front local
  'https://allo-tracteur.vercel.app'      // Front en prod
];

// 🔐 Configuration CORS sécurisée pour Express 5
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`⛔ Origine non autorisée : ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// ✅ Middleware CORS placé tout au début
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// 🧠 Body parser
app.use(express.json());

// 🌐 API routes
app.get('/', (req, res) => {
  res.send('✅ Backend Allô Tracteur est en ligne !');
});

app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

// 🚀 Serveur lancé
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
