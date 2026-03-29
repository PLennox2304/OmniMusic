import { useEffect, useState } from 'react';
import { Sparkles, Globe } from 'lucide-react';

export default function GlobalTicker() {
  const [news, setNews] = useState<string[]>([
    "AI-Analyse: Trending in Berlin - Justice Remix...",
    "Global Search: Neuer Capital Bra Track entdeckt...",
    "Neural Network: Samra ist Top-Künstler des Tages...",
    "Suche nach Melodien: Humming-Search in London populär..."
  ]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // Simulating the "AI searching the web" by grabbing latest iTunes data
        const response = await fetch('https://itunes.apple.com/search?term=pop&limit=10&media=music&entity=song');
        const data = await response.json();
        const results = data.results.map((r: any) => `AI-Entdeckung: ${r.trackName} von ${r.artistName} wird weltweit gefeiert! 🌟`);
        if (results.length > 0) setNews((prev) => [...results, ...prev].slice(0, 20));
      } catch (e) {
        console.error("Ticker fetch error", e);
      }
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, 30000); // Pulse every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '35px',
      background: 'rgba(255,255,255,0.03)',
      borderBottom: '1px solid var(--glass-border)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{
        padding: '0 1rem',
        background: 'var(--bg-darker)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 10,
        boxShadow: '10px 0 20px rgba(0,0,0,0.5)'
      }}>
        <Globe size={14} color="var(--accent-cyan)" />
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Live</span>
        <Sparkles size={14} color="var(--accent-purple)" />
      </div>

      <div className="ticker-container" style={{
        whiteSpace: 'nowrap',
        display: 'flex',
        animation: 'ticker 120s linear infinite',
        gap: '4rem',
        paddingLeft: '2rem'
      }}>
        {news.map((n, i) => (
          <span key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n}</span>
        ))}
        {/* Doubling for seamless loop */}
        {news.map((n, i) => (
          <span key={`dup-${i}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n}</span>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
