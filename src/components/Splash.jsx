import { useState } from 'react';

export default function Splash({ onNavigate, setUserName, isReturningUser }) {
    const [nameInputValue, setNameInputValue] = useState('');
    const [error, setError] = useState('');

    const handleContinue = () => {
        if (isReturningUser) {
            onNavigate();
            return;
        }
        if (!nameInputValue.trim()) {
            setError('Por favor, ingresa tu nombre');
            return;
        }
        setUserName(nameInputValue.trim());
        onNavigate();
    };
    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-background text-textMain relative">

            {/* Left Content Area (Top on Mobile) */}
            <div className="flex flex-col flex-1 p-6 md:p-12 lg:p-20 justify-center z-10 w-full md:w-1/2 lg:w-5/12">
                <div className="mt-auto md:mt-0 mb-6">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-semibold leading-tight mb-4 text-center md:text-left">
                        ¡Bienvenida a Rita!
                    </h2>
                    <p className="text-textDark font-heading text-sm md:text-base text-center md:text-left mb-10 px-4 md:px-0 max-w-md mx-auto md:mx-0">
                        Prendas pensadas para noches inolvidables.
                    </p>

                    <div className="flex flex-col gap-4 w-full md:w-auto mx-auto md:mx-0">
                        {!isReturningUser && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="¿Cuál es tu nombre?"
                                    value={nameInputValue}
                                    onChange={(e) => {
                                        setNameInputValue(e.target.value);
                                        if (error) setError('');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleContinue();
                                    }}
                                    className="w-full bg-white text-black border-2 border-transparent focus:border-accent text-sm md:text-base px-6 py-4 rounded-full outline-none transition-all shadow-sm"
                                />
                                {error && <p className="text-red-500 text-xs mt-2 pl-4">{error}</p>}
                            </div>
                        )}

                        <button
                            onClick={handleContinue}
                            className="btn-slide-hover w-full md:px-12 bg-primary text-white font-heading font-semibold py-4 rounded-full flex items-center justify-center gap-2 duration-300"
                        >
                            Descubrí tu próximo look
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14m-7-7 7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Image Area (Middle on Mobile) */}
            <div className="flex-grow md:flex-1 relative order-first md:order-last min-h-[40vh] md:min-h-screen">
                <div className="absolute inset-0 bg-surface overflow-hidden flex items-center justify-center">
                    <span className="text-textDark font-data text-xs md:text-sm uppercase tracking-widest rotate-90 md:rotate-0 opacity-40">
                        Imagen Principal
                    </span>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-10 left-10 hidden md:flex flex-col items-center z-20">
                    <span className="font-data text-xs tracking-widest text-textDark/50 mb-4 rotate-[-90deg]">SS/26</span>
                </div>
                <div className="absolute bottom-10 inset-x-0 md:hidden text-center flex flex-col items-center">
                    <span className="font-data text-[10px] tracking-widest text-textDark/50 mb-4 rotate-90">SS/26</span>
                </div>
            </div>

        </div>
    );
}

