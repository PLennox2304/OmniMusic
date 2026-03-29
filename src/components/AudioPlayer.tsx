import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward, Volume2 } from 'lucide-react';
import Meyda from 'meyda';
import { useAppStore } from '../store';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, setIsPlaying, setAudioData, settings, setPlaybackTime } = useAppStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyzerRef = useRef<any>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);

  const [error, setError] = useState('');

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };

  // Update Playback Speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

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
        
        // 10-Band EQ Implementation (Frequencies: 32, 64, 125, 250, 500, 1k, 2k, 4k, 8k, 16k)
        const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        let lastNode: any = sourceRef.current;

        frequencies.forEach((freq) => {
           const filter = audioContextRef.current!.createBiquadFilter();
           filter.type = 'peaking';
           filter.frequency.value = freq;
           filter.Q.value = 1;
           filter.gain.value = settings.eqEnabled ? 5 : 0; 
           lastNode.connect(filter);
           lastNode = filter;
           eqNodesRef.current.push(filter);
        });

        lastNode.connect(audioContextRef.current.destination);

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

  // Update EQ Gains
  useEffect(() => {
    eqNodesRef.current.forEach(node => {
      node.gain.setTargetAtTime(settings.eqEnabled ? 6 : 0, audioContextRef.current?.currentTime || 0, 0.1);
    });
  }, [settings.eqEnabled]);

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
        src={currentTrack.previewUrl || undefined} 
        crossOrigin="anonymous"
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
        <button className="btn-icon" style={{ width: 50, height: 50, background: isPlaying ? 'var(--accent-cyan)' : 'transparent', color: isPlaying ? 'black' : 'white' }} onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <button className="btn-icon" style={{ opacity: 0.5 }}>
          <SkipForward size={20} />
        </button>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <img src={currentTrack.artworkUrl100} style={{ width: 55, height: 55, borderRadius: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }} alt="" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: '1.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>{currentTrack.trackName}</h4>
          <p style={{ margin: '2px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentTrack.artistName}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
           <Volume2 size={18} />
           {settings.playbackSpeed !== 1 && <span>{settings.playbackSpeed}x</span>}
        </div>
        {error && <span style={{ fontSize: '0.75rem', color: 'var(--warning)', maxWidth: '150px' }}>{error}</span>}
      </div>
    </div>
  );
}
