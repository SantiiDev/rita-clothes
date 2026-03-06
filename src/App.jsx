import { useState, useEffect } from 'react';
import Splash from './components/Splash';
import Home from './components/Home';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';

function App() {
  // Inicializar desde localStorage
  const [userName, setUserName] = useState(() => localStorage.getItem('rita_userName') || '');
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rita_cartItems')) || []; }
    catch { return []; }
  });
  const [currentScreen, setCurrentScreen] = useState(() =>
    localStorage.getItem('rita_userName') ? 'home' : 'splash'
  );
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Persistir userName
  useEffect(() => {
    if (userName) localStorage.setItem('rita_userName', userName);
  }, [userName]);

  // Persistir carrito
  useEffect(() => {
    localStorage.setItem('rita_cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const navigate = (screen, product = null) => {
    if (product) setSelectedProduct(product);
    setCurrentScreen(screen);
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems(prev => {
      if (newQuantity <= 0) return prev.filter(item => item.id !== productId);
      return prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  return (
    <div className="relative min-h-screen bg-background text-textMain font-heading selection:bg-black selection:text-white w-full mx-auto">
      {currentScreen === 'splash' && <Splash onNavigate={() => navigate('home')} setUserName={setUserName} />}

      {currentScreen === 'home' && (
        <Home
          userName={userName}
          onNavigate={navigate}
          cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          onAddToCart={handleAddToCart}
        />
      )}

      {currentScreen === 'productDetail' && (
        <ProductDetail
          product={selectedProduct}
          onNavigate={navigate}
          onAddToCart={handleAddToCart}
          cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        />
      )}

      {currentScreen === 'cart' && (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}

export default App;
