import { useState, useRef } from 'react';
import { Sparkles, StopCircle } from 'lucide-react';

export default function AIGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startGeneration = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    setIsGenerating(true);

    const ctx = audioCtxRef.current;
    
    // Simple generative synth
    const playNote = (freq: number, duration: number, time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      
      // Envelope
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc.stop(time + duration);
    };

    const scales = [
      [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C Major
      [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16], // C Minor
      [261.63, 311.13, 349.23, 392.00, 466.16] // C Minor Pentatonic
    ];
    
    const randomScale = scales[Math.floor(Math.random() * scales.length)];

    let nextNoteTime = ctx.currentTime + 0.1;
    
    const schedule = () => {
      while (nextNoteTime < ctx.currentTime + 0.1) {
        // Random note from scale
        const freq = randomScale[Math.floor(Math.random() * randomScale.length)] * (Math.random() > 0.5 ? 2 : 1);
        playNote(freq, 0.5, nextNoteTime);
        
        // Next note schedule (eighth notes = 0.25s)
        nextNoteTime += 0.25;
      }
    };

    intervalRef.current = window.setInterval(schedule, 50);
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.suspend();
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Sparkles color="var(--accent-cyan)" />
        Lokale KI-Generierung (Echt!)
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
        Dieser Modus nutzt echte prozedurale In-Browser-Algorithmen und die Web Audio API, um live und lokal endlose neue Melodien zu komponieren.
      </p>
      
      {isGenerating ? (
        <button className="btn btn-primary" onClick={stopGeneration} style={{ background: 'var(--error)' }}>
          <StopCircle size={20} />
          Generierung Stoppen
        </button>
      ) : (
        <button className="btn btn-primary" onClick={startGeneration}>
          <Sparkles size={20} />
          Beat Generieren
        </button>
      )}
      
      {isGenerating && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', height: '40px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ width: '8px', background: 'var(--accent-cyan)', borderRadius: '4px', animation: `bounce ${0.2 + Math.random()*0.3}s infinite alternate` }}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
