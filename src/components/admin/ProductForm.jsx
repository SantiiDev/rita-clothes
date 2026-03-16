import { useState, useRef } from 'react';
import { createProduct, updateProduct, uploadProductImage } from '../../lib/supabaseProducts';

export default function ProductForm({ product, onSave, onCancel, categories }) {
    const isEdit = !!product;
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: product?.name || '',
        category: product?.category || categories[0],
        price: product?.price || '',
        colors: product?.colors?.map(c => ({ ...c })) || [{ name: '', image: '', outOfStock: false, sizes: [] }],
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploadingColor, setUploadingColor] = useState(null);
    const [newSizeInputs, setNewSizeInputs] = useState({});

    // ── Handlers ────────────────────────────────────────────────────
    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const updateColor = (index, field, value) => {
        setForm(prev => {
            const colors = [...prev.colors];
            colors[index] = { ...colors[index], [field]: value };
            return { ...prev, colors };
        });
    };

    const addColor = () => {
        setForm(prev => ({
            ...prev,
            colors: [...prev.colors, { name: '', image: '', outOfStock: false, sizes: [] }],
        }));
    };

    const removeColor = (index) => {
        setForm(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index),
        }));
    };

    const addSize = (colorIndex) => {
        const sizeVal = newSizeInputs[colorIndex];
        if (!sizeVal) return;
        const num = parseInt(sizeVal);
        if (isNaN(num)) return;
        setForm(prev => {
            const colors = [...prev.colors];
            const currentSizes = colors[colorIndex].sizes || [];
            if (currentSizes.includes(num)) return prev;
            colors[colorIndex] = { ...colors[colorIndex], sizes: [...currentSizes, num].sort((a, b) => a - b) };
            return { ...prev, colors };
        });
        setNewSizeInputs(prev => ({ ...prev, [colorIndex]: '' }));
    };

    const removeSize = (colorIndex, size) => {
        setForm(prev => {
            const colors = [...prev.colors];
            colors[colorIndex] = {
                ...colors[colorIndex],
                sizes: (colors[colorIndex].sizes || []).filter(s => s !== size),
            };
            return { ...prev, colors };
        });
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;

        // Validate file size (max 5MB)
        const MAX_SIZE_MB = 5;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`La imagen es muy grande (máx. ${MAX_SIZE_MB}MB). Comprimí la imagen e intentá de nuevo.`);
            return;
        }

        setUploadingColor(index);
        try {
            const url = await uploadProductImage(file);
            updateColor(index, 'image', url);
        } catch (err) {
            setError('Error al subir imagen: ' + err.message);
        }
        setUploadingColor(null);
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.name.trim()) return setError('El nombre es obligatorio.');
        if (!form.price.trim()) return setError('El precio es obligatorio.');
        if (form.colors.length === 0) return setError('Agregá al menos un color.');
        if (form.colors.some(c => !c.name.trim())) return setError('Todos los colores deben tener nombre.');

        setSaving(true);
        setError('');

        try {
            const payload = {
                name: form.name.trim().toUpperCase(),
                category: form.category,
                price: form.price.trim().startsWith('$') ? form.price.trim() : `$${form.price.trim()}`,
                colors: form.colors.map(c => ({
                    name: c.name.trim().toUpperCase(),
                    image: c.image || '',
                    ...(c.images ? { images: c.images } : {}),
                    outOfStock: c.outOfStock || false,
                    ...(c.sizes && c.sizes.length > 0 ? { sizes: c.sizes } : {}),
                })),
            };

            if (isEdit) {
                await updateProduct(product.id, payload);
            } else {
                await createProduct(payload);
            }

            onSave();
        } catch (err) {
            setError('Error al guardar: ' + err.message);
        }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <div className="max-w-2xl mx-auto p-6 md:p-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <p className="text-sm text-white/40 mt-0.5">{isEdit ? `Editando: ${product.name}` : 'Completá la información'}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-6">

                    {/* Name */}
                    <div>
                        <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Nombre del producto</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="ej: TOP EMMA"
                            className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                        />
                    </div>

                    {/* Category + Price row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Categoría</label>
                            <select
                                value={form.category}
                                onChange={(e) => updateField('category', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3.5 rounded-xl outline-none cursor-pointer"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c} className="bg-[#0f0f18]">{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Precio</label>
                            <input
                                type="text"
                                value={form.price}
                                onChange={(e) => updateField('price', e.target.value)}
                                placeholder="$15900"
                                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                            />
                        </div>
                    </div>

                    {/* Colors Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Colores / Variantes</label>
                            <button
                                onClick={addColor}
                                className="text-xs text-white/50 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                Agregar Color
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {form.colors.map((color, ci) => (
                                <div key={ci} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                    <div className="flex gap-3 items-start">
                                        {/* Image preview / upload */}
                                        <div
                                            onClick={() => { fileInputRef.current?.setAttribute('data-index', ci); fileInputRef.current?.click(); }}
                                            className="w-16 h-20 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 cursor-pointer hover:border-white/20 transition-colors flex items-center justify-center relative group"
                                        >
                                            {uploadingColor === ci ? (
                                                <svg className="animate-spin text-white/40" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                            ) : color.image ? (
                                                <>
                                                    <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-white/20">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                                    <span className="text-[8px]">Subir</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Color name + stock toggle */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={color.name}
                                                    onChange={(e) => updateColor(ci, 'name', e.target.value)}
                                                    placeholder="Nombre del color"
                                                    className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-lg outline-none focus:border-white/20 transition-colors placeholder:text-white/20"
                                                />
                                                <button
                                                    onClick={() => updateColor(ci, 'outOfStock', !color.outOfStock)}
                                                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap ${color.outOfStock
                                                        ? 'border-red-500/30 bg-red-500/10 text-red-300'
                                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                                    }`}
                                                >
                                                    {color.outOfStock ? 'Sin Stock' : 'En Stock'}
                                                </button>
                                                {form.colors.length > 1 && (
                                                    <button
                                                        onClick={() => removeColor(ci)}
                                                        className="text-white/20 hover:text-red-400 transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Sizes */}
                                            <div className="flex items-center flex-wrap gap-1.5">
                                                {(color.sizes || []).map(size => (
                                                    <span key={size} className="flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/60">
                                                        {size}
                                                        <button onClick={() => removeSize(ci, size)} className="text-white/30 hover:text-red-400">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={newSizeInputs[ci] || ''}
                                                        onChange={(e) => setNewSizeInputs(prev => ({ ...prev, [ci]: e.target.value }))}
                                                        onKeyDown={(e) => e.key === 'Enter' && addSize(ci)}
                                                        placeholder="Talle"
                                                        className="w-16 bg-white/5 border border-white/10 text-white text-[11px] px-2 py-1 rounded-md outline-none focus:border-white/20 placeholder:text-white/20"
                                                    />
                                                    <button
                                                        onClick={() => addSize(ci)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const ci = parseInt(fileInputRef.current?.getAttribute('data-index') || '0');
                            handleImageUpload(ci, e.target.files?.[0]);
                            e.target.value = ''; // Reset for re-upload
                        }}
                    />

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-xl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-1 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Guardando...
                                </>
                            ) : (
                                isEdit ? 'Guardar Cambios' : 'Crear Producto'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
