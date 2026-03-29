import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { Mic2, Sparkles } from 'lucide-react';

interface LyricLine {
  time: number;
  text: string;
}

export default function LyricsKaraoke() {
  const { currentTrack, playbackTime, settings } = useAppStore();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentTrack) return;

    // Simulated Timed Lyrics for "God Mode" Experience
    const mockLyrics = [
      { time: 0, text: "[Intro: Atmospheric Synths]" },
      { time: 5, text: "In der Stille der Nacht..." },
      { time: 8, text: "Suche ich nach dem Licht." },
      { time: 12, text: "Frequenzen pulsieren," },
      { time: 15, text: "Doch ich finde dich nicht." },
      { time: 19, text: "[Chorus: Hyper-Electronic]" },
      { time: 22, text: "Omni-Music, fühl den Beat!" },
      { time: 25, text: "Alles verschwimmt, was vor uns liegt." },
      { time: 28, text: "Wir reisen durch den Sound," },
      { time: 31, text: "In einem endlosen Traum." }
    ];
    setLyrics(mockLyrics);

  }, [currentTrack]);

  useEffect(() => {
    if (scrollRef.current) {
      const activeLine = lyrics.findIndex((l, i) => playbackTime >= l.time && (!lyrics[i+1] || playbackTime < lyrics[i+1].time));
      if (activeLine !== -1) {
        const lineElement = scrollRef.current.children[activeLine] as HTMLElement;
        if (lineElement) {
           scrollRef.current.scrollTo({
              top: lineElement.offsetTop - 150,
              behavior: 'smooth'
           });
        }
      }
    }
  }, [playbackTime, lyrics]);

  if (!currentTrack || !settings.karaoke) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ 
      width: '100%', 
      maxWidth: '800px', 
      height: '400px', 
      padding: '2rem', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid var(--accent-pink)',
      boxShadow: '0 0 40px rgba(255, 0, 255, 0.1)'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-pink)', fontSize: '1.2rem' }}>
          <Mic2 size={24} />
          LIVE LYRICS ENGINE v2.0
        </h3>
        <Sparkles size={20} color="var(--accent-pink)" className="animate-pulse" />
      </div>

      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          paddingBottom: '100px',
          scrollBehavior: 'smooth'
        }}
        className="hide-scrollbar"
      >
        {lyrics.map((line, i) => {
          const isActive = playbackTime >= line.time && (!lyrics[i+1] || playbackTime < lyrics[i+1].time);
          return (
            <div 
              key={i} 
              style={{ 
                fontSize: isActive ? '2.5rem' : '1.5rem', 
                fontWeight: isActive ? 900 : 400,
                color: isActive ? 'white' : 'var(--text-tertiary)',
                transition: 'all 0.3s ease',
                filter: isActive ? 'none' : 'blur(1px)',
                lineHeight: 1.2,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                textShadow: isActive ? '0 0 20px var(--accent-pink)' : 'none'
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
}
