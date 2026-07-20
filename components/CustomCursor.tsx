'use client';

import React, { useEffect, useState } from 'react';

export function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        const handleMouseEnter = () => {
            setIsVisible(true);
        };

        // Attach listeners
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        // Hover effect helper
        const addHoverListeners = () => {
            const targets = document.querySelectorAll('button, a, input, select, textarea, [role="button"], .card, .liquid-glass, .music-card');
            targets.forEach((elem) => {
                elem.addEventListener('mouseenter', () => setIsHovered(true));
                elem.addEventListener('mouseleave', () => setIsHovered(false));
            });
        };

        addHoverListeners();

        // Re-attach hovers on DOM mutations
        const observer = new MutationObserver(addHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            observer.disconnect();
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                width: isHovered ? '40px' : '12px',
                height: isHovered ? '40px' : '12px',
                borderRadius: '50%',
                border: '1.5px solid var(--gold)',
                background: isHovered ? 'rgba(213, 180, 106, 0.08)' : 'transparent',
                boxShadow: isHovered ? '0 0 15px rgba(213, 180, 106, 0.4)' : 'none',
                pointerEvents: 'none',
                zIndex: 99999,
                transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        />
    );
}
