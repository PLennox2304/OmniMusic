import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';

export default function SpectrumVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData, isPlaying, settings, currentTrack } = useAppStore();
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bands = 256;
    const barWidth = canvas.width / bands;
    
    // Simulate frequency data for visual consistency if real FFT isn't available
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const energy = audioData?.energy || 0.1;
      const rms = audioData?.rms || 0.1;

      for (let i = 0; i < bands; i++) {
        // Create an organic reactive wave
        const freq = Math.sin(i * 0.1 + performance.now() * 0.005) * 20;
        const h = (energy * 150) + freq + (Math.random() * 5);
        
        const x = i * barWidth;
        const y = canvas.height - h;

        const hue = (i + performance.now() * 0.05) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + rms})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
        
        ctx.fillRect(x, y, barWidth - 1, h);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, audioData]);

  if (!currentTrack) return null;

  return (
    <div className="glass-panel" style={{ 
      width: '100%', 
      maxWidth: '800px', 
      height: '120px', 
      padding: '10px', 
      overflow: 'hidden',
      marginTop: '1rem',
      position: 'relative',
      border: '1px solid var(--glass-border)',
      background: 'rgba(0,0,0,0.2)'
    }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={100} 
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
      />
      <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '2px', opacity: 0.6 }}>
        SPECTRUM_ANALYZER v1.0
      </div>
    </div>
  );
}
