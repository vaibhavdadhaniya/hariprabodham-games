'use client';

import { useState, useEffect } from 'react';
import { GAMES_DATA } from '../lib/gamesData';
import GameRenderer from '../components/GameRenderer';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectorPage() {
    // Mock State (In real app, this comes from Socket.io)
    const [gameState, setGameState] = useState({
        active: false,
        gameId: 'guess_word', // Default for testing
        index: -1, // Title Screen
    });

    // Effect to simulate socket updates (for demo)
    useEffect(() => {
        // This is where socket.on('PROJECTOR_UPDATE') would go
        console.log("Projector Listening...");
    }, []);

    if (!gameState.active) {
        return (
            <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-center p-4 overflow-hidden relative">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black"></div>

                <div className="z-10 flex flex-col items-center gap-6 animate-pulse-slow">
                    {/* Logo Placeholder */}
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">💎</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-500 tracking-wider drop-shadow-2xl">
                        Hariprabodham<br />Youth Assembly
                    </h1>

                    <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/50 to-transparent my-4"></div>

                    <h2 className="text-3xl md:text-4xl text-gray-400 tracking-[0.5em] uppercase font-light">
                        Satellite
                    </h2>
                </div>
            </div>
        );
    }

    const currentGame = GAMES_DATA[gameState.gameId];

    return (
        <div className="w-screen h-screen bg-slate-900 text-white overflow-hidden flex items-center justify-center relative">
            {/* Persistent Watermark */}
            <div className="absolute top-8 right-8 opacity-30 text-sm font-mono tracking-widest hidden md:block">
                YOUTH ASSEMBLY
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={gameState.gameId + gameState.index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                >
                    <GameRenderer game={currentGame} index={gameState.index} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
