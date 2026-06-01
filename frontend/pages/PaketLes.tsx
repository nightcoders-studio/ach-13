import React from 'react';
import { GraduationCap, CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

interface PaketLesProps {
    onSubscribe: (paketName: string) => void;
}

export const PaketLes: React.FC<PaketLesProps> = ({ onSubscribe }) => {
    const navigate = useNavigate();
    const packages = [
        {
            id: 'anak',
            title: 'Kelas Anak-anak',
            price: 'Rp 150.000',
            period: '/bulan',
            features: ['Belajar dasar kosakata', 'Bermain sambil belajar', 'Tutor ramah anak', '2x pertemuan/minggu'],
            color: 'bg-blue-50 border-blue-200',
            btnColor: 'primary' as const
        },
        {
            id: 'dewasa',
            title: 'Kelas Dewasa (Grup)',
            price: 'Rp 250.000',
            period: '/bulan',
            features: ['Percakapan sehari-hari', 'Fokus speaking & listening', 'Grup maksimal 5 orang', '2x pertemuan/minggu'],
            color: 'bg-green-50 border-green-200',
            btnColor: 'secondary' as const
        },
        {
            id: 'privat',
            title: 'Kelas Privat',
            price: 'Rp 500.000',
            period: '/bulan',
            features: ['Jadwal fleksibel', 'Materi disesuaikan', '1-on-1 dengan Tutor Native', '4x pertemuan/minggu'],
            color: 'bg-orange-50 border-orange-200',
            btnColor: 'primary' as const
        }
    ];

    const handleWhatsApp = (paket: string) => {
        // Trigger local subscription notification
        onSubscribe(paket);
        
        // Open WhatsApp
        const message = `Halo Admin HabaGet, saya tertarik untuk mendaftar ${paket}. Boleh minta info lebih lanjut?`;
        const url = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-24 bg-background">
            <div className="max-w-md mx-auto space-y-6">
                
                <div className="flex items-center mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 mr-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-extrabold text-gray-800">Kembali</h1>
                </div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Paket Les HabaGet</h1>
                    <p className="text-gray-600 text-sm">
                        Butuh bimbingan langsung? Daftar kelas bersama tutor native speaker kami.
                    </p>
                </div>

                <div className="space-y-4">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className={`rounded-2xl p-6 border-2 ${pkg.color} relative overflow-hidden`}>
                            <h2 className="text-xl font-extrabold text-gray-800 mb-1">{pkg.title}</h2>
                            <div className="flex items-baseline mb-4">
                                <span className="text-2xl font-extrabold text-gray-900">{pkg.price}</span>
                                <span className="text-gray-600 font-bold ml-1">{pkg.period}</span>
                            </div>
                            
                            <ul className="space-y-2 mb-6">
                                {pkg.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start text-sm font-semibold text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-secondary mr-2 shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <Button 
                                variant={pkg.btnColor} 
                                fullWidth 
                                onClick={() => handleWhatsApp(pkg.title)}
                            >
                                <MessageCircle className="w-5 h-5 mr-2" /> Daftar via WhatsApp
                            </Button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
