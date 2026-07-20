'use client';

import { useState, useEffect } from 'react';

const BACKGROUND_THOUGHTS = [
    "loves reading under the rain",
    "loves coffee and quiet mornings",
    "loves lilies more than roses",
    "loves old Fairuz songs at sunrise",
    "loves getting lost in nature",
    "romanticizes cloudy days",
    "soft soul with a wild heart",
    "finds peace in bookstore cafés",
    "moonlight, music, and silence",
    "poetry hidden in ordinary things",
    "autumn-hearted",
    "collects sunsets like memories",
    "loves handwritten letters",
    "tea, rain, and overthinking",
    "lives for slow mornings",
    "floral dresses and messy thoughts",
    "feels at home near trees and oceans",
    "vintage soul",
    "soft spoken, deeply feeling",
    "in love with calm places",
    "soul full of music and nature",
    "gardens, books, and Fairuz",
    "gentle energy",
    "healing through nature and music",
    "made of coffee, rain, and poetry"
];

interface FloatingWordItem {
    id: string;
    text: string;
    top: number;
    left: number;
    rotation: number;
}

export function FloatingWords() {
    const [words, setWords] = useState<FloatingWordItem[]>([]);

    useEffect(() => {
        // Spawn 2 immediately
        const initialWords = Array.from({ length: 2 }, (_, index) => ({
            id: `initial_${index}_${Date.now()}`,
            text: BACKGROUND_THOUGHTS[Math.floor(Math.random() * BACKGROUND_THOUGHTS.length)],
            top: Math.random() * 70 + 15,
            left: Math.random() * 70 + 15,
            rotation: (Math.random() - 0.5) * 15,
        }));
        setWords(initialWords);

        const spawnWord = () => {
            const text = BACKGROUND_THOUGHTS[Math.floor(Math.random() * BACKGROUND_THOUGHTS.length)];
            const newWord: FloatingWordItem = {
                id: `word_${Date.now()}`,
                text,
                top: Math.random() * 70 + 15,
                left: Math.random() * 70 + 15,
                rotation: (Math.random() - 0.5) * 15,
            };

            setWords((prev) => [...prev, newWord]);

            // Remove after animation (12 seconds)
            setTimeout(() => {
                setWords((prev) => prev.filter((w) => w.id !== newWord.id));
            }, 12000);
        };

        const interval = setInterval(spawnWord, 4500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            id="floating-words-container"
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden',
            }}
        >
            {words.map((w) => (
                <span
                    key={w.id}
                    className="floating-word"
                    style={{
                        position: 'absolute',
                        top: `${w.top}vh`,
                        left: `${w.left}vw`,
                        transform: `translate(-50%, -50%) rotate(${w.rotation}deg)`,
                        fontFamily: "var(--font-display)",
                        fontStyle: 'italic',
                        fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
                        color: 'rgba(232, 209, 167, 0.08)', // --text-opacity-very-low
                        textShadow: '0 0 10px rgba(213,180,106,0.02)',
                        transition: 'opacity 2s ease, transform 12s linear',
                        animation: 'floatWord 12s linear forwards',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {w.text}
                </span>
            ))}
            <style jsx global>{`
        @keyframes floatWord {
          0% {
            opacity: 0;
            margin-top: 10px;
          }
          10%, 90% {
            opacity: 1;
            margin-top: 0px;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-20px);
          }
        }
      `}</style>
        </div>
    );
}
