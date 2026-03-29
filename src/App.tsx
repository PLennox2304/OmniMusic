import { useEffect, useState } from 'react';
import { Search, Mic, Sparkles, Compass, X, Layout, Palette, Zap, Users, UserCircle, Crown, Activity, Cloud } from 'lucide-react';
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
import DesignStudio from './components/DesignStudio';
import PowerHub from './components/PowerHub';
import UploadHub from './components/UploadHub';
import PlaylistView from './components/PlaylistView';
import SocialSpace from './components/SocialSpace';
import ProfileNexus from './components/ProfileNexus';
import CreatorNexus from './components/CreatorNexus';
import SpectrumVisualizer from './components/SpectrumVisualizer';
import AIInsight from './components/AIInsight';
import LyricsKaraoke from './components/LyricsKaraoke';
import { getUserUploads } from './services/StorageService';

export default function App() {
  const state = useAppStore();
  const { 
    appMode, setAppMode, searchQuery, setSearchQuery, 
    searchResults, setSearchResults, setIsSearching,
    currentTrack, setCurrentTrack, isPlaying, setIsPlaying,
    userSession, setUserSession, isAnalyzing, setIsAnalyzing,
    isListening, setIsListening,
    selectedArtist, setSelectedArtist,
    theme, setUserUploads, userProfile, addXP, settings
  } = state;

  const [cinematicMode, setCinematicMode] = useState(false);

  // Neural Theme Engine Injection
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-hue', theme.hue.toString());
    root.style.setProperty('--glass-blur', `${theme.blur}px`);
    root.style.setProperty('--glass-radius', `${theme.radius}px`);
    
    // Power User: Font Swapping
    const fontMap = {
      display: "'Outfit', sans-serif",
      sans: "'Inter', sans-serif",
      mono: "'Fira Code', monospace"
    };
    root.style.setProperty('--font-sans', fontMap[theme.font]);
    
    // Performance: Toggle Mesh
    const mesh = document.querySelector('.neural-mesh') as HTMLElement;
    if (mesh) mesh.style.display = theme.mesh ? 'block' : 'none';
  }, [theme]);

  // Auth & Cloud Sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if(session) {
        getUserUploads(session.user.id).then(setUserUploads);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      if(session) {
        getUserUploads(session.user.id).then(setUserUploads);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserSession, setUserUploads]);

  // XP Gamification Loop
  useEffect(() => {
    if (isPlaying && currentTrack) {
       const xpInterval = setInterval(() => {
          addXP(5);
       }, 30000); 
       return () => clearInterval(xpInterval);
    }
  }, [isPlaying, currentTrack, addXP]);

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
      setSearchQuery('Höre zu...');
      await audioRecorder.startRecording();
      
      setTimeout(async () => {
        setIsListening(false);
        setIsAnalyzing(true);
        setSearchQuery('Analysiere...');
        
        try {
          const blob = await audioRecorder.stopRecording();
          const track = await recognizeMusic(blob);
          
          if (track) {
            setSearchQuery(track.trackName);
            setCurrentTrack(track);
            setIsPlaying(true);
            setSearchResults([track]);
            addXP(50);
          } else {
            setSearchQuery('Kein Treffer.');
          }
        } catch (err) {
          console.error(err);
          setSearchQuery('Cloud-Fehler.');
        } finally {
          setIsAnalyzing(false);
        }
      }, 5000);

    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <div className={`app-container ${cinematicMode ? 'cinematic' : ''}`}>
      <Visualizer3D />
      <GlobalTicker />
      
      {!cinematicMode && <Sidebar />}

      <div className="main-wrapper">
        <header className="header container flex-between" style={{ padding: '1.5rem 2rem' }}>
          <div className="logo flex-center" onClick={() => { setAppMode('home'); setSearchQuery(''); }}>
            <div className="logo-icon ripple"></div>
            <h1 className="logo-text">OMNI<span>MUSIC</span></h1>
          </div>

          {!cinematicMode && userProfile && (
             <div className="flex-center" style={{ gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1.5rem', borderRadius: '50px', border: '1px solid var(--glass-border)' }}>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-cyan)', letterSpacing: '1px' }}>LVL {userProfile.level}</div>
                   <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${userProfile.xp % 100}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
                   </div>
                </div>
                <div className="btn-icon" onClick={() => setAppMode('profile')} style={{ width: 40, height: 40, background: 'var(--accent-cyan)', color: 'black' }}>
                   <UserCircle size={24} />
                </div>
             </div>
          )}

          <div className="header-actions flex-center">
            <button className="btn-icon" onClick={() => setAppMode('social')} title="Social Hub">
              <Users size={20} />
            </button>
            <button className="btn-icon" onClick={() => setAppMode('creator')} title="Creator Nexus">
              <Crown size={20} />
            </button>
            <button className="btn-icon" onClick={() => setAppMode('cloud')} title="Cloud Storage">
              <Cloud size={20} />
            </button>
            <button className="btn-icon" onClick={() => setAppMode('design')} title="Design Studio">
              <Palette size={20} />
            </button>
            <button className="btn-icon" onClick={() => setAppMode('power')} title="Power Hub">
               <Zap size={20} />
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
            alignItems: 'center',
            paddingBottom: '200px'
          }}>
            
            {appMode === 'timemachine' && <TimeMachine />}
            {appMode === 'scanner' && <ScannerView />}
            {appMode === 'aistudio' && <AIGenerator />}
            {appMode === 'design' && <DesignStudio />}
            {appMode === 'power' && <PowerHub />}
            {appMode === 'cloud' && <UploadHub />}
            {appMode === 'playlists' && <PlaylistView />}
            {appMode === 'social' && <SocialSpace />}
            {appMode === 'profile' && <ProfileNexus />}
            {appMode === 'creator' && <CreatorNexus />}

            {(appMode === 'home' || appMode === 'artists') && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                {!searchQuery && !selectedArtist && (
                  <div className="hero-section text-center animate-up" style={{ marginBottom: '1rem' }}>
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

                {selectedArtist && (
                  <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '1000px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-end', gap: '3rem', padding: '4rem', position: 'relative' }}>
                     <div style={{ width: '250px', height: '250px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', flexShrink: 0 }}>
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedArtist.artistName}&backgroundColor=6366f1`} alt={selectedArtist.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                     <div style={{ flex: 1, paddingBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>
                          <Compass size={20} />
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px' }}>Pro Künstler</span>
                       </div>
                       <h2 style={{ fontSize: '5rem', margin: 0, lineHeight: 1 }}>{selectedArtist.artistName}</h2>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', marginTop: '1.25rem' }}>{selectedArtist.primaryGenreName}</p>
                     </div>
                     <button className="btn-icon" onClick={() => setSelectedArtist(null)} style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                        <X size={20} />
                     </button>
                  </div>
                )}

                {!selectedArtist && (
                  <div className="search-wrapper animate-up" style={{ 
                    width: '100%', 
                    maxWidth: (searchQuery ? '1000px' : '900px'), 
                    marginBottom: '1.5rem',
                    transform: searchQuery ? 'translateY(-30px)' : 'none',
                    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                  }}>
                    <Search className="search-icon" size={28} />
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder={isAnalyzing ? "Analysiere Audio-DNA..." : (appMode === 'artists' ? "Künstler-Nexus durchsuchen..." : "Discovery Engine: Songs, Künstler, Lyrics...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isAnalyzing}
                      style={{ 
                        padding: '1.5rem 2rem 1.5rem 4.5rem',
                        fontSize: '1.25rem',
                        borderColor: isListening ? 'var(--accent-pink)' : (isAnalyzing ? 'var(--accent-cyan)' : 'var(--glass-border)'),
                        boxShadow: (isListening || isAnalyzing) ? `0 0 50px ${isAnalyzing ? 'rgba(0, 242, 254, 0.5)' : 'rgba(233, 100, 67, 0.5)'}` : 'none'
                      }}
                    />
                    <div className="flex-center" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', gap: '12px' }}>
                      {searchQuery && <X size={24} className="clear-icon" onClick={() => setSearchQuery('')} style={{ cursor: 'pointer', opacity: 0.6 }} />}
                      <button 
                        className={`btn-icon ${isListening ? 'listening' : ''} ${isAnalyzing ? 'analyzing' : ''}`}
                        onClick={handleMicClick}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          background: isListening ? 'var(--accent-pink)' : (isAnalyzing ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)'),
                          border: 'none',
                          boxShadow: (isListening || isAnalyzing) ? `0 0 20px currentColor` : 'none'
                        }}
                      >
                        <Mic size={24} color={isListening || isAnalyzing ? 'white' : 'var(--accent-cyan)'} />
                        {(isListening || isAnalyzing) && <div className="mic-pulse"></div>}
                      </button>
                    </div>
                  </div>
                )}

                {isPlaying && currentTrack && !searchQuery && (
                  <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                     <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button className={`btn ${settings.karaoke ? 'btn-primary' : 'btn-glass'}`} onClick={() => state.setSettings({ karaoke: !settings.karaoke })}>
                           <Activity size={16} /> {settings.karaoke ? 'Lyrics Aus' : 'Karaoke Mode'}
                        </button>
                        <button className="btn btn-glass" title="Frequenz-Analyse">
                           <Zap size={16} /> Spektrum
                        </button>
                     </div>
                     <SpectrumVisualizer />
                     {settings.karaoke && <LyricsKaraoke />}
                     <AIInsight />
                  </div>
                )}

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {appMode === 'artists' && !selectedArtist && searchResults.length > 0 && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem', width: '100%', maxWidth: '1300px' }}>
                      {searchResults.map((artist: any) => (
                        <div 
                          key={artist.artistId} 
                          className="glass-panel" 
                          style={{ padding: '2.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid transparent' }}
                          onClick={async () => {
                            setSelectedArtist(artist);
                            setIsSearching(true);
                            const songs = await searchiTunes(artist.artistName, 'songs');
                            setSearchResults(songs);
                            setIsSearching(false);
                          }}
                        >
                          <div style={{ width: '140px', height: '140px', margin: '0 auto 2rem', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${artist.artistName}&backgroundColor=random`} alt={artist.artistName} />
                          </div>
                          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{artist.artistName}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{artist.primaryGenreName}</p>
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
