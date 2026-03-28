import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward, Volume2 } from 'lucide-react';
import Meyda from 'meyda';
import { useAppStore } from '../store';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, setIsPlaying, setAudioData } = useAppStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyzerRef = useRef<any>(null);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.error("Audio block:", e);
        setIsPlaying(false);
      });
      initAudioAnalysis();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const initAudioAnalysis = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (!sourceRef.current && audioRef.current) {
      try {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(audioContextRef.current.destination);

        analyzerRef.current = Meyda.createMeydaAnalyzer({
          audioContext: audioContextRef.current,
          source: sourceRef.current,
          bufferSize: 512,
          featureExtractors: ['rms', 'energy', 'zcr'],
          callback: (features: any) => {
            setAudioData({
              rms: features.rms || 0,
              energy: features.energy || 0,
              zcr: features.zcr || 0
            });
          }
        });
        
        analyzerRef.current.start();
      } catch (err) {
        console.error("CORS Audio routing block:", err);
        setError("Cross-Origin Audio Analysis blocked by iTunes CDN. Playing fallback 3D animation.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.stop();
      }
    };
  }, []);

  if (!currentTrack) return null;

  return (
    <div className="glass-panel" style={{ 
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      width: '90%', maxWidth: '800px', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem', zIndex: 100
    }}>
      <audio 
        ref={audioRef} 
        src={currentTrack.previewUrl} 
        crossOrigin="anonymous"
        onEnded={() => setIsPlaying(false)}
      />
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
        <button className="btn-icon" style={{ width: 50, height: 50 }} onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <button className="btn-icon" style={{ opacity: 0.5 }}>
          <SkipForward size={20} />
        </button>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={currentTrack.artworkUrl100} style={{ width: 50, height: 50, borderRadius: 8 }} alt="" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.trackName}</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentTrack.artistName}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <Volume2 size={20} />
        {error && <span style={{ fontSize: '0.75rem', color: 'var(--warning)', maxWidth: '150px' }}>{error}</span>}
      </div>
    </div>
  );
}
