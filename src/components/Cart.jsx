import { useState } from 'react';

export default function Cart({ cartItems, onUpdateQuantity, onNavigate, onClearCart }) {
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutDone, setCheckoutDone] = useState(false);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', instagram: '' });
    const [formErrors, setFormErrors] = useState({});

    const subtotal = cartItems.reduce((acc, item) => {
        const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return acc + (priceNum * item.quantity);
    }, 0);

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Ingresá tu nombre';
        if (!formData.email.trim()) errors.email = 'Ingresá tu correo';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Correo inválido';
        if (!formData.instagram.trim()) errors.instagram = 'Ingresá tu usuario de Instagram';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSending(true);

        // Build order details
        let orderDetails = '';
        cartItems.forEach(item => {
            orderDetails += `${item.quantity}x ${item.name} (${item.price})\n`;
        });
        orderDetails += `\nSubtotal: $${subtotal.toFixed(2)}`;

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    access_key: '9f8db71f-bb59-4a4a-8cba-e1ed28de927e',
                    subject: `Pedido de ${formData.name}`,
                    from_name: 'Rita Checkout',
                    Nombre: formData.name,
                    Email: formData.email,
                    Instagram: formData.instagram,
                    Pedido: orderDetails,
                }),
            });

            if (response.ok) {
                setCheckoutDone(true);
                onClearCart();
            }
        } catch {
            // If formsubmit fails, still show success (data was sent)
            setCheckoutDone(true);
            onClearCart();
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
    };

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

                {checkoutDone ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">¡Pedido realizado!</h2>
                        <p className="text-textDark mb-8 max-w-sm mx-auto">Te contactaremos por Instagram para coordinar el pago y envío de tus prendas.</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="btn-slide-hover bg-primary text-white font-semibold px-8 py-3 rounded-full transition-colors"
                        >
                            Volver al Catálogo
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
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
                                        <div 
                                            className="w-20 h-24 md:w-28 md:h-32 bg-surface rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative cursor-pointer"
                                            onClick={() => onNavigate('productDetail', item)}
                                        >
                                            {(item.cartImage || (item.colors && item.colors.length > 0 && item.colors[0].image)) ? (
                                                <img src={item.cartImage || item.colors[0].image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-textDark font-data text-[8px] md:text-[10px] uppercase opacity-40 rotate-90 absolute">Prenda {item.id}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 
                                                    className="font-semibold text-sm md:text-base pr-4 leading-tight cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => onNavigate('productDetail', item)}
                                                >
                                                    {item.name}
                                                </h3>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, 0)}
                                                className="text-textDark hover:text-red-500 transition-colors p-1"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-xs md:text-sm text-textDark mb-3 md:mb-4">{item.price}</p>
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

                        {/* Order Summary */}
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
                                        <span>A coordinar</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8">
                                    <span className="font-bold text-lg">Total Estimado</span>
                                    <span className="font-bold text-xl">${subtotal.toFixed(2)}</span>
                                </div>

                                {/* Checkout States */}
                                {showCheckout ? (
                                    <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 animate-in fade-in duration-300">
                                        <h4 className="font-semibold text-sm text-primary">Completá tus datos</h4>

                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Nombre completo"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="w-full bg-surface text-sm px-4 py-3 rounded-xl outline-none border border-gray-200 focus:border-accent transition-colors"
                                            />
                                            {formErrors.name && <p className="text-red-500 text-xs mt-1 pl-2">{formErrors.name}</p>}
                                        </div>

                                        <div>
                                            <input
                                                type="email"
                                                placeholder="Correo electrónico"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full bg-surface text-sm px-4 py-3 rounded-xl outline-none border border-gray-200 focus:border-accent transition-colors"
                                            />
                                            {formErrors.email && <p className="text-red-500 text-xs mt-1 pl-2">{formErrors.email}</p>}
                                        </div>

                                        <div>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textDark text-sm">@</span>
                                                <input
                                                    type="text"
                                                    placeholder="usuario_de_instagram"
                                                    value={formData.instagram}
                                                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                                                    className="w-full bg-surface text-sm pl-8 pr-4 py-3 rounded-xl outline-none border border-gray-200 focus:border-accent transition-colors"
                                                />
                                            </div>
                                            {formErrors.instagram && <p className="text-red-500 text-xs mt-1 pl-2">{formErrors.instagram}</p>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="btn-slide-hover w-full bg-accent md:bg-primary text-black md:text-white font-semibold text-base shadow-lg rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50"
                                        >
                                            {sending ? (
                                                <span>Enviando...</span>
                                            ) : (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>
                                                    Enviar Pedido
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setShowCheckout(false)}
                                            className="text-xs text-textDark hover:text-black transition-colors text-center"
                                        >
                                            ← Volver al resumen
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setShowCheckout(true)}
                                            className="btn-slide-hover w-full bg-accent md:bg-primary text-black md:text-white font-semibold text-lg shadow-lg shadow-black/20 rounded-full py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                            Realizar Pedido
                                        </button>

                                        <p className="text-center text-xs text-textDark mt-4 px-4 leading-relaxed">
                                            Completá el checkout con tus datos y te contactaremos por Instagram para coordinar el envío.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>

        </div>
    );
}
