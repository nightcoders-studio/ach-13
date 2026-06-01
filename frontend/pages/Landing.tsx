import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, GraduationCap } from 'lucide-react';
import { Button } from '../components/Button';

export const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto bg-background flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                
                {/* SVG Logo HabaGet (Recreated to match the provided screenshot) */}
                <svg viewBox="0 0 240 200" className="w-48 h-auto mb-4 drop-shadow-xl transform hover:scale-105 transition-transform duration-300">
                    {/* Speech Bubble */}
                    <path d="M20 30 C20 15 30 5 45 5 L195 5 C210 5 220 15 220 30 L220 130 C220 145 210 155 195 155 L70 155 L40 185 L45 155 C30 150 20 140 20 125 Z" fill="#534AB7" />
                    
                    {/* Rencong Base */}
                    <path d="M50 65 C50 55 60 50 70 55 C80 60 90 55 110 55 C140 55 180 40 200 30 C200 30 195 75 160 105 C130 130 100 120 100 120 C100 120 90 145 75 145 C60 145 65 120 70 110 C75 100 60 90 50 65 Z" fill="#FBF7F0" />
                    
                    {/* Hilt details */}
                    <path d="M65 60 Q75 70 65 80" stroke="#534AB7" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <circle cx="68" cy="130" r="4" fill="#FBF7F0" stroke="#534AB7" strokeWidth="3"/>

                    {/* Blue Flower */}
                    <g transform="translate(110, 90)">
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#3e368a" transform="rotate(0)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#3e368a" transform="rotate(72)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#3e368a" transform="rotate(144)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#3e368a" transform="rotate(216)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#3e368a" transform="rotate(288)" />
                        <circle cx="0" cy="0" r="4" fill="#FF7052" />
                        <path d="M0 -8 L0 8 M-8 0 L8 0 M-5 -5 L5 5 M-5 5 L5 -5" stroke="#FBF7F0" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Orange Flower */}
                    <g transform="translate(160, 75) scale(0.85)">
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#FF7052" transform="rotate(36)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#FF7052" transform="rotate(108)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#FF7052" transform="rotate(180)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#FF7052" transform="rotate(252)" />
                        <path d="M0 -18 C12 -18 18 -6 0 0 C-18 -6 -12 -18 0 -18 Z" fill="#FF7052" transform="rotate(324)" />
                        <circle cx="0" cy="0" r="4" fill="#FBF7F0" />
                    </g>
                </svg>
                
                <h1 className="text-5xl font-black text-primary mb-4 tracking-tighter lowercase">
                    habaget
                </h1>
                <p className="text-lg text-gray-600 mb-10 font-bold max-w-xs">
                    Meureuno Bahasa Makin Get.
                </p>
                
                <div className="w-full max-w-xs space-y-4">
                    <Button fullWidth size="lg" onClick={() => navigate('/register')}>
                        Mulai Belajar
                    </Button>
                    <Button fullWidth size="lg" variant="outline" onClick={() => navigate('/login')}>
                        Sudah Punya Akun
                    </Button>
                </div>
            </div>

            {/* Features Section */}
            <div className="p-8 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-8">Kenapa HabaGet?</h2>
                
                <div className="space-y-6">
                    <div className="flex items-start">
                        <div className="w-14 h-14 bg-tertiaryLight rounded-2xl flex items-center justify-center shrink-0 mr-4 shadow-sm">
                            <BookOpen className="w-7 h-7 text-tertiary" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-800 text-lg">Kamus AI Interaktif</h3>
                            <p className="text-gray-600 text-sm mt-1 font-medium">Cari kata, dengar pengucapan, dan pahami konteks budaya dengan mudah.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start">
                        <div className="w-14 h-14 bg-secondaryLight rounded-2xl flex items-center justify-center shrink-0 mr-4 shadow-sm">
                            <Trophy className="w-7 h-7 text-secondary" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-800 text-lg">Belajar Seperti Main Game</h3>
                            <p className="text-gray-600 text-sm mt-1 font-medium">Kumpulkan XP, jaga streak harian, dan raih gelar adat Aceh.</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="w-14 h-14 bg-primaryLight rounded-2xl flex items-center justify-center shrink-0 mr-4 shadow-sm">
                            <GraduationCap className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-800 text-lg">Tersedia Paket Les</h3>
                            <p className="text-gray-600 text-sm mt-1 font-medium">Butuh bimbingan? Daftar kelas privat atau grup dengan tutor native.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
