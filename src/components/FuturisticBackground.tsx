'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FuturisticBackgroundProps {
  enabled?: boolean;
}

/**
 * Optimized ambient background with subtle particles and grid pattern
 * Reduced from 50 to 18 particles, slower movement, and much lower opacity
 */
const FuturisticBackground: React.FC<FuturisticBackgroundProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);

  // Check user preference for reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system - REDUCED from 50 to 18
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create fewer, slower particles
    for (let i = 0; i < 18; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        // Reduced velocity by 50% (from 0.5 to 0.25)
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.5, // Slightly smaller
        opacity: Math.random() * 0.3 + 0.1, // More subtle
      });
    }

    // Connection lines - MUCH more subtle
    const drawConnections = () => {
      // Changed from cyan to teal and reduced opacity from 0.1 to 0.05
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.05)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Reduced connection distance from 150 to 120 for fewer lines
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Reduced alpha from 0.3 to 0.15
            ctx.globalAlpha = (1 - distance / 120) * 0.15;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    };

    // Animation loop - run at 30fps instead of 60fps
    let lastFrame = 0;
    const animate = (timestamp: number) => {
      // Throttle to 30fps for better performance
      if (timestamp - lastFrame < 33) {
        requestAnimationFrame(animate);
        return;
      }
      lastFrame = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with teal color instead of cyan
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20, 184, 166, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections
      drawConnections();

      requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isEnabled]);

  // Early return if disabled
  if (!isEnabled) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <div className="grid-bg w-full h-full" />
      </div>
    );
  }

  return (
    <>
      {/* Subtle Grid Background - reduced opacity from 30% to 15% */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15">
        <div className="grid-bg w-full h-full" />
      </div>

      {/* Particle Canvas - reduced opacity from 40% to 25% */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.25 }}
      />

      {/* Removed Scan Line Effect - too distracting */}

      {/* Subtle Gradient Overlays - reduced opacity by 50% */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-teal-500 to-transparent opacity-[0.025] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-teal-400 to-transparent opacity-[0.025] blur-3xl" />
      </div>
    </>
  );
};

export default FuturisticBackground;
