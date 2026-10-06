import React, { useEffect, useRef, useState } from 'react';
import earthImage from '../assets/images/earth_globe_realistic_1791270390355.jpg';

export const EarthHeroGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = earthImage;

    let animationFrameId: number;
    let angle = 0;

    const size = 500;
    canvas.width = size;
    canvas.height = size;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 180;

    img.onload = () => {
      setImageLoaded(true);
    };

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      angle += 0.003;

      // 1. Deep Atmospheric Outer Halo
      const outerAura = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.95,
        centerX,
        centerY,
        radius * 1.35
      );
      outerAura.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
      outerAura.addColorStop(0.3, 'rgba(56, 189, 248, 0.22)');
      outerAura.addColorStop(0.7, 'rgba(2, 132, 199, 0.06)');
      outerAura.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = outerAura;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Real Earth Sphere Rendering
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      if (img.complete && img.naturalWidth > 0) {
        // Draw the real photorealistic Earth globe
        // Subtle floating / gentle drift
        const wobbleX = Math.sin(angle * 0.8) * 4;
        const wobbleY = Math.cos(angle * 0.6) * 3;
        ctx.drawImage(
          img,
          centerX - radius + wobbleX,
          centerY - radius + wobbleY,
          radius * 2,
          radius * 2
        );
      } else {
        // Fallback realistic ocean blue base while loading
        const baseGrad = ctx.createRadialGradient(
          centerX - radius * 0.3,
          centerY - radius * 0.3,
          radius * 0.1,
          centerX,
          centerY,
          radius
        );
        baseGrad.addColorStop(0, '#1e40af');
        baseGrad.addColorStop(0.7, '#0f172a');
        baseGrad.addColorStop(1, '#020617');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      }

      // 3. Realistic Day/Night Terminator & Atmospheric Twilight Shading
      const terminator = ctx.createLinearGradient(
        centerX - radius * 0.6,
        centerY - radius * 0.6,
        centerX + radius,
        centerY + radius
      );
      terminator.addColorStop(0, 'rgba(255, 255, 255, 0.15)'); // subtle sunlit reflection
      terminator.addColorStop(0.35, 'rgba(0, 0, 0, 0)');
      terminator.addColorStop(0.75, 'rgba(3, 7, 18, 0.6)');
      terminator.addColorStop(1, 'rgba(2, 6, 23, 0.95)'); // dark side of Earth

      ctx.fillStyle = terminator;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

      // 4. Atmospheric Blue Rim Glow (Rayleigh scattering edge)
      const innerAtmosphere = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.85,
        centerX,
        centerY,
        radius
      );
      innerAtmosphere.addColorStop(0, 'rgba(56, 189, 248, 0)');
      innerAtmosphere.addColorStop(0.8, 'rgba(56, 189, 248, 0.25)');
      innerAtmosphere.addColorStop(1, 'rgba(125, 211, 252, 0.65)');

      ctx.fillStyle = innerAtmosphere;
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

      // 5. Active NASA Sensor Scan Track (Simulated Orbital Satellite)
      const t = Date.now() / 1000;
      const scanX = centerX + Math.cos(t * 0.5) * (radius * 0.7);
      const scanY = centerY + Math.sin(t * 0.4) * (radius * 0.4);

      // Pulse ring on current observation focal point
      const pulseRadius = 5 + Math.sin(t * 3.5) * 2;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(scanX, scanY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(scanX, scanY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Sensor crosshairs
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scanX - 10, scanY);
      ctx.lineTo(scanX + 10, scanY);
      ctx.moveTo(scanX, scanY - 10);
      ctx.lineTo(scanX, scanY + 10);
      ctx.stroke();

      ctx.restore();

      // 6. Crisp Spherical Edge Highlight
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center select-none group"
      style={{
        transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* Real Earth Globe Canvas with Atmospheric Halo */}
      <canvas
        ref={canvasRef}
        className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] drop-shadow-[0_0_40px_rgba(14,165,233,0.3)] transition-transform duration-300 group-hover:scale-[1.02]"
        aria-label="Real Earth Globe with NASA satellite observation scan"
      />

      {/* Simulated Sensor Observation Telemetry HUD Badge */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 font-mono text-[11px] text-cyan-300 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="font-semibold text-white tracking-wide">VISUALIZED OBSERVATION SCAN</span>
        </div>
        <div className="text-[10px] text-cyan-400/80 mt-1 flex items-center gap-1.5">
          <span>NASA BLUE MARBLE BASEMAP</span>
          <span className="text-slate-600">·</span>
          <span>SIMULATED SENSOR HUD</span>
        </div>
      </div>
    </div>
  );
};
