import { useState, useEffect } from 'react';
import Splash from './components/Splash';
import Home from './components/Home';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AuthModal from './components/AuthModal';
import DiscountBanner from './components/DiscountBanner';

function App() {
  // Inicializar desde localStorage
  const [userName, setUserName] = useState(() => localStorage.getItem('rita_userName') || '');
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rita_cartItems')) || []; }
    catch { return []; }
  });
  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rita_authUser')) || null; }
    catch { return null; }
  });

  // Always start at splash
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Discount banner
  const [showDiscountBanner, setShowDiscountBanner] = useState(false);
  const [hasShownBannerThisSession, setHasShownBannerThisSession] = useState(false);

  const isReturningUser = !!localStorage.getItem('rita_userName');

  // Show discount banner when arriving at home (if not registered)
  useEffect(() => {
    if (currentScreen === 'home' && !authUser && !hasShownBannerThisSession) {
      setShowDiscountBanner(true);
      setHasShownBannerThisSession(true);
    }
  }, [currentScreen, authUser, hasShownBannerThisSession]);

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

  const handleAuth = (user) => {
    setAuthUser(user);
    if (user.name && !userName) setUserName(user.name);
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('rita_authUser');
  };

  const handleDismissDiscount = () => {
    setShowDiscountBanner(false);
  };

  const handleDiscountRegister = () => {
    setShowDiscountBanner(false);
    setShowAuthModal(true);
  };

  return (
    <div className="relative min-h-screen bg-background text-textMain font-heading selection:bg-black selection:text-white w-full mx-auto">
      {currentScreen === 'splash' && (
        <Splash
          onNavigate={() => navigate('home')}
          setUserName={setUserName}
          isReturningUser={isReturningUser}
        />
      )}

      {currentScreen === 'home' && (
        <Home
          userName={userName}
          onNavigate={navigate}
          cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          onAddToCart={handleAddToCart}
          onOpenAuth={() => setShowAuthModal(true)}
          authUser={authUser}
          onLogout={handleLogout}
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
          onClearCart={() => setCartItems([])}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />

      {/* Discount Banner */}
      <DiscountBanner
        isOpen={showDiscountBanner}
        onRegister={handleDiscountRegister}
        onDismiss={handleDismissDiscount}
      />
    </div>
  );
}

export default App;
