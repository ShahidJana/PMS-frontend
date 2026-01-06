import React, { useEffect, useRef, useState } from 'react';

const Background = () => {
    const canvasRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        const particleCount = 50;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.reset();
                this.hue = Math.random() * 60 + 220; // Blue to purple range
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2.5 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges with slight randomness
                if (this.x < 0 || this.x > canvas.width) {
                    this.vx *= -1;
                    this.vx += (Math.random() - 0.5) * 0.1;
                }
                if (this.y < 0 || this.y > canvas.height) {
                    this.vy *= -1;
                    this.vy += (Math.random() - 0.5) * 0.1;
                }

                // Gentle pulsing
                this.opacity += Math.sin(Date.now() * 0.001) * 0.001;
                this.opacity = Math.max(0.1, Math.min(0.7, this.opacity));
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

                // Create gradient for each particle
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius * 2
                );
                gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${this.opacity})`);
                gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`);

                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        const init = () => {
            resize();
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.update();
                p.draw();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 180) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const opacity = (1 - dist / 180) * 0.15;
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950">
            {/* Aurora Layer with enhanced animation */}
            <div className="bg-aurora opacity-70"></div>

            {/* Grain Overlay */}
            <div className="bg-grain"></div>

            {/* Mouse-following gradient */}
            <div
                className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-all duration-1000 ease-out"
                style={{
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)'
                }}
            ></div>

            {/* Floating orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slow animate-delay-200"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float animate-delay-400"></div>

            {/* Interactive Plexus Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 opacity-50 dark:opacity-70"
            />

            {/* Subtle Bottom Glow */}
            <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-glow"></div>

            {/* Rotating accent */}
            <div className="absolute top-0 right-0 w-96 h-96 opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-3xl animate-rotate-slow"></div>
            </div>
        </div>
    );
};

export default Background;
