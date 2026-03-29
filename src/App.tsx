import { useEffect, useState, useRef } from 'react';
import { Search, Mic, Sparkles, Compass, X, Play, Layout } from 'lucide-react';
import { useAppStore } from './store';
import { searchiTunes } from './services/SearchService';
import SearchResults from './components/SearchResults';
import AudioPlayer from './components/AudioPlayer';
import Visualizer3D from './components/Visualizer3D';
import AIGenerator from './components/AIGenerator';
import Sidebar from './components/Sidebar';
import TimeMachine from './components/TimeMachine';
import Meyda from 'meyda';
import './index.css';

function App() {
  const { 
    searchQuery, setSearchQuery, 
    setIsSearching, searchResults, setSearchResults, 
    isPlaying, setMicAudioData, 
    appMode, setAppMode, 
    selectedArtist, setSelectedArtist 
  } = useAppStore();

  const [showGenerator, setShowGenerator] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyzerRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Auto-search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const q = searchQuery.trim().toLowerCase();
      if (q.length > 2) {
        setIsSearching(true);
        
        // Smart Playlist NLP Parser
        if (q.includes('playlist') && q.includes('und')) {
           const names = q.replace('mache', '').replace('eine', '').replace('playlist', '').replace('mit', '').replace('von', '').split('und').map(n => n.trim()).filter(n => n);
           if (names.length > 0) {
             const results = await searchiTunes(`${names[0]} top hits`, 'songs'); 
             setSearchResults(results);
             setIsSearching(false);
             return;
           }
        }

        const modeReq = (appMode === 'artists' && !selectedArtist) ? 'artists' : 'songs';
        const results = await searchiTunes(searchQuery, modeReq);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        if (!selectedArtist) setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, setSearchResults, setIsSearching, appMode, selectedArtist]);

  // Handle Speech Recognition (Microphone)
  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Dein Browser unterstützt leider keine lokale Spracherkennung. Bitte verwende Chrome oder Edge.");
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSearchQuery('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setSearchQuery(event.results[i][0].transcript);
        } else {
          interimTranscript += event.results[i][0].transcript;
          setSearchQuery(interimTranscript);
        }
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      stopMicAnalysis();
    };

    const stopMicAnalysis = () => {
      if (micAnalyzerRef.current) micAnalyzerRef.current.stop();
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      setMicAudioData(null);
    };

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      micStreamRef.current = stream;
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      const source = audioCtxRef.current.createMediaStreamSource(stream);
      
      micAnalyzerRef.current = Meyda.createMeydaAnalyzer({
        audioContext: audioCtxRef.current,
        source: source,
        bufferSize: 512,
        featureExtractors: ['rms', 'energy'],
        callback: (features: any) => {
          setMicAudioData({
            rms: features.rms || 0,
            energy: features.energy || 0,
            zcr: 0
          });
        }
      });
      micAnalyzerRef.current.start();
      recognition.start();
    }).catch(() => recognition.start());
  };

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      {/* 3D Visualizer Background */}
      <Visualizer3D isListening={isListening} />
      
      {/* Cinematic Overlays */}
      <div className={`ambient-background ${cinematicMode ? 'cinematic-hidden' : ''}`} style={{ opacity: isPlaying || isListening ? 0 : 1 }}>
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
      </div>

      {/* Global Interface */}
      <div className={cinematicMode ? 'cinematic-hidden' : ''}>
        <Sidebar />
      </div>

      <div className={`main-content-layout ${cinematicMode ? 'cinematic-full' : ''}`} style={{ flex: 1, paddingLeft: cinematicMode ? '0' : '280px', position: 'relative' }}>
        
        {/* Exit Cinematic Mode Button */}
        {cinematicMode && (
          <button 
            className="btn btn-icon" 
            style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000, background: 'rgba(255,255,255,0.1)' }}
            onClick={() => setCinematicMode(false)}
          >
            <X size={24} />
          </button>
        )}

        <header className={`container ${cinematicMode ? 'cinematic-hidden' : ''}`} style={{ padding: '2rem 2rem 1rem 2rem' }}>
          <div className="flex-between">
            <div className="logo flex-center" style={{ gap: '0.75rem', cursor: 'pointer' }} onClick={() => { setShowGenerator(false); setAppMode('home'); setSelectedArtist(null); }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass color="white" size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.75rem' }} className="text-gradient logo-text">OmniMusic</h1>
            </div>
            
            <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button className="btn btn-glass" style={{ padding: '0.5rem 1rem' }} onClick={() => setCinematicMode(true)}>
                <Layout size={18} />
                <span className="logo-text">Kino-Modus</span>
              </button>
              <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={() => setShowGenerator(true)}>
                <Sparkles size={18} />
                <span className="logo-text">KI Generator</span>
              </button>
            </nav>
          </div>
        </header>

        <main className="main-content container flex-center" style={{ flexDirection: 'column', marginTop: cinematicMode ? '0' : (searchQuery || appMode !== 'home' ? '2vh' : '10vh'), transition: 'all 0.5s ease' }}>
          
          {appMode === 'timemachine' && !showGenerator && <TimeMachine />}
          {showGenerator && <AIGenerator />}

          {!showGenerator && appMode !== 'timemachine' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Home Intro */}
              {!searchQuery && appMode === 'home' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '800px' }}>
                  <h1 style={{ fontSize: '4.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
                    Höre die <span className="text-gradient-purple">Zukunft</span>
                  </h1>
                  <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Deine KI-gesteuerte Musikwelt. Grenzenlos, Smart und Responsive.
                  </p>
                </div>
              )}

              {/* Artist Search Intro */}
              {appMode === 'artists' && !selectedArtist && !searchQuery && (
                <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center', marginBottom: '3rem' }}>
                   <h2 style={{ fontSize: '3rem' }}>Künstler-Nexus</h2>
                   <p style={{ color: 'var(--text-secondary)' }}>Finde deine Idole und entdecke ihre gesamte Diskografie.</p>
                </div>
              )}

              {/* Selected Artist Profile (Spotify Style) */}
              {selectedArtist && (
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '900px', marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', gap: '2.5rem', padding: '3rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
                   <div style={{ width: '220px', height: '220px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', flexShrink: 0 }}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedArtist.artistName}&backgroundColor=6366f1`} alt={selectedArtist.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                   <div style={{ flex: 1, paddingBottom: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
                        <Play size={16} fill="currentColor" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Populärer Künstler</span>
                     </div>
                     <h2 style={{ fontSize: '4.5rem', margin: 0, lineHeight: 1 }}>{selectedArtist.artistName}</h2>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '1rem' }}>Genre: {selectedArtist.primaryGenreName}</p>
                   </div>
                   <button className="btn btn-icon" onClick={() => { setSelectedArtist(null); setSearchQuery(''); }} style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                      <X size={20} />
                   </button>
                </div>
              )}

              {/* Search Bar UI */}
              {!selectedArtist && (
                <div className="search-wrapper" style={{ width: '100%', maxWidth: '750px', marginBottom: '3rem' }}>
                  <Search className="search-icon" size={24} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder={appMode === 'artists' ? "Künstler suchen... (z.B. Eminem, Justice)" : "Songs, Künstler, Lyrics..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderColor: isListening ? 'var(--accent-pink)' : 'var(--glass-border)' }}
                  />
                  <button className="btn-icon" style={{ position: 'absolute', right: '10px', top: '10px', width: '40px', height: '40px', border: 'none', background: isListening ? 'var(--accent-pink)' : 'var(--bg-surface)' }} onClick={handleMicClick}>
                    <Mic size={20} color={isListening ? 'white' : 'var(--accent-cyan)'} />
                  </button>
                </div>
              )}

              {/* Artist Cards Results */}
              {appMode === 'artists' && !selectedArtist && searchResults.length > 0 && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px' }}>
                  {searchResults.map((artist: any) => (
                    <div 
                      key={artist.artistId} 
                      className="glass-panel" 
                      style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                      onClick={async () => {
                        setSelectedArtist(artist);
                        setIsSearching(true);
                        const songs = await searchiTunes(artist.artistName, 'songs');
                        setSearchResults(songs);
                        setIsSearching(false);
                      }}
                    >
                      <div style={{ width: '130px', height: '130px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden' }}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${artist.artistName}&backgroundColor=random`} alt={artist.artistName} />
                      </div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{artist.artistName}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{artist.primaryGenreName}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Song Results */}
              {(appMode !== 'artists' || selectedArtist) && <SearchResults />}
            </div>
          )}
        </main>
      </div>

      <div className={cinematicMode ? 'cinematic-hidden' : ''}>
        <AudioPlayer />
      </div>
    </div>
  );
}

export default App;
