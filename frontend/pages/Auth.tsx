import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

interface AuthProps {
    type: 'login' | 'register';
    onSuccess: (name: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ type, onSuccess }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        if (type === 'login') {
            onSuccess(email.split('@')[0] || 'Pengguna');
        } else {
            onSuccess(name || 'Pengguna Baru');
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
            <p className="text-gray-500 mb-8 font-medium">
                {type === 'login' ? 'Senang melihatmu kembali!' : 'Mulai perjalanan bahasamu.'}
            </p>

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
                        placeholder="Kata Sandi" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl p-4 text-lg font-bold focus:outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" fullWidth size="lg">
                        {type === 'login' ? 'Masuk' : 'Daftar'}
                    </Button>
                </div>
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
            </div>
        </div>
    );
};
