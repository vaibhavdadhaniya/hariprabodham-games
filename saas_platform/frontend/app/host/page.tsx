'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GAMES_DATA } from '../../lib/gamesData';

export default function HostDashboard() {
    const router = useRouter();
    const [activeGameId, setActiveGameId] = useState<string | null>(null);
    const [slideIndex, setSlideIndex] = useState(-1);
    const [user, setUser] = useState<{ name: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/');
            return;
        }
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const games = Object.entries(GAMES_DATA);
    const activeGame = activeGameId ? GAMES_DATA[activeGameId] : null;

    const loadGame = (id: string) => {
        setActiveGameId(id);
        setSlideIndex(-1); // Start at Title
        // socket.emit('LOAD_GAME', { gameId: id, index: -1 })
    };

    const nextSlide = () => {
        if (!activeGame) return;
        if (slideIndex < activeGame.content.length - 1) {
            setSlideIndex(prev => prev + 1);
            // socket.emit('UPDATE_INDEX', index + 1)
        }
    };

    const prevSlide = () => {
        if (slideIndex > -1) {
            setSlideIndex(prev => prev - 1);
            // socket.emit('UPDATE_INDEX', index - 1)
        }
    };

    if (!user) return null; // or loading spinner

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans relative overflow-hidden">
            {/* Background Ambient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Sidebar: Game List */}
            <aside className="w-80 border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-4 flex flex-col gap-2 z-10">
                <div className="mb-6 px-2">
                    <h1 className="font-black text-2xl tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">MoreFun<span className="text-indigo-500">.io</span></h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Host Console</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {games.map(([id, game]) => (
                        <motion.button
                            key={id}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => loadGame(id)}
                            className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 group border ${activeGameId === id
                                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner ${activeGameId === id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'
                                }`}>
                                <i className={`fas ${game.icon}`}></i> {/* Font Awesome needed or replace with emojis */}
                                {activeGameId === id ? '▶' : '•'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className={`font-bold truncate ${activeGameId === id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{game.title}</div>
                                <div className="text-xs text-slate-500 truncate">{game.type.replace('_', ' ')}</div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                        <div className="flex-1">
                            <div className="text-sm font-bold">{user.name || 'Admin'}</div>
                            <div className="text-xs text-slate-500">Organizer</div>
                        </div>
                        <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors" title="Logout">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content: Controls */}
            <main className="flex-1 flex flex-col relative z-0">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-[-1]"></div>

                <AnimatePresence mode='wait'>
                    {!activeGame ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            key="empty"
                            className="flex-1 flex flex-col items-center justify-center text-slate-500"
                        >
                            <div className="w-48 h-48 bg-slate-800/50 rounded-full flex items-center justify-center mb-8 border border-slate-700/50">
                                <span className="text-6xl animate-pulse">🚀</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-300 mb-2">Ready to Launch</h2>
                            <p className="text-lg">Select a game from the library to begin hosting.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="controls"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 p-8 overflow-y-auto flex flex-col h-full"
                        >
                            {/* Header Card */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-white">{activeGame.title}</h1>
                                    <p className="text-slate-400 flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Live on Projector
                                    </p>
                                </div>
                                <button onClick={() => setActiveGameId(null)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-colors">
                                    Stop Game
                                </button>
                            </div>

                            {/* Main Control Deck */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                                {/* Slide Preview & Nav */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    <div className="glass-card flex-1 rounded-3xl p-1 relative border border-slate-700/50 shadow-2xl flex flex-col">
                                        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border border-white/10">
                                            PREVIEW | {(slideIndex + 1)} / {activeGame.content.length}
                                        </div>

                                        <div className="flex-1 bg-black/40 rounded-2xl m-1 flex items-center justify-center relative overflow-hidden group">
                                            {/* Mock Preview Content */}
                                            <div className="text-center p-8 opacity-50 group-hover:opacity-100 transition-opacity">
                                                {slideIndex === -1 && <div className="text-4xl font-black uppercase text-slate-600">TITLE SCREEN</div>}
                                                {slideIndex >= 0 && (
                                                    <div className="max-w-md mx-auto text-sm font-mono text-left bg-black/80 p-4 rounded-lg border border-slate-700 text-green-400">
                                                        {JSON.stringify(activeGame.content[slideIndex], null, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Navigation Bar */}
                                        <div className="h-24 bg-slate-800/50 border-t border-slate-700/50 rounded-b-3xl flex items-center px-8 gap-6 backdrop-blur">
                                            <button
                                                onClick={prevSlide}
                                                disabled={slideIndex <= -1}
                                                className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-90"
                                            >
                                                ←
                                            </button>

                                            <div className="flex-1 flex flex-col items-center justify-center">
                                                <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 transition-all duration-300"
                                                        style={{ width: `${Math.max(0, ((slideIndex + 1) / activeGame.content.length) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between w-full mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    <span>Previous</span>
                                                    <span>Next Slide</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={nextSlide}
                                                disabled={slideIndex >= activeGame.content.length - 1}
                                                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 flex items-center justify-center text-2xl text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-110 active:scale-90"
                                            >
                                                →
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Side Panel: Actions & Quick Utilities */}
                                <div className="flex flex-col gap-6">
                                    {/* Quick Actions */}
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <i className="fas fa-bolt text-yellow-500"></i> Instant Actions
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm font-bold transition-colors">
                                                Reveal Answer
                                            </button>
                                            <button className="p-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-xl text-sm font-bold transition-colors">
                                                Start 30s
                                            </button>
                                            <button className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm font-bold transition-colors">
                                                Reset Timer
                                            </button>
                                            <button className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl text-sm font-bold transition-colors">
                                                Show Title
                                            </button>
                                        </div>
                                    </div>

                                    {/* Audio Deck */}
                                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 flex-1">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <i className="fas fa-volume-up text-pink-500"></i> Sound FX
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {['Clap', 'Laugh', 'Boo', 'Drum', 'Horn', 'Correct', 'Wrong', '30s', '60s'].map(sfx => (
                                                <button key={sfx} className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg text-xs font-bold border border-slate-600 transition-colors">
                                                    {sfx}
                                                </button>
                                            ))}
                                            <button className="w-full mt-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold transition-all">
                                                STOP ALL AUDIO
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
