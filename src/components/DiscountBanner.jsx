export default function DiscountBanner({ isOpen, onRegister, onDismiss }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4" onClick={onDismiss}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Banner */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative accent bar */}
                <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full" />

                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D369CD" strokeWidth="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                    </div>
                </div>

                <h3 className="text-xl font-bold font-heading text-center mb-2">¡Tu primer look tiene 10% OFF!</h3>
                <p className="text-sm text-textDark text-center mb-8 leading-relaxed">
                    Registrate y obtené el descuento para usar en tu primera compra.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onRegister}
                        className="btn-slide-hover w-full bg-primary text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                        Registrarme
                    </button>
                    <button
                        onClick={onDismiss}
                        className="w-full text-textDark font-medium py-3 rounded-full hover:bg-surface transition-colors text-sm"
                    >
                        Más tarde
                    </button>
                </div>
            </div>
        </div>
    );
}
