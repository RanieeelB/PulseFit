import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../services/userService';
import { Camera, Save, X, User, Mail, Ruler, Weight } from 'lucide-react';

export default function ProfileModal() {
    const dialogRef = useRef(null);
    const [user, setUser] = useState({ name: '', email: '', avatar: '', weight: 0, height: 0 });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const open = async () => {
            const profile = await userService.getProfile();
            if (profile) setUser(profile);
            dialogRef.current?.showModal();
        };
        const close = () => dialogRef.current?.close();

        window.addEventListener('open-profile-modal', open);
        return () => window.removeEventListener('open-profile-modal', open);
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 50MB.');
            return;
        }

        try {
            setUploading(true);
            const url = await userService.uploadAvatar(file);
            setUser(prev => ({ ...prev, avatar: url }));
        } catch (error) {
            console.error(error);
            alert('Erro ao fazer upload da imagem.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await userService.saveProfile(user);
            dialogRef.current?.close();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog ref={dialogRef} className="m-auto bg-transparent p-0 backdrop:bg-black/80 backdrop-blur-md open:animate-in open:fade-in open:zoom-in-95 backdrop:animate-in backdrop:fade-in">
            <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl w-[90vw] md:w-full max-w-sm overflow-hidden relative ring-1 ring-white/5">

                {/* Close Button */}
                <button
                    onClick={() => dialogRef.current?.close()}
                    className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                >
                    <X size={18} />
                </button>

                {/* Cover Photo (Gradient) */}
                <div className="h-32 bg-gradient-to-r from-primary via-purple-600 to-primary/80 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
                </div>

                <div className="px-6 pb-8 relative">
                    {/* Avatar - Centered & Overlapping */}
                    <div className="flex justify-center -mt-12 mb-4 relative z-10">
                        <label className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <div className="absolute -inset-1 bg-black rounded-[2rem] blur opacity-50"></div>
                            <img
                                src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}
                                className={`relative w-24 h-24 rounded-[1.5rem] object-cover border-4 border-[#0A0A0B] bg-surface-dark shadow-xl ${uploading ? 'opacity-50' : ''}`}
                                alt="Avatar"
                            />

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                                {uploading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Camera className="text-white" size={24} />
                                )}
                            </div>
                        </label>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Header Text */}
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-black text-white">{user.name || 'Seu Nome'}</h2>
                            <p className="text-xs font-medium text-slate-500">{user.email || 'seu@email.com'}</p>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    placeholder="Nome de Exibição"
                                    className="w-full bg-white/5 border border-white/5 group-focus-within:border-primary/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center gap-2 group hover:border-white/10 transition-colors">
                                    <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                                        <Weight size={20} />
                                    </div>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            value={user.weight}
                                            onChange={(e) => setUser({ ...user, weight: Number(e.target.value) })}
                                            className="w-full bg-transparent text-center text-lg font-black text-white focus:outline-none p-0"
                                            placeholder="0"
                                        />
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block text-center">Peso (kg)</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center gap-2 group hover:border-white/10 transition-colors">
                                    <div className="text-slate-500 group-hover:text-blue-400 transition-colors">
                                        <Ruler size={20} />
                                    </div>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            value={user.height}
                                            onChange={(e) => setUser({ ...user, height: Number(e.target.value) })}
                                            className="w-full bg-transparent text-center text-lg font-black text-white focus:outline-none p-0"
                                            placeholder="0"
                                        />
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block text-center">Altura (cm)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-white/10"
                            >
                                {loading ? 'Salvando...' : (
                                    <>
                                        <Save size={18} /> Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
}
