import { useAppStore } from '../store';
import { Palette, Layers, Box, Ghost, Sun } from 'lucide-react';

const PRESETS = [
  { name: 'Cyber Neon', hue: 190, blur: 20, radius: 20, mesh: true },
  { name: 'Galactic Gold', hue: 45, blur: 30, radius: 40, mesh: true },
  { name: 'Deep Space', hue: 280, blur: 15, radius: 10, mesh: false },
  { name: 'Solar Flare', hue: 15, blur: 25, radius: 50, mesh: true },
  { name: 'Minimal Frost', hue: 200, blur: 40, radius: 12, mesh: false },
  { name: 'Matrix Green', hue: 120, blur: 10, radius: 5, mesh: true },
  { name: 'Royal Velvet', hue: 320, blur: 25, radius: 25, mesh: false },
  { name: 'Ocean Mist', hue: 170, blur: 35, radius: 100, mesh: true },
];

export default function DesignStudio() {
  const { theme, setTheme } = useAppStore();

  const updateTheme = (key: string, value: any) => {
    setTheme({ [key]: value });
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="hero-section text-center">
        <h2 className="hero-title" style={{ fontSize: '3.5rem' }}>DESIGN<span>STUDIO</span></h2>
        <p className="hero-subtitle">Erschaffe dein OmniMusic. Über 50 Kombinationen für deine Galaxie.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Presets Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Palette color="var(--accent-cyan)" />
            <h3 style={{ margin: 0 }}>Design Presets</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {PRESETS.map(p => (
              <button 
                key={p.name} 
                className="btn btn-glass" 
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                onClick={() => setTheme(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Adjustments Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Layers color="var(--accent-purple)" />
            <h3 style={{ margin: 0 }}>Feinabstimmung</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="range-group">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <label>Farbton (Hue)</label>
                 <span>{theme.hue}°</span>
               </div>
               <input type="range" min="0" max="360" value={theme.hue} onChange={(e) => updateTheme('hue', parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div className="range-group">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <label>Glass-Unschärfe</label>
                 <span>{theme.blur}px</span>
               </div>
               <input type="range" min="0" max="60" value={theme.blur} onChange={(e) => updateTheme('blur', parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div className="range-group">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <label>Eckenradius</label>
                 <span>{theme.radius}px</span>
               </div>
               <input type="range" min="0" max="100" value={theme.radius} onChange={(e) => updateTheme('radius', parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

          </div>
        </div>

        {/* Layout & Style Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Box color="var(--accent-pink)" />
            <h3 style={{ margin: 0 }}>Layout & Engine</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <button className="btn btn-glass" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => updateTheme('mesh', !theme.mesh)}>
               <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                 <Ghost size={18} />
                 <span>Neural Mesh Hintergrund</span>
               </div>
               <div style={{ width: '40px', height: '20px', background: theme.mesh ? 'var(--accent-cyan)' : '#333', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: theme.mesh ? '22px' : '2px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }}></div>
               </div>
            </button>

            <button className="btn btn-glass" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => updateTheme('glow', !theme.glow)}>
               <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                 <Sun size={18} />
                 <span>Ambient Glow Effekt</span>
               </div>
               <div style={{ width: '40px', height: '20px', background: theme.glow ? 'var(--accent-pink)' : '#333', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: theme.glow ? '22px' : '2px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'all 0.3s' }}></div>
               </div>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
               {['display', 'sans', 'mono'].map(f => (
                 <button 
                  key={f}
                  className="btn btn-glass" 
                  style={{ flex: 1, textTransform: 'capitalize', borderColor: theme.font === f ? 'var(--accent-cyan)' : 'transparent' }}
                  onClick={() => updateTheme('font', f)}
                 >
                   {f}
                 </button>
               ))}
            </div>

          </div>
        </div>

      </div>

      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.1);
          height: 4px;
          border-radius: 2px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--accent-cyan);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px var(--accent-cyan);
        }
      `}</style>
    </div>
  );
}
