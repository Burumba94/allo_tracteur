import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Checkout from './components/Checkout';
import ListingList from './components/ListingList';
import PaymentSuccess from './components/PaymentSuccess';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6">
        <header className="w-full max-w-4xl px-4 mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800">Système de paiement Allô Tracteur</h1>
        </header>
        <main className="w-full max-w-4xl px-4">
          <Routes>
            <Route path="/" element={<ListingList />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<PaymentSuccess />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
