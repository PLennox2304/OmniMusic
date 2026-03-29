import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { scanGlobalMusic } from '../services/SearchService';
import { Radar, Zap, Shield, ExternalLink, Play } from 'lucide-react';
import type { ITunesTrack } from '../services/SearchService';

export default function ScannerView() {
  const { scannedTracks, addScannedTracks, lastScannerMessage, setLastScannerMessage, setCurrentTrack, setIsPlaying } = useAppStore();
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Start Global Scanner immediately
    const startScan = async () => {
      const platforms = ["Spotify Cloud", "Apple Music", "YouTube Global", "Amazon Backend"];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      setLastScannerMessage(`Scanne ${platform} nach neuen Hits...`);
      
      const tracks = await scanGlobalMusic();
      if (tracks.length > 0) {
        addScannedTracks(tracks);
        setLastScannerMessage(`${tracks.length} neue Datensätze von ${platform} integriert.`);
      }
    };

    startScan();
    scannerRef.current = setInterval(startScan, 30000); // 30s interval as requested

    return () => {
      if (scannerRef.current) clearInterval(scannerRef.current);
    };
  }, [addScannedTracks, setLastScannerMessage]);

  const handlePlay = (track: ITunesTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Radar & Status Section */}
        <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
           <div className="radar-circle" style={{ 
             width: '300px', height: '300px', border: '2px solid rgba(0, 242, 254, 0.2)', borderRadius: '50%', position: 'relative',
             display: 'flex', alignItems: 'center', justifyContent: 'center'
           }}>
              <div className="radar-sweep"></div>
              <Radar size={80} color="var(--accent-cyan)" style={{ opacity: 0.5 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="pulse-ring" style={{ animationDelay: `${i * 1}s` }}></div>
                 ))}
              </div>
           </div>

           <div style={{ marginTop: '3rem', textAlign: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                 <Shield size={24} color="var(--success)" />
                 <h2 style={{ fontSize: '2rem', margin: 0 }}>Galactic Scanner</h2>
              </div>
              <p style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '1.1rem', fontStyle: 'italic' }}>{lastScannerMessage}</p>
              
              <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                 <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scans Heute</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>{2840 + scannedTracks.length}</span>
                 </div>
                 <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>DNA Übereinstimmung</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>99.8%</span>
                 </div>
              </div>
           </div>
           
           <style>{`
             .radar-sweep {
               position: absolute;
               top: 0; left: 0; width: 100%; height: 100%;
               background: conic-gradient(from 0deg, rgba(0, 242, 254, 0.2) 0%, transparent 40%);
               border-radius: 50%;
               animation: sweep 4s linear infinite;
             }
             @keyframes sweep { 100% { transform: rotate(360deg); } }
             .pulse-ring {
               position: absolute;
               border: 2px solid var(--accent-cyan);
               border-radius: 50%;
               width: 100%; height: 100%;
               opacity: 0;
               animation: pulse-ring 3s ease-out infinite;
             }
             @keyframes pulse-ring {
               0% { transform: scale(0.5); opacity: 1; }
               100% { transform: scale(1.5); opacity: 0; }
             }
           `}</style>
        </div>

        {/* Live Feed Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Zap size={20} color="var(--warning)" />
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Live Discovery Feed</h3>
           </div>
           
           <div className="custom-scrollbar" style={{ height: '550px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {scannedTracks.map((track, i) => (
                <div key={`${track.trackId}-${i}`} className="glass-panel animate-fade-in" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={track.artworkUrl100} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.trackName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{track.artistName}</p>
                   </div>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => handlePlay(track)}>
                         <Play size={12} fill="currentColor" />
                      </button>
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.artistName + ' ' + track.trackName)}`} target="_blank" rel="noreferrer" className="btn-icon" style={{ width: '32px', height: '32px' }}>
                         <ExternalLink size={12} />
                      </a>
                   </div>
                </div>
              ))}
              {scannedTracks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Warte auf ersten System-Scan...</p>}
           </div>
        </div>

      </div>
    </div>
  );
}
