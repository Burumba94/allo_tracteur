import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';
import flexRouter from './routes/flex.js';

const app = express();
const port = process.env.PORT || 5000;

/*Origines autorisées
const allowedOrigins = [
  '*',
  'http://localhost:5173',
  'https://allo-tracteur.vercel.app'
];

//  Configuration CORS sécurisée
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origine non autorisée : ${origin}`));
    }
  },
  //credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Appliquer CORS avant tout
app.use(cors(corsOptions)); */

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
  next();
});

//  Body parser
app.use(express.json());

// API routes
app.get('/', (req, res) => {
  res.send(' Backend Allô Tracteur est en ligne !');
});

app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

// Serveur lancé
app.listen(port, () => {
  console.log(` Serveur lancé sur http://localhost:${port}`);
});
