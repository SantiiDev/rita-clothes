export default function Cart({ cartItems, onUpdateQuantity, onNavigate }) {
    // Calculate subtotal
    const subtotal = cartItems.reduce((acc, item) => {
        // Basic price parsing (remove $ and convert to number)
        // Assumes price format like "$56"
        const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return acc + (priceNum * item.quantity);
    }, 0);

    // Instagram message template
    const generateIGMessage = () => {
        let msg = "¡Hola Rita Clothes! Me gustaría pedir lo siguiente:\n\n";
        cartItems.forEach(item => {
            msg += `- ${item.quantity}x ${item.name} (${item.price})\n`;
        });
        msg += `\nSubtotal estimado: $${subtotal.toFixed(2)}`;
        return encodeURIComponent(msg);
    };

    const instagramLink = `https://ig.me/m/ritaclothess_?text=${generateIGMessage()}`;
    // Fallback direct link since ig.me sometimes requires specific app handling or setup
    const directLink = "https://www.instagram.com/ritaclothess_/";

    return (
        <div className="flex flex-col min-h-[100dvh] bg-surface text-textMain pb-24 md:pb-0 relative animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <header className="flex items-center p-6 md:p-10 bg-white border-b border-gray-100 sticky top-0 z-20">
                <button
                    onClick={() => onNavigate('home')}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-surface transition-colors mr-4"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <h1 className="text-xl md:text-2xl font-bold font-heading">Tu Carrito</h1>
                <span className="ml-auto bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    {cartItems.length} items
                </span>
            </header>

            {/* Cart Content */}
            <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-6 md:p-10">

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-textDark">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Tu carrito está vacío</h2>
                        <p className="text-textDark mb-8">Descubre la nueva colección de noche y encuentra tu look ideal.</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="btn-slide-hover bg-accent md:bg-primary text-black md:text-white font-semibold px-8 py-3 rounded-full transition-colors"
                        >
                            Explorar Catálogo
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                        {/* Items List */}
                        <div className="flex-1 flex flex-col gap-4 md:gap-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-50 flex gap-4 md:gap-6 items-center">

                                    {/* Thumbnail */}
                                    <div className="w-20 h-24 md:w-28 md:h-32 bg-surface rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                        <span className="text-textDark font-data text-[8px] md:text-[10px] uppercase opacity-40 rotate-90 absolute">Prenda {item.id}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-sm md:text-base pr-4 leading-tight">{item.name}</h3>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, 0)}
                                                className="text-textDark hover:text-red-500 transition-colors p-1"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-xs md:text-sm text-textDark mb-3 md:mb-4">{item.price}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-surface w-fit px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                className="text-textDark hover:text-black transition-colors"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                                            </button>
                                            <span className="font-bold text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                className="text-textDark hover:text-black transition-colors"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* Order Summary (Sticky on Desktop) */}
                        <div className="lg:w-80 xl:w-96">
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-gray-100 lg:sticky lg:top-32">
                                <h3 className="text-lg font-bold mb-6 font-heading">Resumen del Pedido</h3>

                                <div className="flex flex-col gap-4 text-sm mb-6 border-b border-gray-100 pb-6">
                                    <div className="flex justify-between text-textDark">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-textDark">
                                        <span>Envío</span>
                                        <span>Calculado por IG</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8">
                                    <span className="font-bold text-lg">Total Estimado</span>
                                    <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                                </div>

                                {/* Primary CTA */}
                                <a
                                    href={directLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-slide-hover w-full bg-accent md:bg-primary text-black md:text-white font-semibold text-center text-lg shadow-lg shadow-black/20 rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                    Pedir por Instagram
                                </a>

                                <p className="text-center text-xs text-textDark mt-4 px-4 leading-relaxed">
                                    Al hacer clic, se abrirá nuestro Instagram. Envíanos un mensaje con tu carrito para coordinar el pago y envío.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </main>

        </div>
    );
}
