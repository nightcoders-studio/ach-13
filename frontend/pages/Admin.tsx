import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, GraduationCap, Plus, Search, MoreVertical } from 'lucide-react';
import { Button } from '../components/Button';

export const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'pengguna' | 'pendaftar'>('dashboard');

    const mockPendaftar = [
        { id: 1, name: 'Budi Santoso', paket: 'Kelas Privat', status: 'Menunggu', date: '12 Okt 2023' },
        { id: 2, name: 'Siti Aminah', paket: 'Kelas Dewasa', status: 'Aktif', date: '10 Okt 2023' },
        { id: 3, name: 'Ahmad', paket: 'Kelas Anak-anak', status: 'Aktif', date: '08 Okt 2023' },
    ];

    const mockPengguna = [
        { id: 1, name: 'Cut Nyak', level: 12, xp: 1250 },
        { id: 2, name: 'Teuku Umar', level: 8, xp: 980 },
        { id: 3, name: 'Agam', level: 4, xp: 450 },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-24 bg-gray-50">
            <div className="max-w-md mx-auto space-y-6">
                
                <div className="flex items-center mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 mr-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-extrabold text-gray-800">Admin Panel</h1>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('pengguna')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'pengguna' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Pengguna
                    </button>
                    <button 
                        onClick={() => setActiveTab('pendaftar')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'pendaftar' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        Pendaftar Les
                    </button>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                                <Users className="w-6 h-6 text-primary mb-2" />
                                <p className="text-2xl font-extrabold text-gray-800">1,204</p>
                                <p className="text-xs font-bold text-gray-500 uppercase">Total Pengguna</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                                <BookOpen className="w-6 h-6 text-secondary mb-2" />
                                <p className="text-2xl font-extrabold text-gray-800">542</p>
                                <p className="text-xs font-bold text-gray-500 uppercase">Kosakata</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 col-span-2 flex items-center justify-between">
                                <div>
                                    <GraduationCap className="w-6 h-6 text-orange-500 mb-2" />
                                    <p className="text-2xl font-extrabold text-gray-800">28</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Pendaftar Les Aktif</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setActiveTab('pendaftar')}>Lihat</Button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Aksi Cepat</h2>
                            <div className="space-y-3">
                                <Button fullWidth variant="secondary" className="justify-start">
                                    <Plus className="w-5 h-5 mr-2" /> Tambah Kosakata Baru
                                </Button>
                                <Button fullWidth variant="outline" className="justify-start">
                                    <Plus className="w-5 h-5 mr-2" /> Buat Soal Kuis
                                </Button>
                                <Button fullWidth variant="outline" className="justify-start">
                                    <Plus className="w-5 h-5 mr-2" /> Kelola Audio
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pengguna' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
                        <div className="p-4 border-b border-gray-100 flex items-center">
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Cari pengguna..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary" />
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {mockPengguna.map(user => (
                                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold mr-3">
                                            {user.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{user.name}</p>
                                            <p className="text-xs text-gray-500">Level {user.level} • {user.xp} XP</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'pendaftar' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-extrabold text-gray-800">Daftar Permintaan Les</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {mockPendaftar.map(p => (
                                <div key={p.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-800">{p.name}</p>
                                            <p className="text-sm text-gray-600">{p.paket}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${p.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <p className="text-xs text-gray-400">{p.date}</p>
                                        <div className="space-x-2">
                                            <button className="text-xs font-bold text-primary hover:underline">Hubungi</button>
                                            <button className="text-xs font-bold text-secondary hover:underline">Terima</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
