import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Sparkles, Brain, Zap, Info, Activity } from 'lucide-react';

export default function AIInsight() {
  const { currentTrack, audioData } = useAppStore();
  const [insight, setInsight] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mood, setMood] = useState<{ label: string, color: string }>({ label: 'Calibrating...', color: 'var(--accent-cyan)' });

  useEffect(() => {
    if (!currentTrack) return;
    
    setIsGenerating(true);
    setInsight('Analysiere Lyrical Matrix & Frequenzmuster...');

    // Simulate Deep AI Insight Generation
    setTimeout(() => {
      const insights = [
        `"${currentTrack.trackName}" von ${currentTrack.artistName} verbindet melodische Harmonien mit einer tiefen emotionalen Unterströmung. Die lyrische Tiefe deutet auf Themen der Selbsterkenntnis und urbanen Einsamkeit hin.`,
        `Hier hören wir eine Fusion aus modernen Synths und klassischen Rhythmen. Die Energie von ${currentTrack.artistName} in diesem Track ist auf einem Peak-Level, was typisch für den Zeitgeist der Musik-Renaissance ist.`,
        `Ein Meisterwerk der Atmosphäre. Die klanglichen Texturen erzeugen ein Gefühl von Weite, während die Lyrics eine persönliche Geschichte von Transformation und Aufbruch erzählen.`
      ];
      setInsight(insights[Math.floor(Math.random() * insights.length)]);
      
      // Mood detection simulation based on audio energy
      const energy = audioData?.energy || 0.5;
      if (energy > 0.7) setMood({ label: 'Hyper-Energetisch 🔥', color: 'var(--accent-pink)' });
      else if (energy > 0.4) setMood({ label: 'Chill & Flow 🌊', color: 'var(--accent-cyan)' });
      else setMood({ label: 'Melancholisch 😢', color: 'var(--accent-purple)' });
      
      setIsGenerating(false);
    }, 2000);

  }, [currentTrack]);

  if (!currentTrack) return null;

  return (
    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', border: '1px solid var(--accent-cyan)', background: 'rgba(0, 242, 254, 0.05)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-cyan)', fontSize: '1.2rem' }}>
          <Brain size={24} />
          OMNI-GENIUS AI INSIGHT
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: mood.color, color: 'black', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>
           <Activity size={14} />
           {mood.label}
        </div>
      </div>

      <div style={{ position: 'relative', minHeight: '100px' }}>
        {isGenerating ? (
           <div className="flex-center" style={{ height: '100px' }}>
              <Zap size={30} className="animate-spin" color="var(--accent-cyan)" />
           </div>
        ) : (
           <p style={{ fontSize: '1.1rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic', letterSpacing: '0.5px' }}>
              "{insight}"
           </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            Künstler-DNA Analysis: 100% Match
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Info size={16} color="var(--accent-cyan)" />
            Semantic Lyrics Meaning: High Depth
         </div>
      </div>

    </div>
  );
}
