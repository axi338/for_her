'use client';

export const MOODS = {
    spring: {
        video: "/background_vids/7a39f797-9609-4028-9c09-847d428d7d7e.mp4",
        label: "🌸 Spring",
        deepRed: "#743014",
        gold: "#84592B",
        cream: "#E8D1A7"
    },
    autumn: {
        video: "/background_vids/921d8ee6-4a10-4918-8069-c12b7a45dc0e.mp4",
        label: "🍂 Autumn",
        deepRed: "#743014",
        gold: "#84592B",
        cream: "#E8D1A7"
    },
    rainy: {
        video: "/background_vids/5cec5d39-fa82-4c6d-9678-ca778989b43d.mp4",
        label: "🌧️ Rainy",
        deepRed: "#2b1a14",
        gold: "#442D1C",
        cream: "#c5d1d1"
    }
};

export type HomeMoodKey = keyof typeof MOODS;

interface MoodSwitcherProps {
    activeMood: HomeMoodKey;
    onMoodChange: (mood: HomeMoodKey) => void;
}

export function MoodSwitcher({ activeMood, onMoodChange }: MoodSwitcherProps) {
    return (
        <div
            id="mood-switcher"
            style={{
                position: 'fixed',
                top: '80px',
                right: '24px',
                zIndex: 50,
                display: 'flex',
                gap: '0.6rem',
                padding: '6px',
                borderRadius: '99px',
                background: 'rgba(24, 23, 21, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(213, 180, 106, 0.15)',
                boxShadow: 'var(--shadow-card)'
            }}
        >
            {(Object.keys(MOODS) as HomeMoodKey[]).map((moodKey) => {
                const item = MOODS[moodKey];
                const isActive = activeMood === moodKey;
                return (
                    <button
                        key={moodKey}
                        onClick={() => onMoodChange(moodKey)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '99px',
                            fontSize: '0.8rem',
                            fontFamily: 'var(--font-ui)',
                            fontWeight: 500,
                            color: isActive ? 'var(--bg)' : 'var(--text2)',
                            background: isActive ? 'var(--gold)' : 'transparent',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
