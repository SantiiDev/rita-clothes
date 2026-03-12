import { useState } from 'react';
import { supabase } from '../lib/supabase';

const EyeIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {open ? (
            <>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        )}
    </svg>
);

const Spinner = () => (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

// Mode can be: 'login' | 'register' | 'forgot' | 'check-email' | 'check-reset'
export default function AuthModal({ isOpen, onClose, onAuth }) {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (error) setError('');
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
        setFormData({ name: '', email: '', password: '' });
        setShowPassword(false);
    };

    const translateError = (msg) => {
        if (!msg) return 'Ocurrió un error inesperado.';
        if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
        if (msg.includes('Email not confirmed')) return 'Confirmá tu correo antes de iniciar sesión.';
        if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese correo.';
        if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
        if (msg.includes('Unable to validate email')) return 'El correo ingresado no es válido.';
        if (msg.includes('For security purposes')) return 'Esperá unos segundos antes de intentarlo de nuevo.';
        if (msg.includes('Email rate limit')) return 'Demasiados intentos. Esperá unos minutos.';
        return msg;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = formData;
        if (!email.trim() || !password.trim()) {
            setError('Completá todos los campos.');
            return;
        }
        setLoading(true);
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (err) { setError(translateError(err.message)); return; }

        // Get name from metadata or profile
        const name = data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'Usuario';
        onAuth({ name, email: data.user.email, id: data.user.id });
        onClose();
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { name, email, password } = formData;
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Completá todos los campos.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setLoading(true);
        const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
        });
        setLoading(false);
        if (err) { setError(translateError(err.message)); return; }

        setMode('check-email');
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        const { email } = formData;
        if (!email.trim()) {
            setError('Ingresá tu correo electrónico.');
            return;
        }
        setLoading(true);
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });
        setLoading(false);
        if (err) { setError(translateError(err.message)); return; }
        setMode('check-reset');
    };

    const renderContent = () => {
        // ── Success: check email for confirmation ──────────────────────────
        if (mode === 'check-email') {
            return (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                            <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            <path d="m16 19 2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-textDark mb-2">¡Revisá tu correo!</h3>
                    <p className="text-sm text-textDark/70 mb-6 leading-relaxed">
                        Te enviamos un enlace de confirmación a <span className="font-semibold text-primary">{formData.email}</span>.<br />
                        Hacé click en el enlace para activar tu cuenta.
                    </p>
                    <button
                        onClick={() => switchMode('login')}
                        className="w-full bg-primary text-white font-semibold py-3.5 rounded-full transition-all hover:bg-primary/80 active:scale-95"
                    >
                        Volver a Iniciar Sesión
                    </button>
                </div>
            );
        }

        // ── Success: check email for reset ────────────────────────────────
        if (mode === 'check-reset') {
            return (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                            <rect width="16" height="13" x="6" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-textDark mb-2">Correo enviado</h3>
                    <p className="text-sm text-textDark/70 mb-6 leading-relaxed">
                        Si <span className="font-semibold text-primary">{formData.email}</span> está registrado, te enviamos las instrucciones para restablecer la contraseña.
                    </p>
                    <button
                        onClick={() => switchMode('login')}
                        className="w-full bg-primary text-white font-semibold py-3.5 rounded-full transition-all hover:bg-primary/80 active:scale-95"
                    >
                        Volver a Iniciar Sesión
                    </button>
                </div>
            );
        }

        // ── Forgot password ───────────────────────────────────────────────
        if (mode === 'forgot') {
            return (
                <>
                    <div className="text-center mb-6">
                        <h3 className="text-base font-bold text-textDark">Restablecer contraseña</h3>
                        <p className="text-xs text-textDark/60 mt-1">Te enviaremos un enlace a tu correo</p>
                    </div>
                    <form onSubmit={handleForgot} className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={handleChange('email')}
                            className="w-full bg-surface text-sm px-4 py-3.5 rounded-xl outline-none border border-gray-200 focus:border-primary transition-colors"
                            autoComplete="email"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-xs text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-semibold py-3.5 rounded-full mt-1 transition-all hover:bg-primary/80 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Spinner /> Enviando...</> : 'Enviar enlace'}
                        </button>
                    </form>
                    <button
                        onClick={() => switchMode('login')}
                        className="mt-4 w-full text-center text-xs text-textDark hover:text-primary transition-colors"
                    >
                        ← Volver a iniciar sesión
                    </button>
                </>
            );
        }

        // ── Login / Register tabs ─────────────────────────────────────────
        return (
            <>
                {/* Tabs */}
                <div className="flex bg-surface rounded-full p-1 mb-6">
                    <button
                        onClick={() => switchMode('login')}
                        className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-textDark hover:text-primary'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => switchMode('register')}
                        className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-textDark hover:text-primary'}`}
                    >
                        Registrarse
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-3">
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={formData.name}
                            onChange={handleChange('name')}
                            className="w-full bg-surface text-sm px-4 py-3.5 rounded-xl outline-none border border-gray-200 focus:border-primary transition-colors"
                            autoComplete="name"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={handleChange('email')}
                        className="w-full bg-surface text-sm px-4 py-3.5 rounded-xl outline-none border border-gray-200 focus:border-primary transition-colors"
                        autoComplete="email"
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleChange('password')}
                            className="w-full bg-surface text-sm px-4 py-3.5 pr-12 rounded-xl outline-none border border-gray-200 focus:border-primary transition-colors"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                            tabIndex={-1}
                        >
                            <EyeIcon open={showPassword} />
                        </button>
                    </div>

                    {mode === 'login' && (
                        <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="self-end text-xs text-textDark hover:text-primary transition-colors -mt-1"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    )}

                    {error && (
                        <p className="text-red-500 text-xs text-center bg-red-50 py-2 px-3 rounded-lg border border-red-100">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-semibold py-3.5 rounded-full mt-1 transition-all hover:bg-primary/80 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading
                            ? <><Spinner /> {mode === 'login' ? 'Ingresando...' : 'Creando cuenta...'}</>
                            : mode === 'login' ? 'Ingresar' : 'Crear Cuenta'
                        }
                    </button>
                </form>

                {mode === 'register' && (
                    <p className="text-center text-[11px] text-textDark/50 mt-4 leading-relaxed">
                        Al registrarte aceptás recibir novedades de Rita.<br />Podés darte de baja cuando quieras.
                    </p>
                )}
            </>
        );
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal — slides up on mobile, centers on desktop */}
            <div
                className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-sm p-8 pb-10 sm:pb-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                </button>

                {/* Logo */}
                {mode !== 'check-email' && mode !== 'check-reset' && (
                    <div className="text-center mb-6">
                        <img src="/favicon.jpg" alt="Rita" className="w-10 h-10 rounded-full object-cover mx-auto mb-3" />
                        <h2 className="text-xl font-bold font-heading text-primary">Rita</h2>
                        <p className="text-xs text-textDark/60 mt-1">
                            {mode === 'login' && 'Bienvenida de vuelta'}
                            {mode === 'register' && 'Creá tu cuenta y obtené 10% OFF'}
                            {mode === 'forgot' && 'Recuperá tu acceso'}
                        </p>
                    </div>
                )}

                {renderContent()}
            </div>
        </div>
    );
}
