import { useEffect, useState, useRef } from 'react';
import { Search, Mic, Sparkles, Compass } from 'lucide-react';
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
  const { searchQuery, setSearchQuery, setIsSearching, setSearchResults, isPlaying, audioData, setMicAudioData, appMode, setAppMode } = useAppStore();

  const [showGenerator, setShowGenerator] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyzerRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const q = searchQuery.trim().toLowerCase();
      if (q.length > 2) {
        setIsSearching(true);
        
        // Smart Playlist NLP Parser
        if (q.includes('playlist') && q.includes('und')) {
           const names = q.replace('mache', '').replace('eine', '').replace('playlist', '').replace('mit', '').replace('von', '').split('und').map(n => n.trim()).filter(n => n);
           if (names.length > 0) {
             alert(`Smart Playlist NLP: Generiere Auto-Playlist für: ${names.join(' & ')} \n(Dieser Demo-Modus lädt nun einen Mix aus der DB)`);
             const results = await searchiTunes(`${names[0]} top hits`); // Fallback real search for the first artist
             setSearchResults(results);
             setIsSearching(false);
             return;
           }
        }

        const results = await searchiTunes(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, setSearchResults, setIsSearching]);

  // Handle Speech Recognition (Microphone)
  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Dein Browser unterstützt leider keine lokale Spracherkennung (Voice-to-Lyrics). Bitte verwende Chrome oder Edge für dieses Feature.");
      return;
    }

    if (isListening) return; // Prevent multiple instances

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE'; // Allow both German and English recognition broadly
    recognition.interimResults = true;
    recognition.continuous = false; // Stop when the user stops talking

    recognition.onstart = () => {
      setIsListening(true);
      setSearchQuery(''); // clear previous search
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

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      stopMicAnalysis();
    };

    const stopMicAnalysis = () => {
      if (micAnalyzerRef.current) micAnalyzerRef.current.stop();
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      setMicAudioData(null);
    };

    // Start Audio Analysis of Microphone using Meyda
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
    }).catch(err => {
      console.error("Mic error", err);
      // Fallback if no mic permission but still use speech if browser handles it internally?
      recognition.start();
    });
  };

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      {/* Background & 3D Environment */}
      <Visualizer3D isListening={isListening} />
      <div className="ambient-background" style={{ opacity: isPlaying || isListening ? 0 : 1 }}>
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
      </div>

      <Sidebar />

      <div style={{ flex: 1, paddingLeft: '280px', position: 'relative' }}>
        <header className="container" style={{ padding: '2rem 2rem 1rem 2rem' }}>
          <div className="flex-between">
            <div className="logo flex-center" style={{ gap: '0.75rem', cursor: 'pointer' }} onClick={() => { setShowGenerator(false); setAppMode('home'); }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass color="white" size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.75rem' }} className="text-gradient">OmniMusic</h1>
            </div>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-glass" onClick={() => { setShowGenerator(false); setAppMode('home'); }}>
                <Compass size={18} />
                Entdecken
              </button>
              <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={() => setShowGenerator(true)}>
                <Sparkles size={18} />
                KI Generator
              </button>
            </nav>
          </div>
        </header>

        <main className="main-content container flex-center" style={{ flexDirection: 'column', marginTop: searchQuery || appMode !== 'home' ? '2vh' : '10vh', transition: 'margin 0.5s ease' }}>
          
          {appMode === 'timemachine' && !showGenerator && (
            <TimeMachine />
          )}

          {showGenerator && (
            <AIGenerator />
          )}

          {!showGenerator && appMode !== 'timemachine' && (
            <>
              {!searchQuery && appMode === 'home' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '800px' }}>
                  <h1 style={{ fontSize: '4.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
                    Die <span className="text-gradient-purple">Ultimative</span> Musik-Dimension
                  </h1>
                  <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Durchsuche Milliarden echter Songs. Analysiere jede Frequenz in Echtzeit. 
                    Oder generiere völlig neue Klangwelten.
                  </p>
                </div>
              )}

              {appMode === 'artists' && (
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '700px', marginBottom: '2rem', textAlign: 'center' }}>
                   <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Finde jeden Künstler</h2>
                   <p style={{ color: 'var(--text-secondary)' }}>Gib einen Namen ein. Wir finden die besten Tracks weltweit.</p>
                </div>
              )}

              <div className="search-wrapper" style={{ width: '100%', maxWidth: '700px', marginBottom: '2rem' }}>
                <Search className="search-icon" size={24} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder={appMode === 'artists' ? "Künstler suchen..." : "Wonach suchst du? (Playlist, Künstler, Lyrics...)"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderColor: isListening ? 'var(--accent-pink)' : 'var(--glass-border)', boxShadow: isListening ? '0 0 15px rgba(233, 100, 67, 0.4)' : '' }}
                />
          <button 
            className="btn-icon" 
            style={{ 
              position: 'absolute', right: '10px', top: '10px', width: '40px', height: '40px', border: 'none', 
              background: isListening ? 'var(--accent-pink)' : 'var(--bg-surface)',
              animation: isListening ? 'pulse-glow 1s infinite alternate' : 'none'
            }}
            onClick={handleMicClick}
          >
            <Mic size={20} color={isListening ? 'white' : 'var(--accent-cyan)'} />
          </button>
        </div>

        {isListening && (
          <div className="animate-fade-in" style={{ color: 'var(--accent-pink)', marginBottom: '1rem', fontWeight: 'bold' }}>
            🎙️ Höre zu... Singe oder sprich Songtexte (Lyrics)...
          </div>
        )}

        {/* Live Audio Analysis Status */}
        {isPlaying && audioData && (
          <div className="glass-panel animate-fade-in" style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Stimmung:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{Math.max(10, Math.floor(audioData.energy * 200))}% Energetic</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Frequenz-ZCR:</span>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{Math.floor(audioData.zcr)} Hz</span>
            </div>
          </div>
        )}

        {!searchQuery && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            {['Trending: The Weeknd', 'Stimmung: 85% Chill', 'KI-Generierung: Synthwave', 'Deine Songroute'].map(tag => (
              <div key={tag} className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {tag}
              </div>
            ))}
          </div>
        )}

                    {/* Dynamic List */}
            </>
          )}

          {/* Dynamic List is shown anywhere if not generating */}
          {!showGenerator && <SearchResults />}
        </main>
      </div>

      <AudioPlayer />
    </div>
  );
}

export default App;
