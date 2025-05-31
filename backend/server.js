// server.js
import express from 'express';
import cors from 'cors';
import paymentRouter from './routes/payment.js';
import listingsRouter from './routes/listings.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://allo-tracteur.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use('/api/payment', paymentRouter);
app.use('/api/listings', listingsRouter);

app.get('/', (req, res) => res.send('API Allo Tracteur opérationnelle'));

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
