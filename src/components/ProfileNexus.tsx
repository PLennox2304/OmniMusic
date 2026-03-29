import { useAppStore } from '../store';
import { User, Award, Activity, History, Shield, Zap, TrendingUp, Info } from 'lucide-react';

export default function ProfileNexus() {
  const { userProfile, userSession, userHistory } = useAppStore();

  if (!userProfile) return null;

  const xpProgress = (userProfile.xp % 100);

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
         {/* Background Glow */}
         <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '400px', height: '400px', background: 'var(--accent-cyan)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.1, zIndex: 0 }}></div>
         
         <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 120, height: 120, borderRadius: '24px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)' }}>
               <User size={60} color="black" />
            </div>
            <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ fontSize: '3rem', margin: 0, fontWeight: 900, letterSpacing: '-2px' }}>{userProfile.username}</h2>
                  {userProfile.verified && <Shield size={24} color="var(--accent-blue)" fill="var(--accent-blue)" />}
               </div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"{userProfile.bio || 'Reise durch das Omni-Universum.'}"</p>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
         
         {/* XP & Level Panel */}
         <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', letterSpacing: '2px', fontWeight: 800 }}>LISTEN_LEVEL</h4>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
               <div style={{ fontSize: '5rem', fontWeight: 950, color: 'var(--accent-cyan)', textShadow: '0 0 30px var(--accent-cyan)', lineHeight: 1 }}>{userProfile.level}</div>
               <Zap size={24} color="var(--accent-cyan)" style={{ position: 'absolute', top: 0, right: '-20px' }} />
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
               <div style={{ width: `${xpProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))', boxShadow: '0 0 15px var(--accent-cyan)' }}></div>
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{userProfile.xp} / {(userProfile.level + 1) ** 2 * 100} XP bis LVL {userProfile.level + 1}</p>
         </div>

         {/* Badges Panel */}
         <div className="glass-panel" style={{ padding: '2rem' }}>
            <h4 style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', letterSpacing: '2px', fontWeight: 800 }}>BADGES_COLLECTION</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
               {userProfile.badges.map((badge, i) => (
                  <div key={i} title={badge} style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-pink)', color: 'var(--accent-pink)', cursor: 'help' }}>
                     <Award size={20} />
                  </div>
               ))}
               <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--text-tertiary)', color: 'var(--text-tertiary)' }}>
                  <Info size={20} />
               </div>
            </div>
         </div>

      </div>

      {/* DNA Statistics */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
         <h4 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <TrendingUp size={24} color="var(--accent-cyan)" /> AKTUELLE HÖR-DNA
         </h4>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '2rem', fontWeight: 800 }}>{userHistory.length}</div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>Tracks Entdeckt</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '2rem', fontWeight: 800 }}>24.5h</div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>Listen Time</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '2rem', fontWeight: 800 }}>88%</div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>Cyberpunk Affinity</p>
            </div>
         </div>
      </div>

    </div>
  );
}
