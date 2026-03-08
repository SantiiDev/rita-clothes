import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onAuth }) {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'register') {
            if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
                setError('Completá todos los campos');
                return;
            }
            if (formData.password.length < 4) {
                setError('La contraseña debe tener al menos 4 caracteres');
                return;
            }
            // Save user in localStorage
            const users = JSON.parse(localStorage.getItem('rita_users') || '[]');
            if (users.find(u => u.email === formData.email)) {
                setError('Ya existe una cuenta con ese correo');
                return;
            }
            users.push({ name: formData.name, email: formData.email, password: formData.password });
            localStorage.setItem('rita_users', JSON.stringify(users));
            localStorage.setItem('rita_authUser', JSON.stringify({ name: formData.name, email: formData.email }));
            onAuth({ name: formData.name, email: formData.email });
            onClose();
        } else {
            if (!formData.email.trim() || !formData.password.trim()) {
                setError('Completá todos los campos');
                return;
            }
            const users = JSON.parse(localStorage.getItem('rita_users') || '[]');
            const user = users.find(u => u.email === formData.email && u.password === formData.password);
            if (!user) {
                setError('Correo o contraseña incorrectos');
                return;
            }
            localStorage.setItem('rita_authUser', JSON.stringify({ name: user.name, email: user.email }));
            onAuth({ name: user.name, email: user.email });
            onClose();
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
        setFormData({ name: '', email: '', password: '' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                {/* Logo */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold font-heading text-primary">Rita</h2>
                    <p className="text-sm text-textDark mt-1">
                        {mode === 'login' ? 'Bienvenida de vuelta' : 'Creá tu cuenta'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-surface rounded-full p-1 mb-6">
                    <button
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-textDark'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-textDark'}`}
                    >
                        Registrarse
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-surface text-sm px-4 py-3.5 rounded-xl outline-none border border-gray-200 focus:border-accent transition-colors"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-surface text-sm px-4 py-3.5 rounded-xl outline-none border border-gray-200 focus:border-accent transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full bg-surface text-sm px-4 py-3.5 rounded-xl outline-none border border-gray-200 focus:border-accent transition-colors"
                    />

                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                    <button
                        type="submit"
                        className="btn-slide-hover w-full bg-primary text-white font-semibold py-3.5 rounded-full mt-2 transition-colors"
                    >
                        {mode === 'login' ? 'Ingresar' : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="text-center text-xs text-textDark mt-5">
                    {mode === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
                    <button onClick={switchMode} className="text-primary font-semibold hover:underline">
                        {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
}
