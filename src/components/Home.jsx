import { useState, useEffect } from 'react';

const DUMMY_PRODUCTS = [
    { id: 1, name: "Top Corset Brillos", price: "$56", category: "Tops", color: "Negro" },
    { id: 2, name: "Vestido Lencero Noche", price: "$56", category: "Vestidos", color: "Blanco" },
    { id: 3, name: "Falda Midi Satinada", price: "$45", category: "Faldas", color: "Plateado" },
    { id: 4, name: "Blazer Metálico", price: "$89", category: "Accesorios", color: "Plateado" },
    { id: 5, name: "Pantalón Piel", price: "$65", category: "Pantalones", color: "Negro" },
    { id: 6, name: "Vestido Asimétrico", price: "$110", category: "Vestidos", color: "Rojo" },
    { id: 7, name: "Mono Plisado", price: "$75", category: "Pantalones", color: "Azul" },
    { id: 8, name: "Body Transparencia", price: "$40", category: "Tops", color: "Transparente" },
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

export default function Home({ userName, onNavigate, cartItemCount, onAddToCart, onOpenAuth, authUser, onLogout }) {
    const [activeTab, setActiveTab] = useState('All');
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('home'); // 'home' | 'howToBuy'

    const categories = ['ALL', 'VESTIDOS', 'SHORTS', 'SKORTS', 'TOPS', 'BODIES', 'DENIM', 'BÁSICOS'];

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleAddToCart = (prod, e) => {
        e.stopPropagation();
        onAddToCart(prod);
        setToast({ type: 'cart', name: prod.name });
    };

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isSearchOpen) setSearchQuery('');
    };

    const filteredProducts = DUMMY_PRODUCTS.filter(prod => {
        const matchTab = activeTab === 'ALL' || prod.category.toUpperCase() === activeTab.toUpperCase();
        const query = searchQuery.toLowerCase();
        const matchSearch = query === '' ||
            prod.name.toLowerCase().includes(query) ||
            prod.category.toLowerCase().includes(query) ||
            (prod.color && prod.color.toLowerCase().includes(query));
        return matchTab && matchSearch;
    });

    const displayName = authUser?.name || userName || 'Invitado';

    return (
        <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background text-textMain relative pb-32 md:pb-0">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-gray-200 fixed top-0 left-0 h-screen z-30 p-6">
                <h2 className="text-xl font-bold font-heading mb-8 tracking-tight text-primary">Rita</h2>

                {/* How to Buy button */}
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
                                onClick={() => { setActiveTab(tab); setActiveNav('home'); }}
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
                        <span className="text-xs text-textDark">Hola, {displayName} 👋</span>
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
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full md:ml-64">
                {/* Top Header */}
                <header className="flex items-center p-6 md:px-10 h-24 relative overflow-hidden">
                    {/* Mobile: user avatar */}
                    <div className={`flex md:hidden items-center gap-3 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1'}`}>
                        <div
                            className="w-10 h-10 rounded-full bg-surface overflow-hidden border border-gray-200 flex items-center justify-center text-xs text-textDark shrink-0 cursor-pointer"
                            onClick={onOpenAuth}
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col text-left whitespace-nowrap">
                            <span className="text-sm font-semibold text-textMain flex items-center gap-1">
                                {activeNav === 'howToBuy' ? '📋 ¿Cómo Comprar?' : `Hola, ${displayName} `}
                                {activeNav !== 'howToBuy' && <span className="text-[10px]">👋</span>}
                            </span>
                        </div>
                    </div>

                    <div className={`hidden md:block transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 w-0' : 'opacity-100 flex-1'}`}>
                        <h1 className="text-2xl font-bold font-heading">
                            {activeNav === 'howToBuy' ? '📋 ¿Cómo Comprar?' : 'Descubrir'}
                        </h1>
                    </div>

                    <div className={`flex items-center gap-3 ml-auto transition-all duration-300 ${isSearchOpen ? 'w-full md:w-auto' : 'w-auto'}`}>
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
                            onClick={() => onNavigate('cart')}
                            className={`w-10 h-10 flex items-center justify-center rounded-full bg-surface relative hover:bg-gray-200 transition-colors shrink-0 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}
                        >
                            <CartIcon size={18} />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Banner — solo en vista home */}
                {activeNav === 'home' && (
                    <div className="px-6 md:px-10 mb-8">
                        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[140px] md:min-h-[200px] shadow-sm">
                            <div className="md:w-1/2 relative z-10">
                                <h3 className="text-white font-semibold text-sm md:text-2xl mb-2 md:mb-4">
                                    Descuento en primera compra! <span className="text-white font-extrabold block md:inline">Tiempo Limitado</span>
                                </h3>
                                <p className="text-white/90 text-xs md:text-sm mb-4 md:mb-6 max-w-sm leading-relaxed">
                                    Explorá las nuevas tendencias de noche preparadas para deslumbrar.
                                </p>
                                <button className="btn-slide-hover bg-black text-white text-xs md:text-sm font-semibold px-5 md:px-6 py-2.5 md:py-3 rounded-full w-max flex items-center gap-2 transition-colors shadow-lg">
                                    Ver Ahora
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden flex items-end md:items-center justify-end pr-4 md:pr-10">
                                <div className="w-[140px] h-[140px] md:w-[250px] md:h-[250px] bg-white/10 rotate-45 translate-x-10 translate-y-10 md:translate-x-0 md:translate-y-0 rounded-2xl md:rounded-3xl blur-[1px] backdrop-blur-sm shadow-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Auto-scrolling Image Carousel */}
                {activeNav === 'home' && (
                    <div className="mb-10 w-full overflow-hidden relative">
                        {/* Gradients for fading edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-background to-transparent z-10 pointers-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-background to-transparent z-10 pointers-events-none" />

                        <div className="flex animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused] gap-4 md:gap-6 px-4 md:px-0 w-max">
                            {/* We output the images 3 times to create a seamless infinite loop */}
                            {[1, 2, 3].map((set) => (
                                <div key={set} className="flex gap-4 md:gap-6">
                                    <div className="w-[140px] md:w-[220px] aspect-[3/4] rounded-2xl overflow-hidden bg-surface relative flex-shrink-0">
                                        <img src="https://images.unsplash.com/photo-1515347619252-8d7d92ccce88?q=80&w=600&auto=format&fit=crop" alt="Look 1" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-[140px] md:w-[220px] aspect-[3/4] rounded-2xl overflow-hidden bg-surface relative flex-shrink-0">
                                        <img src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600&auto=format&fit=crop" alt="Look 2" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-[140px] md:w-[220px] aspect-[3/4] rounded-2xl overflow-hidden bg-surface relative flex-shrink-0">
                                        <img src="https://images.unsplash.com/photo-1550639524-a6f58345a2ca?q=80&w=600&auto=format&fit=crop" alt="Look 3" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-[140px] md:w-[220px] aspect-[3/4] rounded-2xl overflow-hidden bg-surface relative flex-shrink-0">
                                        <img src="https://images.unsplash.com/photo-1551048601-527fb9cebf36?q=80&w=600&auto=format&fit=crop" alt="Look 4" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-[140px] md:w-[220px] aspect-[3/4] rounded-2xl overflow-hidden bg-surface relative flex-shrink-0">
                                        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop" alt="Look 5" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile Filter Tabs — solo en vista home */}
                {activeNav === 'home' && (
                    <div className="md:hidden px-6 mb-8">
                        <h3 className="text-[10px] font-bold text-textDark mb-3 uppercase tracking-widest text-center">SHOP</h3>
                        <div className="flex overflow-x-auto pb-4 gap-2 snap-x hide-scrollbar">
                            {categories.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`snap-center shrink-0 px-5 py-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors
                ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-surface text-textDark border border-gray-100'}
              `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* How to Buy Section */}
                {activeNav === 'howToBuy' && (
                    <div className="px-6 md:px-10 py-8 max-w-2xl mx-auto w-full">
                        <div className="flex flex-col gap-6">
                            {/* Step 1 */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">1</div>
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
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
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
                )}

                {/* Product Grid */}
                {activeNav === 'home' && (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="px-6 md:px-10 py-12 text-center text-textDark">
                                <p>No se encontraron prendas para tu búsqueda.</p>
                            </div>
                        ) : (
                            <div className="px-6 md:px-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-10">
                                {filteredProducts.map(prod => (
                                    <div key={prod.id} className="flex flex-col cursor-pointer group" onClick={() => onNavigate('productDetail', prod)}>
                                        <div className="bg-surface rounded-2xl aspect-[3/4] mb-3 relative overflow-hidden flex items-center justify-center transition-transform group-hover:-translate-y-1">
                                            <span className="text-textDark font-data text-[10px] uppercase rotate-90 opacity-30">Prenda {prod.id}</span>
                                        </div>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-xs md:text-sm leading-tight">{prod.name}</span>
                                        </div>
                                        <p className="text-[9px] md:text-xs text-textDark mb-3">Colección de Noche</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="font-bold text-sm md:text-base">{prod.price}</span>
                                            <button
                                                onClick={(e) => handleAddToCart(prod, e)}
                                                className="btn-slide-hover bg-accent md:bg-primary text-black md:text-white text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full font-medium transition-colors"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
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
                    onClick={() => onNavigate('cart')}
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

        </div>
    );
}
