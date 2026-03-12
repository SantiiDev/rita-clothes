import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { fetchProducts, isAdmin } from './lib/supabaseProducts';
import Splash from './components/Splash';
import Home from './components/Home';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AuthModal from './components/AuthModal';
import DiscountBanner from './components/DiscountBanner';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  // ── Basic user info (name from splash) ──────────────────────────────────
  const [userName, setUserName] = useState(() => localStorage.getItem('rita_userName') || '');

  // ── Auth state from Supabase ────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // wait for session check

  // ── Products (loaded from Supabase) ─────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // ── Cart ────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rita_cartItems')) || []; }
    catch { return []; }
  });

  // ── Navigation ──────────────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [homeScrollPosition, setHomeScrollPosition] = useState(0);

  // ── Modals ──────────────────────────────────────────────────────────────
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDiscountBanner, setShowDiscountBanner] = useState(false);
  const [hasShownBannerThisSession, setHasShownBannerThisSession] = useState(false);

  const isReturningUser = !!localStorage.getItem('rita_userName');

  // ── Load products from Supabase ─────────────────────────────────────────
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch {
      // Fallback: if Supabase table doesn't exist yet, products will be empty
      setProducts([]);
    }
    setProductsLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  // ── Supabase: load initial session + subscribe ──────────────────────────
  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario';
        setAuthUser({ name, email: session.user.email, id: session.user.id });
      }
      setAuthLoading(false);
    });

    // Subscribe to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario';
        setAuthUser({ name, email: session.user.email, id: session.user.id });
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Show discount banner when landing on home ───────────────────────────
  useEffect(() => {
    if (currentScreen === 'home' && !authUser && !hasShownBannerThisSession) {
      setShowDiscountBanner(true);
      setHasShownBannerThisSession(true);
    }
  }, [currentScreen, authUser, hasShownBannerThisSession]);

  // ── Persist userName & cart ─────────────────────────────────────────────
  useEffect(() => {
    if (userName) localStorage.setItem('rita_userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('rita_cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Handlers ────────────────────────────────────────────────────────────
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    // If in admin, go back to home
    if (currentScreen === 'admin' || currentScreen === 'admin-login') {
      setCurrentScreen('home');
    }
  };

  const handleDiscountRegister = () => {
    setShowDiscountBanner(false);
    setShowAuthModal(true);
  };

  const handleAdminLogin = (user) => {
    setAuthUser(user);
    setCurrentScreen('admin');
  };

  const handleGoToStore = () => {
    loadProducts(); // refresh products after admin changes
    setCurrentScreen('home');
  };

  // ── Wait for Supabase to resolve session before rendering ───────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  // ── Admin screens ──────────────────────────────────────────────────────
  if (currentScreen === 'admin-login') {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />;
  }

  if (currentScreen === 'admin') {
    if (!authUser || !isAdmin(authUser)) {
      return <AdminLogin onLoginSuccess={handleAdminLogin} />;
    }
    return (
      <AdminDashboard
        adminUser={authUser}
        onLogout={handleLogout}
        onGoToStore={handleGoToStore}
      />
    );
  }

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
          scrollPosition={homeScrollPosition}
          setScrollPosition={setHomeScrollPosition}
          products={products}
          productsLoading={productsLoading}
          isAdminUser={isAdmin(authUser)}
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
        onDismiss={() => setShowDiscountBanner(false)}
      />

      {/* Preload carousel images */}
      <div style={{ display: 'none' }}>
        {['/images/0.jpg','/images/1.jpg','/images/2.jpg','/images/3.jpg','/images/4.jpg'].map(src => (
          <img key={src} src={src} alt="preload" />
        ))}
      </div>
    </div>
  );
}

export default App;
