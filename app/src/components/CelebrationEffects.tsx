'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CelebrationEffectsProps {
  isActive: boolean;
}

export default function CelebrationEffects({ isActive }: CelebrationEffectsProps) {
  const confettiRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !confettiRef.current) return;

    const canvas = confettiRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#a855f7', '#ec4899', '#14b8a6'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 4,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    let frame = 0;
    const maxFrames = 120;

    const animate = () => {
      if (frame >= maxFrames) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.vy;
        p.vy += 0.15;
        p.x += p.vx;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;

        const opacity = 1 - frame / maxFrames;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={confettiRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  );
}
