import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '../components/Button';
import { firebaseAuth, isFirebaseConfigured } from '../services/firebase';

export const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isFirebaseConfigured || !firebaseAuth) {
            setError('Firebase belum dikonfigurasi.');
            return;
        }

        if (!email.trim()) {
            setError('Email wajib diisi.');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(firebaseAuth, email.trim());
            setSent(true);
        } catch (err) {
            if (err instanceof Error) {
                if (err.message.includes('user-not-found')) {
                    setError('Email tidak terdaftar.');
                } else if (err.message.includes('invalid-email')) {
                    setError('Format email tidak valid.');
                } else {
                    setError('Gagal mengirim email reset. Coba lagi.');
                }
            } else {
                setError('Terjadi kesalahan.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 text-center">
                <CheckCircle className="w-20 h-20 text-tertiary mb-6" />
                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Email Terkirim!</h1>
                <p className="text-gray-600 font-medium mb-2">
                    Kami telah mengirim link reset password ke:
                </p>
                <p className="text-primary font-bold mb-8">{email}</p>
                <p className="text-gray-400 text-sm font-medium mb-8">
                    Cek inbox atau folder spam. Link berlaku selama 1 jam.
                </p>
                <Button onClick={() => navigate('/login')} fullWidth>
                    Kembali ke Login
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white p-6">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate('/login')} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="w-16 h-16 bg-primaryLight rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Lupa Password?</h1>
            <p className="text-gray-500 mb-8 font-medium">
                Masukkan email yang terdaftar. Kami akan mengirim link untuk reset password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
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

                <div className="pt-4">
                    <Button type="submit" fullWidth size="lg" disabled={loading}>
                        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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
                    Ingat password?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-primary hover:underline"
                    >
                        Masuk
                    </button>
                </p>
            </div>
        </div>
    );
};
