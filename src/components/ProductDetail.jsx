import { useState } from 'react';

export default function ProductDetail({ product, onNavigate, onAddToCart, cartItemCount }) {
    const [quantity, setQuantity] = useState(1);
    const [addedAnimation, setAddedAnimation] = useState(false);

    if (!product) return null;

    const handleAdd = () => {
        onAddToCart(product, quantity);
        setAddedAnimation(true);
        setTimeout(() => setAddedAnimation(false), 2000);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background text-textMain pb-24 md:pb-0 relative">

            {/* Top Header (Mobile & Desktop) */}
            <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 md:p-10 pointer-events-none">
                <button
                    onClick={() => onNavigate('home')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors pointer-events-auto shadow-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <h2 className="font-semibold hidden md:block text-white drop-shadow-md">Detalles del Producto</h2>

                <button
                    onClick={() => onNavigate('cart')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 pointer-events-auto hover:bg-gray-100 transition-colors shadow-sm relative"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white flex items-center justify-center">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Product Image Area (Left col on Desktop) */}
            <div className="w-full md:w-1/2 lg:w-3/5 px-6 pt-24 md:px-0 md:pt-0 mb-8 md:mb-0 relative md:sticky md:top-0 h-auto md:h-screen flex items-center justify-center bg-surface md:bg-transparent">
                <div className="bg-surface rounded-3xl md:rounded-none aspect-[4/5] md:aspect-auto md:h-full w-full relative overflow-hidden flex items-center justify-center">
                    <span className="text-textDark font-data text-xs md:text-xl uppercase opacity-30 tracking-widest rotate-90 md:rotate-0">
                        Imagen de Catálogo
                    </span>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto flex justify-between items-end">
                        <div className="bg-white text-black font-bold text-lg md:text-2xl px-6 py-2 md:py-4 rounded-xl shadow-lg border border-gray-100">
                            {product.price}
                        </div>
                    </div>

                    {/* Vertical Text */}
                    <div className="absolute right-0 bottom-10 text-black font-data text-[10px] md:text-xs uppercase font-bold tracking-widest rotate-90 mb-10 mr-4 md:mr-10 opacity-50">
                        Rita
                    </div>
                </div>
            </div>

            {/* Right Column: Info & Actions */}
            <div className="px-6 md:p-12 lg:p-20 flex flex-col flex-grow md:w-1/2 lg:w-2/5 md:overflow-y-auto pt-4 md:pt-32">
                <div className="flex flex-col md:flex-row md:justify-between items-start mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-heading mb-3 md:mb-0 leading-tight">
                        {product.name}
                    </h1>
                </div>

                <div className="flex items-center gap-3 mb-8 md:mb-12">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white shadow-md">R</div>
                    <span className="text-sm text-textDark font-medium">Rita Oficial</span>
                </div>

                <h3 className="font-semibold text-lg md:text-xl mb-4 text-primary">Descripción:</h3>
                <p className="text-sm md:text-base text-textDark leading-relaxed mb-12">
                    Prenda exclusiva diseñada para deslumbrar en tus eventos de noche.
                    Combina cortes modernos con acabados premium. Ya sea para expresar
                    tu estado de ánimo, promocionar tu estilo personal o simplemente para destacar — Rita te permite dominar la noche con elegancia absoluta.
                </p>

                {/* Action Bar - Inline on Desktop, Fixed bottom on Mobile */}
                <div className="fixed md:static bottom-0 left-0 right-0 max-w-md md:max-w-none mx-auto w-full md:w-auto bg-background md:bg-transparent p-6 md:p-0 border-t md:border-t-0 border-gray-100 flex md:flex-row gap-4 items-center z-50 md:mt-auto">
                    <div className="flex-1 md:flex-none md:w-40 bg-primary shadow-xl md:shadow-none rounded-full flex items-center justify-between px-6 py-4 md:py-5 text-white">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="text-textDark hover:text-white pb-1 transition-colors"
                            disabled={quantity <= 1}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                        </button>

                        <span className="font-heading font-semibold text-lg md:text-xl w-8 text-center">{quantity}</span>

                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="text-white hover:text-white/60 transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        </button>
                    </div>

                    <button
                        onClick={handleAdd}
                        className={`flex-1 md:flex-auto font-semibold text-lg shadow-xl md:shadow-none rounded-full py-4 md:py-5 md:px-10 flex items-center justify-center gap-3 transition-colors duration-300
               ${addedAnimation ? 'bg-green-500 text-white' : 'btn-slide-hover bg-accent md:bg-primary text-black md:text-white'}
             `}
                    >
                        {addedAnimation ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                <span>Agregado!</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                <span>Añadir</span>
                            </>
                        )}
                    </button>
                </div>

            </div>

        </div>
    );
}
