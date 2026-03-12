import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchProducts, deleteProduct, updateProduct, uploadProductImage } from '../../lib/supabaseProducts';
import ProductForm from './ProductForm';

// ── Icons ───────────────────────────────────────────────────────────
const Icons = {
    Package: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>,
    AlertTriangle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
    Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /></svg>,
    Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
    Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>,
    LogOut: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
    ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>,
    Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
    Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>,
};

const CATEGORIES = ['VESTIDOS', 'SHORTS', 'SKORTS', 'TOPS', 'BODIES', 'DENIM', 'BÁSICOS'];

export default function AdminDashboard({ adminUser, onLogout, onGoToStore }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStock, setFilterStock] = useState('ALL'); // ALL | IN_STOCK | OUT_OF_STOCK
    const [view, setView] = useState('list'); // list | form
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toast, setToast] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Load products ───────────────────────────────────────────────
    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await fetchProducts();
            setProducts(data);
        } catch (err) {
            showToast('Error al cargar productos: ' + err.message, 'error');
        }
        setLoading(false);
    };

    useEffect(() => { loadProducts(); }, []);

    // ── Toast ────────────────────────────────────────────────────────
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Delete ───────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            showToast('Producto eliminado correctamente.');
            setDeleteConfirm(null);
        } catch (err) {
            showToast('Error al eliminar: ' + err.message, 'error');
        }
    };

    // ── Toggle stock ─────────────────────────────────────────────────
    const handleToggleStock = async (product, colorIndex) => {
        const newColors = [...product.colors];
        newColors[colorIndex] = {
            ...newColors[colorIndex],
            outOfStock: !newColors[colorIndex].outOfStock,
        };
        try {
            const updated = await updateProduct(product.id, { colors: newColors });
            setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
            showToast(`Stock actualizado para ${product.name} - ${newColors[colorIndex].name}`);
        } catch (err) {
            showToast('Error al actualizar stock: ' + err.message, 'error');
        }
    };

    // ── Save product (create/update) ─────────────────────────────────
    const handleSaveProduct = async () => {
        await loadProducts();
        setView('list');
        setEditingProduct(null);
        showToast(editingProduct ? 'Producto actualizado.' : 'Producto creado exitosamente.');
    };

    // ── Filtered products ────────────────────────────────────────────
    const filtered = products.filter(p => {
        const matchSearch = search === '' ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'ALL' || p.category === filterCategory;
        const isOutOfStock = p.colors?.every(c => c.outOfStock);
        const matchStock = filterStock === 'ALL' ||
            (filterStock === 'OUT_OF_STOCK' && isOutOfStock) ||
            (filterStock === 'IN_STOCK' && !isOutOfStock);
        return matchSearch && matchCategory && matchStock;
    });

    // ── Stats ────────────────────────────────────────────────────────
    const totalProducts = products.length;
    const outOfStockCount = products.filter(p => p.colors?.every(c => c.outOfStock)).length;
    const categoriesUsed = [...new Set(products.map(p => p.category))].length;

    if (view === 'form') {
        return (
            <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => { setView('list'); setEditingProduct(null); }}
                categories={CATEGORIES}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex">

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0f0f18] border-r border-white/5 flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-black font-bold text-sm">R</div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Rita</h1>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 mb-auto">
                    <button
                        onClick={() => { setView('list'); setSidebarOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                    >
                        <Icons.Grid />
                        Catálogo
                    </button>
                    <button
                        onClick={() => { setView('form'); setEditingProduct(null); setSidebarOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${view === 'form' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                    >
                        <Icons.Plus />
                        Agregar Producto
                    </button>
                </nav>

                <div className="border-t border-white/5 pt-4 mt-4">
                    <button
                        onClick={onGoToStore}
                        className="flex items-center gap-3 px-4 py-2.5 text-white/40 hover:text-white/70 text-sm transition-colors w-full"
                    >
                        <Icons.Home />
                        Ver Tienda
                    </button>
                    <div className="flex items-center gap-3 px-4 py-3 mt-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/60 truncate">{adminUser?.email}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-white/30 hover:text-red-400 transition-colors"
                            title="Cerrar sesión"
                        >
                            <Icons.LogOut />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-10">

                    {/* Mobile header */}
                    <div className="flex items-center justify-between mb-8 md:mb-10">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        </button>
                        <div className="hidden md:block">
                            <h2 className="text-2xl font-bold">Catálogo de Productos</h2>
                            <p className="text-sm text-white/40 mt-1">Gestioná todo tu inventario desde acá</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadProducts}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                title="Recargar"
                            >
                                <Icons.Refresh />
                            </button>
                            <button
                                onClick={() => { setView('form'); setEditingProduct(null); }}
                                className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
                            >
                                <Icons.Plus />
                                <span className="hidden sm:inline">Nuevo Producto</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 md:p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Icons.Package /></div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold">{totalProducts}</p>
                            <p className="text-xs text-white/40 mt-1">Productos</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 md:p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400"><Icons.AlertTriangle /></div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold">{outOfStockCount}</p>
                            <p className="text-xs text-white/40 mt-1">Sin Stock</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 md:p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Icons.Grid /></div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold">{categoriesUsed}</p>
                            <p className="text-xs text-white/40 mt-1">Categorías</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="flex-1 relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"><Icons.Search /></div>
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-white text-sm pl-11 pr-4 py-3 rounded-xl outline-none focus:border-white/20 transition-colors placeholder:text-white/30"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-[#0f0f18]">Todas las categorías</option>
                            {CATEGORIES.map(c => (
                                <option key={c} value={c} className="bg-[#0f0f18]">{c}</option>
                            ))}
                        </select>
                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-[#0f0f18]">Todo el stock</option>
                            <option value="IN_STOCK" className="bg-[#0f0f18]">En stock</option>
                            <option value="OUT_OF_STOCK" className="bg-[#0f0f18]">Sin stock</option>
                        </select>
                    </div>

                    {/* Products Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <svg className="animate-spin text-white/40 mb-4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                            <p className="text-white/30 text-sm">Cargando productos...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-4"><Icons.Package /></div>
                            <p className="text-white/50 font-medium mb-1">No hay productos</p>
                            <p className="text-white/30 text-sm">{search ? 'Intentá con otros términos de búsqueda' : 'Agregá tu primer producto para comenzar'}</p>
                        </div>
                    ) : (
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                            {/* Desktop table header */}
                            <div className="hidden md:grid grid-cols-[1fr_120px_100px_140px_100px] gap-4 px-6 py-3 border-b border-white/5 text-xs text-white/30 uppercase tracking-wider font-medium">
                                <span>Producto</span>
                                <span>Categoría</span>
                                <span>Precio</span>
                                <span>Stock</span>
                                <span className="text-right">Acciones</span>
                            </div>

                            {/* Product rows */}
                            {filtered.map((product) => {
                                const allOutOfStock = product.colors?.every(c => c.outOfStock);
                                const someOutOfStock = product.colors?.some(c => c.outOfStock) && !allOutOfStock;
                                return (
                                    <div key={product.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_140px_100px] gap-2 md:gap-4 px-4 md:px-6 py-4 items-center">
                                            {/* Product info */}
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="w-12 h-14 md:w-14 md:h-16 rounded-xl bg-white/5 overflow-hidden shrink-0">
                                                    {product.colors?.[0]?.image ? (
                                                        <img src={product.colors[0].image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-white/20 uppercase">Sin img</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{product.name}</p>
                                                    <p className="text-xs text-white/30 mt-0.5 md:hidden">{product.category} · {product.price}</p>
                                                    <p className="text-xs text-white/30 mt-0.5 hidden md:block">
                                                        {product.colors?.length || 0} {product.colors?.length === 1 ? 'color' : 'colores'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Category */}
                                            <span className="hidden md:block text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-md w-fit">{product.category}</span>

                                            {/* Price */}
                                            <span className="hidden md:block text-sm font-medium">{product.price}</span>

                                            {/* Stock status */}
                                            <div className="hidden md:flex items-center gap-2">
                                                {allOutOfStock ? (
                                                    <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md">
                                                        <Icons.X /> Sin Stock
                                                    </span>
                                                ) : someOutOfStock ? (
                                                    <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                                                        <Icons.AlertTriangle /> Parcial
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                                                        <Icons.Check /> En Stock
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 justify-end">
                                                {/* Mobile stock badge */}
                                                <div className="md:hidden mr-auto">
                                                    {allOutOfStock ? (
                                                        <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Sin Stock</span>
                                                    ) : someOutOfStock ? (
                                                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Parcial</span>
                                                    ) : (
                                                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">En Stock</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => { setEditingProduct(product); setView('form'); }}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Icons.Edit />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(product)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Color rows for stock management */}
                                        {product.colors && product.colors.length > 1 && (
                                            <div className="px-4 md:px-6 pb-3 pt-0">
                                                <div className="flex flex-wrap gap-1.5 ml-[60px] md:ml-[72px]">
                                                    {product.colors.map((color, ci) => (
                                                        <button
                                                            key={ci}
                                                            onClick={() => handleToggleStock(product, ci)}
                                                            className={`text-[11px] px-2.5 py-1 rounded-md border transition-all duration-200 flex items-center gap-1.5
                                                                ${color.outOfStock
                                                                    ? 'border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10'
                                                                    : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10'
                                                                }`}
                                                            title={color.outOfStock ? 'Marcar en stock' : 'Marcar sin stock'}
                                                        >
                                                            {color.outOfStock ? <Icons.X /> : <Icons.Check />}
                                                            {color.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <p className="text-center text-xs text-white/20 mt-8">
                        {filtered.length} de {totalProducts} productos
                    </p>
                </div>
            </main>

            {/* Delete confirmation modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-[#16161f] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mx-auto mb-4">
                            <Icons.Trash />
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2">¿Eliminar producto?</h3>
                        <p className="text-sm text-white/50 text-center mb-6">
                            Se eliminará <span className="text-white font-medium">{deleteConfirm.name}</span> permanentemente. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-white/5 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm.id)}
                                className="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[110] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border 
                    ${toast.type === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-300'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    } animate-in slide-in-from-bottom-4 fade-in duration-300`}>
                    {toast.type === 'error' ? <Icons.X /> : <Icons.Check />}
                    {toast.message}
                </div>
            )}
        </div>
    );
}
