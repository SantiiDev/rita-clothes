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

export default function Home({ userName, onNavigate, cartItemCount, onAddToCart }) {
    const [activeTab, setActiveTab] = useState('All');
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const categories = ['All', 'Vestidos', 'Tops', 'Faldas', 'Pantalones', 'Accesorios'];

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
        setToast(prod.name);
    };

    const filteredProducts = DUMMY_PRODUCTS.filter(prod => {
        // Tab check
        const matchTab = activeTab === 'All' || prod.category === activeTab;

        // Search check
        const query = searchQuery.toLowerCase();
        const matchSearch = query === '' ||
            prod.name.toLowerCase().includes(query) ||
            prod.category.toLowerCase().includes(query) ||
            (prod.color && prod.color.toLowerCase().includes(query));

        return matchTab && matchSearch;
    });

    return (
        <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background text-textMain relative pb-32 md:pb-0">

            {/* Desktop Sidebar — fixed position so it never scrolls */}
            <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-gray-200 fixed top-0 left-0 h-screen z-30 p-6">
                <h2 className="text-xl font-bold font-heading mb-10 tracking-tight text-primary">Rita Clothes</h2>

                <h3 className="text-xs font-semibold text-textDark mb-4 uppercase tracking-wider">Categorías</h3>
                <ul className="flex flex-col gap-2 mb-auto">
                    {categories.map(tab => (
                        <li key={tab}>
                            <button
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${activeTab === tab ? 'bg-primary text-white' : 'text-textDark hover:bg-gray-200'}
                `}
                            >
                                {tab}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* User button in sidebar */}
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200 -mx-2 px-2 py-2 rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs text-textDark">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs text-textDark">Hola, {userName || 'Invitado'} 👋</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area — offset by sidebar width on desktop */}
            <main className="flex-1 flex flex-col relative w-full md:ml-64">
                {/* Top Header */}
                <header className="flex items-center p-6 md:px-10 h-24 relative overflow-hidden">
                    {/* Mobile: user avatar */}
                    <div className={`flex md:hidden items-center gap-3 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 flex-1'}`}>
                        <div className="w-10 h-10 rounded-full bg-surface overflow-hidden border border-gray-200 flex items-center justify-center text-xs text-textDark shrink-0">
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col text-left whitespace-nowrap">
                            <span className="text-sm font-semibold text-textMain flex items-center gap-1">Hola, {userName || 'Invitado'} <span className="text-[10px]">👋</span></span>
                        </div>
                    </div>

                    <div className={`hidden md:block transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 w-0' : 'opacity-100 flex-1'}`}>
                        <h1 className="text-2xl font-bold font-heading">Descubrir</h1>
                    </div>

                    <div className={`flex items-center gap-3 ml-auto transition-all duration-300 ${isSearchOpen ? 'w-full md:w-auto' : 'w-auto'}`}>
                        {/* Search Input */}
                        <div className={`overflow-hidden transition-all duration-300 flex items-center bg-surface border border-gray-200 rounded-full ${isSearchOpen ? 'w-full md:w-64 px-4 py-2' : 'w-0 border-transparent opacity-0'}`}>
                            <input
                                type="text"
                                placeholder="Buscar prenda, color..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full bg-transparent text-sm outline-none text-textMain`}
                            />
                        </div>

                        {/* Search Toggle Button */}
                        <button
                            onClick={() => {
                                setIsSearchOpen(!isSearchOpen);
                                if (isSearchOpen) setSearchQuery(''); // Clear on close
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-gray-200 transition-colors shrink-0">
                            {isSearchOpen ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
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

                {/* Banner */}
                <div className="px-6 md:px-10 mb-6 md:mb-10">
                    <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[140px] md:min-h-[200px]">
                        <div className="md:w-1/2 relative z-10">
                            <h3 className="text-white font-semibold text-sm md:text-2xl mb-2 md:mb-4">
                                Descuento en primera compra! <span className="text-white font-extrabold block md:inline">Tiempo Limitado</span>
                            </h3>
                            <p className="text-white/80 text-[10px] md:text-sm mb-4 md:mb-6">
                                Explora las nuevas tendencias de noche preparadas para deslumbrar.
                            </p>
                            <button className="btn-slide-hover bg-black text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-1.5 md:py-3 rounded-full w-max flex items-center gap-1 transition-colors">
                                Ver Ahora
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-1/2 overflow-hidden flex items-end md:items-center justify-center md:justify-end md:pr-10">
                            <div className="w-[120px] h-[120px] md:w-[250px] md:h-[250px] bg-black/10 rotate-45 translate-x-10 translate-y-10 md:translate-x-0 md:translate-y-0 rounded-xl md:rounded-3xl blur-[2px]" />
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Tabs */}
                <div className="md:hidden px-6 mb-6 flex flex-wrap justify-center gap-3">
                    {categories.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${activeTab === tab ? 'bg-primary text-white' : 'bg-surface text-textDark border border-gray-200'}
              `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
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
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Bottom Nav (Mobile Only) */}
            <div className="md:hidden fixed left-6 right-6 h-16 bg-primary rounded-[2rem] flex items-center justify-between px-8 text-white max-w-sm mx-auto shadow-2xl z-50" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
                <button className="text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </button>
                <button className="text-textDark hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                </button>

                {/* Mobile Cart Button (Center FAB) */}
                <div
                    onClick={() => onNavigate('cart')}
                    className="absolute left-1/2 -top-6 -translate-x-1/2 w-14 h-14 bg-accent rounded-full flex items-center justify-center text-black shadow-lg border-4 border-background cursor-pointer hover:scale-105 transition-transform"
                >
                    <CartIcon size={24} />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-white text-black text-[12px] font-bold w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center">
                            {cartItemCount}
                        </span>
                    )}
                </div>

                <div className="text-textDark ml-12" /> {/* Spacer since avatar moved */}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-[90] bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 max-w-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D369CD" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Agregado al carrito</p>
                        <p className="text-xs text-white/60">{toast}</p>
                    </div>
                </div>
            )}

        </div>
    );
}
