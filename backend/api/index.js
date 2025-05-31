// /api/index.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import paymentRouter from '../routes/payment.js';
import listingsRouter from '../routes/listings.js';
import flexRouter from '../routes/flex.js';

const app = express();

// 🌍 Origines autorisées
const allowedOrigins = [
  'http://localhost:5173',
  'https://allo-tracteur.vercel.app'
];

// 🛡️ Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origine non autorisée : ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// 🧠 Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// 🔗 Routes
app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/flex', flexRouter);

app.get('/api', (req, res) => {
  res.send('✅ API Allô Tracteur is up on Vercel!');
});

// ⛴️ Exporter le handler pour Vercel
export default serverless(app);
