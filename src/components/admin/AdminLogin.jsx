import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const ADMIN_EMAIL = 'ritastudio33@gmail.com';

export default function AdminLogin({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Completá todos los campos.');
            return;
        }

        if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
            setError('Acceso denegado. Solo administradores.');
            return;
        }

        setLoading(true);
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });
        setLoading(false);

        if (authErr) {
            if (authErr.message.includes('Invalid login credentials')) {
                setError('Credenciales incorrectas.');
            } else {
                setError('Error de autenticación. Intentá de nuevo.');
            }
            return;
        }

        if (data.user?.email !== ADMIN_EMAIL) {
            await supabase.auth.signOut();
            setError('Acceso denegado.');
            return;
        }

        onLoginSuccess({
            name: data.user.user_metadata?.name || 'Admin',
            email: data.user.email,
            id: data.user.id,
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs text-white/50 font-medium tracking-wider uppercase">Panel Administrativo</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Rita</h1>
                    <p className="text-sm text-white/40">Acceso restringido a administradores</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                placeholder="admin@example.com"
                                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3.5 rounded-xl outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/40 font-medium mb-1.5 block uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3.5 pr-12 rounded-xl outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    tabIndex={-1}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {showPassword ? (
                                            <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>
                                        ) : (
                                            <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-2.5 rounded-lg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl mt-2 transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    Acceder
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-white/20 mt-6">
                    Rita Clothes © {new Date().getFullYear()} · Panel de Control
                </p>
            </div>
        </div>
    );
}
