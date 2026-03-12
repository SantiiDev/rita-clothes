import { useState, useEffect, useRef } from 'react';
const carouselImages = [
    '/images/0.jpg',
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg',
    '/images/4.jpg'
];

// Cart icon SVG (shopping bag)
const CartIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

// Search icon SVG
const SearchIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

// Instagram icon SVG
const InstagramIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

// Info/Guide icon SVG
const GuideIcon = ({ size = 20, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

export default function Home({ userName, onNavigate, cartItemCount, onAddToCart, onOpenAuth, authUser, onLogout, scrollPosition, setScrollPosition, products: PRODUCTS = [], productsLoading, isAdminUser }) {
    const shopRef = useRef(null);
    const [activeTab, setActiveTab] = useState('ALL');
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('home'); // 'home' | 'howToBuy'
    const [showTopBanner, setShowTopBanner] = useState(!authUser);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [colorPickerProduct, setColorPickerProduct] = useState(null);
    const [selectedColorForSize, setSelectedColorForSize] = useState(null);

    // Save and Restore Scroll position
    useEffect(() => {
        // Restore scroll position when returning, slightly delayed to allow DOM paint
        if (scrollPosition > 0) {
            setTimeout(() => {
                window.scrollTo({ top: scrollPosition, behavior: 'instant' });
            }, 50);
        }
    }, [scrollPosition]);

    const handleNavigate = (screen, payload) => {
        setScrollPosition(window.scrollY);
        onNavigate(screen, payload);
    };

    const categories = ['ALL', 'VESTIDOS', 'SHORTS', 'SKORTS', 'TOPS', 'BODIES', 'DENIM', 'BÁSICOS'];

    // Carousel auto-slide
    useEffect(() => {
        if (activeNav !== 'home') return;
        const timer = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % carouselImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [activeNav]);

    // Scroll to top when switching sections (like How to buy)
    const initialMount = useRef(true);
    useEffect(() => {
        if (initialMount.current) {
            initialMount.current = false;
            return;
        }
        window.scrollTo(0, 0);
    }, [activeNav]);

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev + 1) % carouselImages.length);
    };

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleBuyClick = (prod, e) => {
        e.stopPropagation();
        if (prod.colors && prod.colors.length > 0) {
            setColorPickerProduct(prod);
            setSelectedColorForSize(null);
        } else {
            // No colors — add directly
            onAddToCart({ ...prod, selectedColor: 'Único' });
            setToast({ type: 'cart', name: prod.name });
        }
    };

    const handleColorSelect = (color) => {
        if (!colorPickerProduct) return;

        if (color.sizes && color.sizes.length > 0) {
            setSelectedColorForSize(color);
            return;
        }

        const productToAdd = {
            ...colorPickerProduct,
            id: `${colorPickerProduct.id}-${color.name}`,
            name: `${colorPickerProduct.name} - ${color.name}`,
            selectedColor: color.name,
            cartImage: color.image || (color.images && color.images[0])
        };
        onAddToCart(productToAdd, 1);
        setToast({ type: 'cart', name: productToAdd.name });
        setColorPickerProduct(null);
        setSelectedColorForSize(null);
    };

    const handleSizeSelect = (size) => {
        if (!colorPickerProduct || !selectedColorForSize) return;

        const productToAdd = {
            ...colorPickerProduct,
            id: `${colorPickerProduct.id}-${selectedColorForSize.name}-${size}`,
            name: `${colorPickerProduct.name} - ${selectedColorForSize.name} (Talle ${size})`,
            selectedColor: selectedColorForSize.name,
            selectedSize: size,
            cartImage: selectedColorForSize.image || (selectedColorForSize.images && selectedColorForSize.images[0])
        };
        onAddToCart(productToAdd, 1);
        setToast({ type: 'cart', name: productToAdd.name });
        setColorPickerProduct(null);
        setSelectedColorForSize(null);
    };

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isSearchOpen) setSearchQuery('');
    };

    const filteredProducts = PRODUCTS.filter(prod => {
        const matchTab = activeTab === 'ALL' || prod.category.toUpperCase() === activeTab.toUpperCase();
        const query = searchQuery.toLowerCase();
        
        // Search by name, category, or any available color
        const matchSearch = query === '' ||
            prod.name.toLowerCase().includes(query) ||
            prod.category.toLowerCase().includes(query) ||
            prod.colors.some(c => c.name.toLowerCase().includes(query));
            
        return matchTab && matchSearch;
    });

    const displayName = authUser?.name || userName || 'Invitado';

    return (
        <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background text-textMain relative pb-32 md:pb-0">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-gray-200 fixed top-0 left-0 h-screen z-30 p-6">
                <h2 className="text-xl font-bold font-heading mb-8 tracking-tight text-primary">Rita</h2>

                <button
                    onClick={() => { setActiveNav('howToBuy'); setActiveTab('ALL'); }}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors mb-6
                        ${activeNav === 'howToBuy' ? 'bg-primary/10 text-primary' : 'text-textDark hover:bg-gray-200 hover:text-black'}
                    `}
                >
                    <GuideIcon size={18} filled={activeNav === 'howToBuy'} />
                    ¿Cómo Comprar?
                </button>

                <h3 className="text-xs font-bold text-textMain mb-4 uppercase tracking-wider">SHOP</h3>
                <ul className="flex flex-col gap-1 mb-auto overflow-y-auto pr-2 pb-4">
                    {categories.map(tab => (
                        <li key={tab}>
                            <button
                                onClick={() => {
                                    setActiveTab(tab);
                                    setActiveNav('home');
                                    // Make desktop filters scroll to the grid just like mobile tabs
                                    if (shopRef.current) {
                                        const yOffset = -80;
                                        const y = shopRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
                                        window.scrollTo({ top: y, behavior: 'smooth' });
                                    }
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-colors
                  ${activeTab === tab && activeNav === 'home' ? 'bg-primary text-white' : 'text-textDark hover:bg-gray-200 hover:text-black'}
                `}
                            >
                                {tab}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* User button in sidebar */}
                <div
                    className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200 -mx-2 px-2 py-2 rounded-xl transition-colors cursor-pointer hover:bg-gray-100"
                    onClick={authUser ? undefined : onOpenAuth}
                >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs text-textDark">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left flex-1">
                        <span className="text-xs text-textDark">Hola, {displayName}!</span>
                        {authUser && <span className="text-[10px] text-textDark/60">{authUser.email}</span>}
                    </div>
                    {authUser && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onLogout(); }}
                            className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
                            title="Cerrar sesión"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        </button>
                    )}
                </div>

                {/* Admin button - only visible for admin users */}
                {isAdminUser && (
                    <button
                        onClick={() => handleNavigate('admin')}
                        className="w-full mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Panel Admin
                    </button>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full md:ml-64">
                {/* Top Header */}
                <header className="flex items-center p-6 md:px-10 h-24 relative z-40">
                    {/* Mobile: user avatar */}
                    <div className={`flex md:hidden items-center gap-3 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 flex-1'}`}>
                        <div
                            className="w-10 h-10 rounded-full bg-surface overflow-hidden border border-gray-200 flex items-center justify-center text-xs text-textDark shrink-0 cursor-pointer"
                            onClick={onOpenAuth}
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col text-left whitespace-nowrap">
                            <span className={`${activeNav === 'howToBuy' ? 'text-lg md:text-xl' : 'text-sm'} font-semibold text-textMain flex items-center gap-1`}>
                                {activeNav === 'howToBuy' ? '¿Cómo Comprar?' : `¡Hola, ${displayName}!`}
                            </span>
                        </div>
                    </div>

                    <div className={`hidden md:block transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 w-0' : 'opacity-100 flex-1'}`}>
                        <h1 className={`${activeNav === 'howToBuy' ? 'text-3xl md:text-4xl' : 'text-2xl'} font-bold font-heading`}>
                            {activeNav === 'howToBuy' ? '¿Cómo Comprar?' : 'Descubrir'}
                        </h1>
                    </div>

                    <div className={`relative flex items-center gap-3 ml-auto transition-all duration-300 ${isSearchOpen ? 'w-full md:w-auto' : 'w-auto'}`}>
                        {/* Search Input */}
                        <div className={`overflow-hidden transition-all duration-300 flex items-center bg-surface border border-gray-200 rounded-full ${isSearchOpen ? 'w-full md:w-64 px-4 py-2' : 'w-0 border-transparent opacity-0'}`}>
                            <input
                                type="text"
                                placeholder="Buscar prenda, color..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-sm outline-none text-textMain"
                            />
                        </div>

                        {/* Search Toggle Button */}
                        <button
                            onClick={handleSearchToggle}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-gray-200 transition-colors shrink-0">
                            {isSearchOpen ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            ) : (
                                <SearchIcon size={18} />
                            )}
                        </button>

                        {/* Cart Button */}
                        <button
                            onClick={() => handleNavigate('cart')}
                            className={`w-10 h-10 flex items-center justify-center rounded-full bg-surface relative hover:bg-gray-200 transition-colors shrink-0 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}
                        >
                            <CartIcon size={18} />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        {/* Live Search Dropdown */}
                        {isSearchOpen && searchQuery.trim() !== '' && (
                            <div className="absolute top-14 right-0 w-full md:w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[100] max-h-[60vh] overflow-y-auto px-2 py-2">
                                {filteredProducts.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-textDark">No se encontraron resultados</div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {filteredProducts.map(prod => (
                                            <div
                                                key={prod.id}
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setIsSearchOpen(false);
                                                    handleNavigate('productDetail', prod);
                                                }}
                                                className="flex items-center gap-3 p-2 hover:bg-surface rounded-xl cursor-pointer transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-surface overflow-hidden shrink-0">
                                                    {prod.colors && prod.colors.length > 0 && prod.colors[0].image ? (
                                                        <img src={prod.colors[0].image} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-textDark uppercase">Sin img</div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-semibold text-textMain truncate">{prod.name}</span>
                                                    <span className="text-xs text-textDark">{prod.price}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Top Discount Banner */}
                {activeNav === 'home' && !authUser && showTopBanner && (
                    <div className="bg-[#1A1A1A] text-white flex flex-col sm:flex-row items-center justify-center py-2 md:py-3 px-6 relative z-10 w-full shrink-0">
                        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 text-center">
                            <span className="text-xs md:text-sm flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                ¡Tu primer look tiene 10% OFF!
                            </span>
                            <button onClick={onOpenAuth} className="bg-primary hover:bg-primary/80 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider transition-colors mt-1 md:mt-0">
                                Registrarse
                            </button>
                        </div>
                        <button onClick={() => setShowTopBanner(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                )}

                {/* Main scrollable area */}
                <div className="flex-1 relative overflow-x-hidden flex w-full">
                    <div className={`flex w-[200%] shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeNav === 'howToBuy' ? '-translate-x-1/2' : 'translate-x-0'}`}>
                        
                        {/* ------------- HOME TAB ------------- */}
                        <div className={`w-1/2 flex-shrink-0 flex flex-col ${activeNav === 'home' ? 'min-h-full' : 'h-0 overflow-hidden'}`}>
                            {/* Fullscreen Photo Carousel */}
                            <div className="w-full h-[calc(100dvh-130px)] md:h-[calc(100vh-160px)] bg-[#E8E8E8] relative flex flex-col items-center justify-center overflow-hidden mb-8 pb-10 group">
                        
                        {/* Images */}
                        {carouselImages.map((src, index) => (
                            <img
                                key={src}
                                src={src}
                                alt={`Rita Carousel ${index}`}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}

                        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

                        {/* Controls (Desktop/Mobile hover) */}
                        <button 
                            onClick={handlePrevImage}
                            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button 
                            onClick={handleNextImage}
                            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>

                        {/* Text Overlay */}
                        <div className="relative z-10 flex flex-col items-center justify-center text-white mb-8 md:mb-12 pointer-events-none">
                            <span className="font-heading text-5xl md:text-7xl font-bold tracking-widest uppercase drop-shadow-md">Rita</span>
                            <span className="font-data text-[10px] md:text-sm tracking-widest mt-2 drop-shadow-md">NUEVA COLECCIÓN</span>
                        </div>

                        {/* Shop Now Button */}
                        <div className="relative z-10 scale-90 md:scale-100">
                            <button
                                onClick={() => {
                                    if (shopRef.current) {
                                        const yOffset = -80;
                                        const y = shopRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
                                        window.scrollTo({ top: y, behavior: 'smooth' });
                                    }
                                }}
                                className="btn-slide-hover w-max mx-auto bg-primary text-white font-heading font-semibold px-12 py-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Shop Now
                            </button>
                        </div>
                        
                        {/* Dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {carouselImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                                />
                            ))}
                        </div>
                    </div>

                            {/* Shop Section Anchor */}
                            <div ref={shopRef} className="w-full h-0" />

                            {/* Mobile Filter Tabs */}
                            <div className="md:hidden px-6 mb-8 pt-4">
                        <h3 className="text-[10px] font-bold text-textDark mb-3 uppercase tracking-widest text-center">SHOP</h3>
                        <div className="flex flex-wrap justify-center pb-4 gap-2">
                            {categories.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        if (shopRef.current) {
                                            const yOffset = -80;
                                            const y = shopRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                        }
                                    }}
                                    className={`px-5 py-2.5 rounded-full text-[11px] font-semibold transition-colors
                                        ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-surface text-textDark border border-gray-100'}
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="pb-10 flex-1">
                                <div className="hidden md:flex items-center px-6 md:px-10 mb-6 gap-4">
                                    <h2 className="text-sm font-bold tracking-widest text-textDark uppercase">SHOP</h2>
                                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                                </div>

                                {filteredProducts.length === 0 ? (
                                    <div className="px-6 md:px-10 py-12 text-center text-textDark">
                                        <p>No se encontraron prendas para tu búsqueda.</p>
                                    </div>
                                ) : (
                                    <div className="px-6 md:px-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-10">
                                        {filteredProducts.map(prod => {
                                            const isAllOutOfStock = prod.colors && prod.colors.length > 0 && prod.colors.every(c => c.outOfStock);
                                            return (
                                            <div key={prod.id} className="flex flex-col cursor-pointer group" onClick={() => handleNavigate('productDetail', prod)}>
                                                <div className="bg-surface rounded-2xl aspect-[3/4] mb-3 relative overflow-hidden flex items-center justify-center transition-transform group-hover:-translate-y-1">
                                                    {isAllOutOfStock && (
                                                        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded-[4px] uppercase tracking-wider font-bold z-10 transition-opacity flex items-center gap-1.5">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                            Sin Stock
                                                        </div>
                                                    )}
                                                    {prod.colors && prod.colors.length > 0 && prod.colors[0].image ? (
                                                        <img src={prod.colors[0].image} alt={prod.name} className={`w-full h-full object-cover transition-opacity duration-300 ${isAllOutOfStock ? 'opacity-50 grayscale-[0.3]' : ''}`} />
                                                    ) : (
                                                        <span className="text-textDark font-data text-[10px] uppercase rotate-90 opacity-30">Prenda {prod.id}</span>
                                                    )}

                                                </div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-xs md:text-sm leading-tight flex-1 pr-2">{prod.name}</span>
                                                </div>
                                                {prod.colors && prod.colors.length > 1 ? (
                                                    <p className="text-[9px] md:text-[10px] text-primary mb-3 font-semibold">
                                                        {prod.colors.length} Colores disponibles
                                                    </p>
                                                ) : (
                                                    <p className="text-[9px] md:text-xs text-textDark mb-3">Colección de Noche</p>
                                                )}
                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className={`font-bold text-sm md:text-base ${isAllOutOfStock ? 'text-gray-400 line-through decoration-1 opacity-70' : ''}`}>{prod.price}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            if (isAllOutOfStock) {
                                                                e.stopPropagation();
                                                                return;
                                                            }
                                                            handleBuyClick(prod, e);
                                                        }}
                                                        disabled={isAllOutOfStock}
                                                        className={`border ${isAllOutOfStock ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed hidden-btn-slide' : 'btn-slide-hover border-textMain bg-white text-black hover:bg-accent hover:border-accent hover:text-white'} text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-1.5`}
                                                    >
                                                        {isAllOutOfStock ? 'Agotado' : 'Comprar'}
                                                    </button>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ------------- HOW TO BUY TAB ------------- */}
                        <div className={`w-1/2 flex-shrink-0 flex flex-col ${activeNav === 'howToBuy' ? 'min-h-full' : 'h-0 overflow-hidden'}`}>
                            <div className="px-6 md:px-10 py-8 max-w-2xl mx-auto w-full">
                        <div className="flex flex-col gap-6">
                            {/* Step 1 */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-accent/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Elegí tus prendas</h4>
                                    <p className="text-xs text-textDark leading-relaxed">Explorá el catálogo y encontrá las prendas que más te gusten. Podés buscar por categoría o usar la lupa.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-accent/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Agregalas al carrito</h4>
                                    <p className="text-xs text-textDark leading-relaxed">Tocá "Agregar" en cada prenda que quieras. Podés elegir la cantidad desde el detalle del producto o desde el carrito.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-accent/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Completá el checkout</h4>
                                    <p className="text-xs text-textDark leading-relaxed">Hacé clic en "Realizar Pedido", completá tu nombre, correo e Instagram, y nosotros te contactamos para coordinar el pago y envío.</p>
                                </div>
                            </div>
                        </div>

                                <button
                                    onClick={() => setActiveNav('home')}
                                    className="btn-slide-hover bg-primary text-white font-semibold px-8 py-3 rounded-full mt-8 mx-auto flex items-center gap-2 transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                                    Volver al Catálogo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Floating Bottom Nav (Mobile Only) — 5 icons ── */}
            <div
                className="md:hidden fixed left-4 right-4 bg-primary rounded-[2rem] flex items-center justify-between px-6 text-white max-w-sm mx-auto shadow-2xl z-50"
                style={{
                    bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
                    height: '60px',
                }}
            >
                {/* 1. Home */}
                <button
                    onClick={() => { setActiveNav('home'); setIsSearchOpen(false); }}
                    className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${activeNav === 'home' ? 'text-white' : 'text-white/50'}`}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={activeNav === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </button>

                {/* 2. How to Buy (replaces Favorites) */}
                <button
                    onClick={() => { setActiveNav('howToBuy'); setIsSearchOpen(false); }}
                    className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${activeNav === 'howToBuy' ? 'text-white' : 'text-white/50'}`}
                >
                    <GuideIcon size={20} filled={activeNav === 'howToBuy'} />
                </button>

                {/* 3. Cart FAB (center — elevated) */}
                <div
                    onClick={() => handleNavigate('cart')}
                    className="absolute left-1/2 -translate-x-1/2 w-14 h-14 bg-accent rounded-full flex items-center justify-center text-black shadow-lg border-4 border-background cursor-pointer hover:scale-105 transition-transform"
                    style={{ bottom: 'calc(50% - 4px)' }}
                >
                    <CartIcon size={24} />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-white text-black text-[12px] font-bold w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center">
                            {cartItemCount}
                        </span>
                    )}
                </div>

                {/* Spacer center */}
                <div className="w-14" />

                {/* 4. Search */}
                <button
                    onClick={() => {
                        setActiveNav('home');
                        handleSearchToggle();
                    }}
                    className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${isSearchOpen ? 'text-white' : 'text-white/50'}`}
                >
                    <SearchIcon size={20} />
                </button>

                {/* 5. Instagram */}
                <a
                    href="https://www.instagram.com/ritaclothess_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center w-10 h-10 rounded-full text-white/50 hover:text-white transition-all duration-200"
                >
                    <InstagramIcon size={20} />
                </a>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-[90] bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 max-w-sm">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D369CD" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Agregado al carrito</p>
                        <p className="text-xs text-white/60">{toast.name}</p>
                    </div>
                </div>
            )}

            {/* Color Picker Modal */}
            {colorPickerProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setColorPickerProduct(null)}></div>
                    <div className="bg-surface border border-gray-100 rounded-[2rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold font-heading text-textMain">Seleccionar {selectedColorForSize ? 'Talle' : 'Color'}</h3>
                                <button onClick={() => { setColorPickerProduct(null); setSelectedColorForSize(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-textDark">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            
                            <div className="flex gap-4 mb-6">
                                <div className="w-20 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                    {colorPickerProduct.colors?.[0]?.image || colorPickerProduct.colors?.[0]?.images?.[0] ? (
                                        <img src={colorPickerProduct.colors[0].image || colorPickerProduct.colors[0].images?.[0]} alt={colorPickerProduct.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-textDark uppercase">Sin img</div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-textMain line-clamp-2 leading-tight">{colorPickerProduct.name}</h4>
                                    <p className="text-sm font-bold mt-2">{colorPickerProduct.price}</p>
                                </div>
                            </div>

                            {selectedColorForSize ? (
                                <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <button onClick={() => setSelectedColorForSize(null)} className="text-textDark hover:text-black">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                                        </button>
                                        <p className="text-sm font-bold text-textMain">Talles para {selectedColorForSize.name}:</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedColorForSize.sizes.map((size, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSizeSelect(size)}
                                                className="w-12 h-12 rounded-full text-sm font-semibold transition-all duration-300 border flex items-center justify-center bg-white text-textDark border-gray-200 hover:border-black hover:bg-black hover:text-white"
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                                    <p className="text-sm text-textDark mb-3">Colores disponibles:</p>
                                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 pb-2">
                                        {colorPickerProduct.colors?.map((c, idx) => {
                                            const outOfStock = c.outOfStock;
                                            return (
                                            <button
                                                key={idx}
                                                onClick={() => outOfStock ? null : handleColorSelect(c)}
                                                disabled={outOfStock}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors border flex justify-between items-center group
                                                    ${outOfStock ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-70' : 'border-gray-200 hover:border-black active:scale-[0.98]'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={outOfStock ? 'line-through decoration-1 opacity-70' : ''}>{c.name}</span>
                                                    {outOfStock && <span className="text-[9px] bg-gray-200/80 text-textDark px-1.5 py-0.5 rounded-[3px] font-bold uppercase tracking-wider flex items-center gap-1"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Sin Stock</span>}
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${outOfStock ? 'border-gray-200' : 'border-gray-300 group-hover:bg-black group-hover:border-black'}`}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-colors ${outOfStock ? 'text-transparent' : 'text-transparent group-hover:text-white'}`}><polyline points="20 6 9 17 4 12" /></svg>
                                                </div>
                                            </button>
                                        )})}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
