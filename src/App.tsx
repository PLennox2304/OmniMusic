import { useEffect, useState } from 'react';
import { Search, Mic, Sparkles, Compass, X, Layout, Activity } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { useAppStore } from './store';
import { deepSearchArtist, recognizeMusic, searchiTunes } from './services/SearchService';
import { audioRecorder } from './services/AudioRecorderService';
import SearchResults from './components/SearchResults';
import AudioPlayer from './components/AudioPlayer';
import Visualizer3D from './components/Visualizer3D';
import GlobalTicker from './components/GlobalTicker';
import Sidebar from './components/Sidebar';
import TimeMachine from './components/TimeMachine';
import AIGenerator from './components/AIGenerator';
import ScannerView from './components/ScannerView';

export default function App() {
  const { 
    appMode, setAppMode, searchQuery, setSearchQuery, 
    searchResults, setSearchResults, setIsSearching,
    setCurrentTrack, setIsPlaying,
    userSession, setUserSession, isAnalyzing, setIsAnalyzing,
    isListening, setIsListening,
    selectedArtist, setSelectedArtist
  } = useAppStore();

  const [cinematicMode, setCinematicMode] = useState(false);

  // Auth sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setUserSession]);

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery && searchQuery.length > 2 && !isListening && !isAnalyzing) {
        setIsSearching(true);
        const results = await deepSearchArtist(searchQuery);
        setSearchResults(results);
        setIsSearching(false);

        if (userSession?.user?.id) {
           await supabase.from('search_history').insert([{ user_id: userSession.user.id, query: searchQuery }]);
        }
      } else if (!searchQuery) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, setSearchResults, setIsSearching, appMode, userSession, isListening, isAnalyzing]);

  const handleMicClick = async () => {
    if (isListening || isAnalyzing) return;

    try {
      setIsListening(true);
      setSearchQuery('Höre zu... Singe oder summe jetzt!');
      
      await audioRecorder.startRecording();
      
      setTimeout(async () => {
        setIsListening(false);
        setIsAnalyzing(true);
        setSearchQuery('Analysiere Audio-DNA...');
        
        try {
          const blob = await audioRecorder.stopRecording();
          const track = await recognizeMusic(blob);
          
          if (track) {
            setSearchQuery(track.trackName);
            setCurrentTrack(track);
            setIsPlaying(true);
            setSearchResults([track]);
          } else {
            setSearchQuery('Keine Übereinstimmung gefunden.');
          }
        } catch (err) {
          console.error(err);
          setSearchQuery('Fehler bei der Cloud-Analyse.');
        } finally {
          setIsAnalyzing(false);
        }
      }, 5000);

    } catch (err) {
      console.error("Mic access denied", err);
      setIsListening(false);
      alert("Mikrofon-Zugriff verweigert oder nicht unterstützt.");
    }
  };

  return (
    <div className={`app-container ${cinematicMode ? 'cinematic' : ''}`}>
      <Visualizer3D />
      <GlobalTicker />
      
      {!cinematicMode && <Sidebar />}

      <div className="main-wrapper">
        <header className="header container flex-between">
          <div className="logo flex-center" onClick={() => { setAppMode('home'); setSearchQuery(''); }}>
            <div className="logo-icon ripple"></div>
            <h1 className="logo-text">OMNI<span>MUSIC</span></h1>
          </div>

          <div className="header-actions flex-center">
            <button className="btn-icon" title="Entdecken" onClick={() => setAppMode('artists')}>
              <Compass size={20} />
            </button>
            <button className="btn-icon" title="Kino-Modus" onClick={() => setCinematicMode(!cinematicMode)}>
              <Layout size={20} />
            </button>
            <button 
              className={`btn btn-primary btn-glow flex-center ${appMode === 'aistudio' ? 'active' : ''}`} 
              onClick={() => setAppMode('aistudio')}
            >
              <Sparkles size={16} />
              <span>AI Studio</span>
            </button>
          </div>
        </header>

        <div className="content-area">
          <main className="main-content container" style={{ 
            marginTop: cinematicMode ? '0' : (searchQuery || appMode !== 'home' ? '5vh' : '15vh'),
            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            
            {/* Conditional Mode Rendering */}
            {appMode === 'timemachine' && <TimeMachine />}
            {appMode === 'scanner' && <ScannerView />}
            {appMode === 'aistudio' && <AIGenerator />}

            {(appMode === 'home' || appMode === 'artists') && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Hero Header */}
                {!searchQuery && !selectedArtist && (
                  <div className="hero-section text-center animate-up" style={{ marginBottom: '3rem' }}>
                    {appMode === 'home' ? (
                      <>
                        <h2 className="hero-title" style={{ fontSize: '5rem', lineHeight: 0.9 }}>OMNI<span>MUSIC</span></h2>
                        <p className="hero-subtitle">Premium Musikerkennung & Neuronales Streaming.</p>
                      </>
                    ) : (
                      <>
                        <h2 className="hero-title" style={{ fontSize: '4rem' }}>KÜNSTLER<span>NEXUS</span></h2>
                        <p className="hero-subtitle">Tauche tief in die Diskografien deiner Favoriten ein.</p>
                      </>
                    )}
                  </div>
                )}

                {/* Selected Artist Profile */}
                {selectedArtist && (
                  <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '900px', marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', gap: '2.5rem', padding: '3rem', position: 'relative' }}>
                     <div style={{ width: '220px', height: '220px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', flexShrink: 0 }}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedArtist.artistName}&backgroundColor=6366f1`} alt={selectedArtist.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                     <div style={{ flex: 1, paddingBottom: '1rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>
                          <Activity size={16} />
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Künstler Profile</span>
                       </div>
                       <h2 style={{ fontSize: '4rem', margin: 0, lineHeight: 1 }}>{selectedArtist.artistName}</h2>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '1rem' }}>Genre: {selectedArtist.primaryGenreName}</p>
                     </div>
                     <button className="btn-icon" onClick={() => setSelectedArtist(null)} style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                        <X size={20} />
                     </button>
                  </div>
                )}

                {/* THE ARTISTIC SEARCH FIELD (Prominent) */}
                {!selectedArtist && (
                  <div className="search-wrapper animate-up" style={{ 
                    width: '100%', 
                    maxWidth: (searchQuery ? '1000px' : '850px'), 
                    marginBottom: '3rem',
                    transform: searchQuery ? 'translateY(-20px)' : 'none',
                    transition: 'all 0.5s ease'
                  }}>
                    <Search className="search-icon" size={24} />
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder={isAnalyzing ? "Analysiere Audio-DNA..." : (appMode === 'artists' ? "Künstler suchen..." : "Discovery Engine: Songs, Künstler, Lyrics...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isAnalyzing}
                      style={{ 
                        borderColor: isListening ? 'var(--accent-pink)' : (isAnalyzing ? 'var(--accent-cyan)' : 'var(--glass-border)'),
                        boxShadow: (isListening || isAnalyzing) ? `0 0 40px ${isAnalyzing ? 'rgba(0, 242, 254, 0.4)' : 'rgba(233, 100, 67, 0.4)'}` : 'none'
                      }}
                    />
                    <div className="flex-center" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', gap: '10px' }}>
                      {searchQuery && <X size={20} className="clear-icon" onClick={() => setSearchQuery('')} style={{ cursor: 'pointer', opacity: 0.6 }} />}
                      <button 
                        className={`btn-icon ${isListening ? 'listening' : ''} ${isAnalyzing ? 'analyzing' : ''}`}
                        onClick={handleMicClick}
                        style={{ 
                          width: '45px', 
                          height: '45px', 
                          background: isListening ? 'var(--accent-pink)' : (isAnalyzing ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)'),
                          border: 'none',
                          boxShadow: (isListening || isAnalyzing) ? `0 0 15px currentColor` : 'none'
                        }}
                      >
                        <Mic size={20} color={isListening || isAnalyzing ? 'white' : 'var(--accent-cyan)'} />
                        {(isListening || isAnalyzing) && <div className="mic-pulse"></div>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {appMode === 'artists' && !selectedArtist && searchResults.length > 0 && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px' }}>
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
                          <div style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden' }}>
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${artist.artistName}&backgroundColor=random`} alt={artist.artistName} />
                          </div>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{artist.artistName}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{artist.primaryGenreName}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(appMode !== 'artists' || selectedArtist) && <SearchResults />}
                </div>
              </div>
            )}
          </main>
        </div>

        <AudioPlayer />
      </div>

      <style>{`
        .hero-title span { color: var(--accent-cyan); }
        .mic-btn.listening, .btn-icon.listening { color: white; }
        .btn-icon.analyzing { color: white; animation: rotate 2s linear infinite; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }
        .mic-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid currentColor;
          animation: mic-pulse 1.5s ease-out infinite;
        }
        @keyframes mic-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
