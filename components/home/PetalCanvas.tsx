'use client';

import { useEffect, useRef } from 'react';

export function PetalCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Set screen dimensions
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const petals: Petal[] = [];
        const petalCount = 30;

        class Petal {
            x: number;
            y: number;
            size: number;
            speed: number;
            angle: number;
            spin: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height - canvas!.height;
                this.size = Math.random() * 10 + 5;
                this.speed = Math.random() * 1 + 0.5;
                this.angle = Math.random() * 360;
                this.spin = Math.random() * 0.05;
            }

            update() {
                this.y += this.speed;
                this.x += Math.sin(this.y / 50) * 0.5;
                this.angle += this.spin;
                if (this.y > canvas!.height) {
                    this.y = -20;
                    this.x = Math.random() * canvas!.width;
                }
            }

            draw() {
                ctx!.save();
                ctx!.translate(this.x, this.y);
                ctx!.rotate(this.angle);
                ctx!.fillStyle = '#f3c6c6'; // --soft-pink
                ctx!.beginPath();
                ctx!.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
                ctx!.fill();
                ctx!.restore();
            }
        }

        for (let i = 0; i < petalCount; i++) {
            petals.push(new Petal());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach((p) => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="petal-canvas" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}
