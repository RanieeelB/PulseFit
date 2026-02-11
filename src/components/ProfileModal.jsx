import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../services/userService';

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

        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 2MB.');
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
        <dialog ref={dialogRef} className="m-auto bg-transparent p-0 backdrop:bg-black/90 backdrop-blur-md open:animate-in open:fade-in open:zoom-in-95 backdrop:animate-in backdrop:fade-in">
            <div className="bg-surface-dark/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(91,19,236,0.3)] w-full max-w-sm overflow-hidden relative ring-1 ring-white/5 mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Decor effects */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 blur-[60px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10">
                    <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-5 bg-gradient-to-b from-primary to-purple-500 rounded-full"></span>
                        Editar Perfil
                    </h3>
                    <button onClick={() => dialogRef.current?.close()} className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
                        <span className="material-icons-round text-base">close</span>
                    </button>
                </div>

                <div className="p-4 relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <label className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-75 transition-opacity"></div>
                                <img
                                    src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}
                                    className={`relative w-20 h-20 rounded-xl object-cover border-2 border-white/10 dark:bg-surface-dark ${uploading ? 'opacity-50' : ''}`}
                                    alt="Avatar Preview"
                                />
                                {uploading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-icons-round text-white">upload</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome de Usuário</label>
                            <input
                                name="name"
                                type="text"
                                value={user.name}
                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                            <input
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-not-allowed font-mono"
                            />
                        </div>



                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Peso (kg)</label>
                                <input
                                    name="weight"
                                    type="number"
                                    value={user.weight}
                                    onChange={(e) => setUser({ ...user, weight: Number(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-center font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Altura (cm)</label>
                                <input
                                    name="height"
                                    type="number"
                                    value={user.height}
                                    onChange={(e) => setUser({ ...user, height: Number(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-center font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button type="button" onClick={() => dialogRef.current?.close()} className="flex-1 py-2.5 text-xs font-bold text-slate-400 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors uppercase tracking-wide">Cancelar</button>
                            <button type="submit" disabled={loading || uploading} className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide">
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
}
