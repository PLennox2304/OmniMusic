import { useEffect, useState } from 'react';
import { Search, Mic, Sparkles, Compass, X, Layout } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { useAppStore } from './store';
import { deepSearchArtist, recognizeMusic } from './services/SearchService';
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
    setSearchResults, setIsSearching,
    setCurrentTrack, setIsPlaying,
    userSession, setUserSession, isAnalyzing, setIsAnalyzing,
    isListening, setIsListening
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

          <div className="search-pill flex-center">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder={isAnalyzing ? "Analysiere..." : "Suche Galaxien, Künstler oder Genres..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isAnalyzing}
            />
            {searchQuery && (
              <X size={18} className="clear-icon" onClick={() => setSearchQuery('')} />
            )}
            <div 
              className={`mic-btn flex-center ${isListening ? 'listening' : ''} ${isAnalyzing ? 'analyzing' : ''}`} 
              onClick={handleMicClick}
            >
              <Mic size={18} />
              {(isListening || isAnalyzing) && <div className="mic-pulse"></div>}
            </div>
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
          <main className="main-content container flex-center" style={{ flexDirection: 'column', marginTop: cinematicMode ? '0' : (searchQuery || appMode !== 'home' ? '2vh' : '10vh'), transition: 'all 0.5s ease' }}>
            
            {/* Conditional Mode Rendering - CLEAN VERSION */}
            {appMode === 'timemachine' && <TimeMachine />}
            {appMode === 'scanner' && <ScannerView />}
            {appMode === 'aistudio' && <AIGenerator />}

            {(appMode === 'home' || appMode === 'artists') && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Home Intro */}
                {!searchQuery && appMode === 'home' && (
                  <div className="hero-section text-center animate-up">
                    <h2 className="hero-title">Deine Musik. <br/>Deine Galaxie.</h2>
                    <p className="hero-subtitle">Erlebe Sound in einer neuen Dimension. Cloud-sync, KI-gesteuerte Discoveries und neuronale Visuals.</p>
                    <div className="hero-btns flex-center">
                      <button className="btn btn-primary btn-large" onClick={() => setAppMode('artists')}>Jetzt Entdecken</button>
                      <button className="btn btn-glass btn-large" onClick={() => setAppMode('aistudio')}>AI Song erstellen</button>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                <SearchResults />
              </div>
            )}
          </main>
        </div>

        <AudioPlayer />
      </div>

      <style>{`
        .mic-btn.listening { color: var(--accent-pink); }
        .mic-btn.analyzing { color: var(--accent-cyan); animation: rotate 2s linear infinite; }
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
        .header-actions .btn.active {
          box-shadow: 0 0 20px var(--accent-blue);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
}

