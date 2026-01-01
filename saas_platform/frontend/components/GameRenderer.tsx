'use client';
import { motion } from 'framer-motion';
import { Game, SlideContent } from '../lib/gamesData';

interface GameRendererProps {
    game: Game;
    index: number;
}

export default function GameRenderer({ game, index }: GameRendererProps) {
    // Title Screen
    if (index === -1) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                <h1 className="text-3xl tracking-[4px] text-gray-400 mb-5 uppercase">Presenting</h1>
                <div className="w-24 h-0.5 bg-indigo-500 mb-10"></div>
                <h1 className="text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] leading-tight">
                    {game.title}
                </h1>
            </div>
        );
    }

    const content = game.content[index];
    if (!content) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center p-8"
        >
            {/* 1. Image Display */}
            {game.type === 'slider_reveal' || game.type === 'image_display' ? (
                <div className="relative">
                    {content.image && (
                        <img
                            src={content.image}
                            className="max-h-[80vh] rounded-xl shadow-2xl border-4 border-white/10"
                            alt="Game Content"
                        />
                    )}
                    {content.answer && (
                        <h2 className="text-6xl font-bold text-center mt-8 text-yellow-400">{content.answer}</h2>
                    )}
                </div>
            ) : null}

            {/* 2. Text / Riddle */}
            {game.type === 'reveal_answer' || game.type === 'reveal_timer' ? (
                <div className="text-center space-y-10 max-w-5xl">
                    <h2 className="text-6xl md:text-7xl font-bold leading-tight">{content.question || content.puzzle}</h2>
                    {/* Answer would be hidden by default in real logic, but for now we render it */}
                    {/* In a real app, 'isRevealed' would be a prop passed down */}
                    <div className="p-8 bg-indigo-900/30 rounded-xl border border-indigo-500/30">
                        <h3 className="text-4xl text-indigo-300">Answer: {content.answer}</h3>
                    </div>
                </div>
            ) : null}

            {/* 3. Word Clues */}
            {game.type === 'timed_clues' ? (
                <div className="text-center">
                    <h3 className="text-4xl text-gray-400 mb-8 uppercase tracking-widest">{content.category}</h3>
                    <div className="space-y-4">
                        {content.clues?.map((c, i) => (
                            <div key={i} className="text-5xl font-bold bg-white/5 p-4 rounded-lg">{c}</div>
                        ))}
                    </div>
                    <h1 className="text-9xl font-black text-indigo-500 mt-12">{content.word}</h1>
                </div>
            ) : null}

            {/* 4. Challenge Timer */}
            {game.type === 'challenge_timer' ? (
                <div className="text-center space-y-12">
                    <h2 className="text-7xl font-bold">{content.challenge}</h2>
                    <div className="text-[12rem] font-black text-yellow-400 tabular-nums leading-none drop-shadow-xl">30</div>
                </div>
            ) : null}

        </motion.div>
    );
}
