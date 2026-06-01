import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { AuthCredentials } from '../types';

interface AuthProps {
    type: 'login' | 'register';
    onSuccess: (credentials: AuthCredentials) => Promise<void> | void;
    onGoogleSignIn?: () => Promise<void>;
}

/**
 * Convert Firebase error codes to user-friendly Indonesian messages.
 */
function getAuthErrorMessage(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        return 'Email atau kata sandi salah. Periksa kembali dan coba lagi.';
    }
    if (msg.includes('auth/email-already-in-use')) {
        return 'Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.';
    }
    if (msg.includes('auth/weak-password')) {
        return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
    }
    if (msg.includes('auth/invalid-email')) {
        return 'Format email tidak valid.';
    }
    if (msg.includes('auth/too-many-requests')) {
        return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
    }
    if (msg.includes('auth/network-request-failed')) {
        return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
        return 'Login dibatalkan. Silakan coba lagi.';
    }
    if (msg.includes('auth/account-exists-with-different-credential')) {
        return 'Akun dengan email ini sudah ada menggunakan metode login lain.';
    }
    if (msg.includes('auth/operation-not-allowed')) {
        return 'Metode login ini belum diaktifkan. Hubungi admin.';
    }

    return 'Terjadi kesalahan. Silakan coba lagi.';
}

export const Auth: React.FC<AuthProps> = ({ type, onSuccess, onGoogleSignIn }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSuccess({
                type,
                name: name.trim() || email.split('@')[0] || 'Pengguna',
                email: email.trim(),
                password,
            });
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!onGoogleSignIn) return;
        setError('');
        setGoogleLoading(true);

        try {
            await onGoogleSignIn();
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white p-6">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
                {type === 'login' ? 'Masuk' : 'Buat Profil'}
            </h1>
            <p className="text-gray-500 mb-6 font-medium">
                {type === 'login' ? 'Senang melihatmu kembali!' : 'Mulai perjalanan bahasamu.'}
            </p>

            {/* Google Sign-In Button */}
            {onGoogleSignIn && (
                <>
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl p-4 font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {googleLoading ? 'Memproses...' : (type === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google')}
                    </button>

                    <div className="flex items-center my-5">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-4 text-sm font-bold text-gray-400">atau</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                {type === 'register' && (
                    <div>
                        <input 
                            type="text" 
                            placeholder="Nama Lengkap" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl p-4 text-lg font-bold focus:outline-none focus:border-primary focus:bg-white transition-colors"
                        />
                    </div>
                )}
                <div>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl p-4 text-lg font-bold focus:outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                </div>
                <div>
                    <input 
                        type="password" 
                        placeholder="Kata Sandi (min. 6 karakter)" 
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl p-4 text-lg font-bold focus:outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" fullWidth size="lg" disabled={loading || googleLoading}>
                        {loading ? 'Memproses...' : (type === 'login' ? 'Masuk' : 'Daftar')}
                    </Button>
                </div>

                {error && (
                    <p className="text-dangerDark font-bold text-sm text-center bg-red-50 rounded-2xl p-3 border border-red-100">
                        {error}
                    </p>
                )}
            </form>

            <div className="text-center mt-8">
                <p className="text-gray-500 font-bold text-sm">
                    {type === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                    <button 
                        onClick={() => navigate(type === 'login' ? '/register' : '/login')}
                        className="text-primary hover:underline"
                    >
                        {type === 'login' ? 'Daftar' : 'Masuk'}
                    </button>
                </p>
                {type === 'login' && (
                    <p className="text-gray-400 font-bold text-sm mt-3">
                        <button 
                            onClick={() => navigate('/forgot-password')}
                            className="text-gray-500 hover:text-primary hover:underline"
                        >
                            Lupa password?
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};
