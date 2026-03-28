import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { searchiTunes } from '../services/SearchService';

export default function TimeMachine() {
  const [year, setYear] = useState(2000);
  const { setSearchResults, setIsSearching } = useAppStore();

  useEffect(() => {
    const fetchTopSongs = async () => {
      setIsSearching(true);
      // Apple Music API / iTunes trick: query a year to get nostalgic tracks
      const results = await searchiTunes(`top hits ${year}`);
      setSearchResults(results);
      setIsSearching(false);
    };

    const delay = setTimeout(fetchTopSongs, 800);
    return () => clearTimeout(delay);
  }, [year]);

  return (
    <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '5vh' }}>
      <h1 className="text-gradient" style={{ fontSize: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Clock size={60} color="var(--accent-purple)" />
        Die Zeitmaschine
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Gleite durch die Jahrzehnte. Die Umgebung und die Musikbibliothek passen sich automatisch an das gewählte Jahr an.
      </p>

      <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', padding: '2rem', background: 'var(--bg-surface)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
        <h2 style={{ fontSize: '3rem', fontFamily: 'monospace', color: 'var(--accent-cyan)', marginBottom: '2rem' }}>
          {year}
        </h2>
        
        <input 
          type="range" 
          min="1970" 
          max={new Date().getFullYear()} 
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', height: '10px', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))', outline: 'none', borderRadius: '5px', appearance: 'none' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '1rem' }}>
          <span>1970</span>
          <span>1990</span>
          <span>2010</span>
          <span>Heute</span>
        </div>
      </div>
    </div>
  );
}
