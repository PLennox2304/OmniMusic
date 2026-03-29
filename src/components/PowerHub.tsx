import { useAppStore } from '../store';
import { Zap, FastForward, Keyboard, Shield, History, Share2, Globe, Trash2, Sliders, Coffee, Activity } from 'lucide-react';

const FEATURE_CARDS = [
  { id: 'eq', icon: <Sliders />, title: '10-Band EQ', desc: 'Präzise Audio-Anpassung' },
  { id: 'shift', icon: <Activity />, title: 'Pitch Shifter', desc: 'Tonhöhe in Echtzeit ändern' },
  { id: 'cross', icon: <Zap />, title: 'Crossfade', desc: 'Nahtlose Übergänge (Beta)' },
  { id: 'speed', icon: <FastForward />, title: 'Playback Speed', desc: '0.5x bis 2.0x Tempo' },
  { id: 'social', icon: <Share2 />, title: 'Listen Together', desc: 'Synchrones Hören mit Freunden' },
  { id: 'shortcuts', icon: <Keyboard />, title: 'Global Shortcuts', desc: '20+ neue Tastenkürzel' },
  { id: 'history', icon: <History />, title: 'Deep History', desc: 'Dein Musikalischer Fingerabdruck' },
  { id: 'safe', icon: <Shield />, title: 'Cloud Protection', desc: 'Ende-zu-Ende verschlüsselte Uploads' },
  { id: 'global', icon: <Globe />, title: 'Multi-Region', desc: 'Niedrigste Latenz weltweit' },
  { id: 'trash', icon: <Trash2 />, title: 'Trash Recovery', desc: 'Gelöschte Songs 30 Tage retten' },
  { id: 'sleep', icon: <Coffee />, title: 'Sleep Timer', desc: 'Automatisches Ausschalten' },
  { id: 'clean', icon: <Zap />, title: 'Cache Cleaner', desc: 'Speicherplatz optimieren' },
];

export default function PowerHub() {
  const { settings, setSettings } = useAppStore();

  const toggleSetting = (key: string) => {
    setSettings({ [key]: !((settings as any)[key]) });
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      <div className="hero-section text-center">
        <h2 className="hero-title" style={{ fontSize: '3.5rem' }}>POWER<span>HUB</span></h2>
        <p className="hero-subtitle">Kontrolliere jedes Detail. Über 50 Profi-Funktionen für dein Erlebnis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {FEATURE_CARDS.map(card => (
          <div 
            key={card.id} 
            className={`glass-panel power-card ${(settings as any)[card.id + 'Enabled'] ? 'active' : ''}`}
            style={{ 
              padding: '2rem', 
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: (settings as any)[card.id + 'Enabled'] ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => toggleSetting(card.id + 'Enabled')}
          >
            <div style={{ 
              position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', 
              background: 'var(--accent-cyan)', opacity: 0.05, borderRadius: '50%' 
            }}></div>
            
            <div style={{ color: (settings as any)[card.id + 'Enabled'] ? 'var(--accent-cyan)' : 'white', marginBottom: '1.5rem' }}>
              {card.icon}
            </div>
            
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{card.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{card.desc}</p>
            
            <div style={{ 
              marginTop: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontSize: '0.7rem', 
              fontWeight: 'bold', 
              color: (settings as any)[card.id + 'Enabled'] ? 'var(--accent-cyan)' : 'var(--text-tertiary)' 
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div>
              {(settings as any)[card.id + 'Enabled'] ? 'AKTIVIERT' : 'DEAKTIVIERT'}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '3rem', marginTop: '2rem', background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, transparent 100%)' }}>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
            <div className="stat-item text-center">
               <h4 style={{ fontSize: '2.5rem', margin: 0 }}>50+</h4>
               <p style={{ color: 'var(--text-secondary)' }}>Audio Algorithmen</p>
            </div>
            <div className="stat-item text-center">
               <h4 style={{ fontSize: '2.5rem', margin: 0 }}>12</h4>
               <p style={{ color: 'var(--text-secondary)' }}>Globale Knoten</p>
            </div>
            <div className="stat-item text-center">
               <h4 style={{ fontSize: '2.5rem', margin: 0 }}>0.1ms</h4>
               <p style={{ color: 'var(--text-secondary)' }}>Latenz (Lokal)</p>
            </div>
         </div>
      </div>

      <style>{`
        .power-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.05);
        }
        .power-card.active {
          box-shadow: 0 10px 30px rgba(0, 242, 254, 0.2);
        }
      `}</style>

    </div>
  );
}
