import Checkout from './components/Checkout';
import ListingList from './components/ListingList';
import PaymentSuccess from './components/PaymentSuccess';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6">
      <header className="w-full max-w-4xl px-4 mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">Système de paiement Allô tracteur</h1>
      </header>
      <main className="w-full max-w-4xl px-4">
        <ListingList />
        <Checkout />
        <PaymentSuccess />
      </main>
    </div>
  );
}

export default App;
