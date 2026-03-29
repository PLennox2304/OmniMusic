import { useState } from 'react';
import { useAppStore } from '../store';
import { BarChart3, Users, DollarSign, CheckCircle, TrendingUp, Music, Layout } from 'lucide-react';

export default function CreatorNexus() {
  const { userProfile } = useAppStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'merch' | 'payouts'>('analytics');

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hero Header */}
      <div className="glass-panel" style={{ padding: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-cyan), var(--accent-purple))', position: 'relative' }}>
               <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent-blue)', borderRadius: '50%', border: '2px solid black', padding: '0.2rem' }}>
                  <CheckCircle size={20} color="white" fill="var(--accent-blue)" />
               </div>
            </div>
            <div>
               <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{userProfile?.username || 'Artemis'}</h2>
               <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '0.25rem 0 1rem' }}>Sänger & Songwriter • 2.5mio Monthly Listeners</p>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '0.7rem', fontWeight: 800, borderRadius: '4px' }}>VERIFIED ARTIST</span>
                  <span style={{ padding: '0.2rem 0.6rem', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)', fontSize: '0.7rem', fontWeight: 800, borderRadius: '4px' }}>OMEGA TIER</span>
               </div>
            </div>
         </div>
         <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Profil Editieren</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem' }}>
         <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-glass'}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={18} /> Analytics
         </button>
         <button className={`btn ${activeTab === 'merch' ? 'btn-primary' : 'btn-glass'}`} onClick={() => setActiveTab('merch')}>
            <Layout size={18} /> Merch & Store
         </button>
         <button className={`btn ${activeTab === 'payouts' ? 'btn-primary' : 'btn-glass'}`} onClick={() => setActiveTab('payouts')}>
            <DollarSign size={18} /> Payouts
         </button>
      </div>

      {/* Analytics View */}
      {activeTab === 'analytics' && (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Live Listener</h4>
                  <TrendingUp size={18} color="var(--success)" />
               </div>
               <div style={{ fontSize: '3rem', fontWeight: 900 }}>4.329</div>
               <p style={{ fontSize: '0.85rem', color: 'var(--success)', margin: '0.5rem 0 0' }}>+12% seit letzter Stunde</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Hör-Regionen</h4>
                  <Users size={18} color="var(--accent-cyan)" />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <span>Berlin, Deutschland</span>
                     <span style={{ fontWeight: 800 }}>45%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                     <span>Tokio, Japan</span>
                     <span style={{ fontWeight: 800 }}>25%</span>
                  </div>
               </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
               <h4 style={{ margin: '0 0 2rem' }}>Hörverlauf Evolution (7 Tage)</h4>
               <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {[40, 60, 45, 90, 100, 80, 110].map((h, i) => (
                     <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent-cyan)', borderRadius: '4px 4px 0 0', boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)', position: 'relative' }}>
                        <span style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', opacity: 0.5 }}>TAG {i+1}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* Merch View (Placeholder) */}
      {activeTab === 'merch' && (
         <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
            <Music size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
            <h3>Keine Artikel im Store</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Lade Merch-Designs hoch, um sie deinen Fans direkt in OmniMusic zu verkaufen.</p>
         </div>
      )}

    </div>
  );
}
