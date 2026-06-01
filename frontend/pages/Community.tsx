import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';

export const Community: React.FC = () => {
    const navigate = useNavigate();
    const [word, setWord] = useState('');
    const [translation, setTranslation] = useState('');
    const [example, setExample] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        setTimeout(() => {
            setSubmitted(true);
        }, 500);
    };

    if (submitted) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 text-center">
                <CheckCircle className="w-20 h-20 text-secondary mb-6" />
                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Terima Kasih!</h1>
                <p className="text-gray-600 font-medium mb-8">
                    Kosakata yang kamu usulkan telah dikirim dan menunggu validasi dari penutur asli. Kontribusimu sangat berarti!
                </p>
                <Button onClick={() => navigate('/kamus')} fullWidth>Kembali ke Kamus</Button>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-24 bg-background">
            <div className="max-w-md mx-auto">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-extrabold text-gray-800 ml-2">Kontribusi Komunitas</h1>
                </div>

                <div className="bg-tertiaryLight rounded-3xl p-6 mb-8 flex items-start">
                    <Users className="w-8 h-8 text-tertiary mr-4 shrink-0" />
                    <p className="text-tertiaryDark font-medium text-sm">
                        Bantu kami memperkaya kamus HabaGet. Usulkan kata, dialek lokal, atau ungkapan baru yang belum ada.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <label className="block text-sm font-extrabold text-gray-700 mb-2">Kata dalam Bahasa Aceh</label>
                        <input 
                            type="text" 
                            required
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            placeholder="Contoh: Meutuah"
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold focus:outline-none focus:border-tertiary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-gray-700 mb-2">Terjemahan Indonesia</label>
                        <input 
                            type="text" 
                            required
                            value={translation}
                            onChange={(e) => setTranslation(e.target.value)}
                            placeholder="Contoh: Bertuah / Beruntung"
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold focus:outline-none focus:border-tertiary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-extrabold text-gray-700 mb-2">Contoh Kalimat (Opsional)</label>
                        <textarea 
                            value={example}
                            onChange={(e) => setExample(e.target.value)}
                            placeholder="Tuliskan contoh penggunaan kata ini..."
                            rows={3}
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold focus:outline-none focus:border-tertiary transition-colors resize-none"
                        />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" variant="tertiary" fullWidth>Kirim Usulan</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
