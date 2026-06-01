import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Zap, BookOpen, Mic, Heart, Shield, Download, Star } from 'lucide-react';
import { Button } from '../components/Button';

interface SubscribeProps {
    isSubscribed: boolean;
    onSubscribe: () => void;
}

const PREMIUM_FEATURES = [
    { icon: BookOpen, text: 'Kamus AI tanpa batas', description: 'Terjemahkan kata sebanyak apapun tanpa limit harian' },
    { icon: Mic, text: 'Latihan pengucapan unlimited', description: 'Evaluasi AI untuk aksen tanpa batasan' },
    { icon: Zap, text: 'Cerita & TTS tanpa batas', description: 'Generate hikayat dan dengarkan audio AI sepuasnya' },
    { icon: Heart, text: 'Hearts unlimited', description: 'Tidak perlu tunggu refill, belajar terus tanpa henti' },
    { icon: Star, text: 'Bonus XP 2x', description: 'Dapatkan double XP untuk setiap aktivitas belajar' },
    { icon: Download, text: 'Mode offline', description: 'Akses lesson dan kamus yang sudah di-cache tanpa internet' },
    { icon: Shield, text: 'Tanpa iklan', description: 'Pengalaman belajar bersih tanpa gangguan' },
    { icon: Crown, text: 'Badge Premium eksklusif', description: 'Lencana khusus yang menunjukkan status premium' },
];

export const Subscribe: React.FC<SubscribeProps> = ({ isSubscribed, onSubscribe }) => {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubscribe = () => {
        setProcessing(true);
        // Simulate payment processing
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
            onSubscribe();
        }, 1500);
    };

    if (success || isSubscribed) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 text-center">
                <div className="w-24 h-24 bg-[#FFF9E5] rounded-full flex items-center justify-center mb-6 border-4 border-[#ffc800]">
                    <Crown className="w-12 h-12 text-[#ffc800]" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
                    {success ? 'Selamat! 🎉' : 'Kamu Premium!'}
                </h1>
                <p className="text-gray-600 font-medium mb-8">
                    {success 
                        ? 'Langganan premium berhasil diaktifkan. Nikmati semua fitur tanpa batas!'
                        : 'Kamu sudah menikmati semua fitur premium HabaGet.'
                    }
                </p>
                <Button onClick={() => navigate('/')} fullWidth>
                    Kembali ke Home
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto pb-24 bg-background">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#ffc800] to-[#ff9500] px-6 pt-6 pb-16 rounded-b-[2.5rem]">
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/80 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/40">
                        <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">HabaGet Premium</h1>
                    <p className="text-white/90 font-medium">Belajar tanpa batas, progress tanpa henti</p>
                </div>
            </div>

            <div className="px-5 -mt-8 relative z-10">
                {/* Price Card */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
                    <div className="text-center mb-4">
                        <div className="flex items-baseline justify-center">
                            <span className="text-sm font-bold text-gray-400 mr-1">Rp</span>
                            <span className="text-5xl font-extrabold text-gray-800">59.999</span>
                            <span className="text-gray-500 font-bold ml-1">/bulan</span>
                        </div>
                        <p className="text-sm text-gray-400 font-medium mt-2">Batal kapan saja • Tanpa kontrak</p>
                    </div>

                    <Button 
                        fullWidth 
                        size="lg" 
                        onClick={handleSubscribe}
                        disabled={processing}
                        className="bg-gradient-to-r from-[#ffc800] to-[#ff9500] border-none text-white shadow-lg"
                    >
                        {processing ? 'Memproses...' : 'Langganan Sekarang'}
                    </Button>
                </div>

                {/* Features List */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-extrabold text-gray-800 text-lg mb-5 flex items-center">
                        <Zap className="w-5 h-5 text-[#ffc800] mr-2" />
                        Fitur Premium
                    </h2>
                    <div className="space-y-5">
                        {PREMIUM_FEATURES.map((feature, idx) => (
                            <div key={idx} className="flex items-start">
                                <div className="w-10 h-10 bg-[#FFF9E5] rounded-xl flex items-center justify-center mr-4 shrink-0">
                                    <feature.icon className="w-5 h-5 text-[#ffc800]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-extrabold text-gray-800 text-sm">{feature.text}</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{feature.description}</p>
                                </div>
                                <Check className="w-5 h-5 text-[#ffc800] shrink-0 mt-0.5" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparison */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-extrabold text-gray-800 text-lg mb-4">Gratis vs Premium</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Kamus AI</span>
                            <div className="flex gap-8">
                                <span className="text-xs font-bold text-gray-400 w-16 text-center">50/hari</span>
                                <span className="text-xs font-bold text-[#ffc800] w-16 text-center">Unlimited</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Pengucapan</span>
                            <div className="flex gap-8">
                                <span className="text-xs font-bold text-gray-400 w-16 text-center">5/hari</span>
                                <span className="text-xs font-bold text-[#ffc800] w-16 text-center">Unlimited</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Cerita AI</span>
                            <div className="flex gap-8">
                                <span className="text-xs font-bold text-gray-400 w-16 text-center">3/hari</span>
                                <span className="text-xs font-bold text-[#ffc800] w-16 text-center">Unlimited</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Hearts</span>
                            <div className="flex gap-8">
                                <span className="text-xs font-bold text-gray-400 w-16 text-center">5 max</span>
                                <span className="text-xs font-bold text-[#ffc800] w-16 text-center">∞</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-gray-600">Bonus XP</span>
                            <div className="flex gap-8">
                                <span className="text-xs font-bold text-gray-400 w-16 text-center">1x</span>
                                <span className="text-xs font-bold text-[#ffc800] w-16 text-center">2x</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium text-gray-600">Offline mode</span>
                            <div className="flex gap-8">
                                <span className="text-xs font-bold text-gray-400 w-16 text-center">—</span>
                                <span className="text-xs font-bold text-[#ffc800] w-16 text-center">✓</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-2 gap-8">
                        <span className="text-[10px] font-bold text-gray-400 w-16 text-center uppercase">Gratis</span>
                        <span className="text-[10px] font-bold text-[#ffc800] w-16 text-center uppercase">Premium</span>
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
                    <h2 className="font-extrabold text-gray-800 text-lg mb-4">FAQ</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Bisa batal kapan saja?</h3>
                            <p className="text-xs text-gray-500 mt-1">Ya, kamu bisa membatalkan langganan kapan saja tanpa biaya tambahan.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Metode pembayaran apa saja?</h3>
                            <p className="text-xs text-gray-500 mt-1">Transfer bank, e-wallet (GoPay, OVO, Dana), dan kartu kredit/debit.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Ada trial gratis?</h3>
                            <p className="text-xs text-gray-500 mt-1">Fitur gratis sudah cukup lengkap untuk mulai belajar. Premium untuk pengalaman tanpa batas.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
