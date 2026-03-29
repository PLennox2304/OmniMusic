import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../services/supabaseClient';
import { Activity, MessageCircle, Heart, User, MapPin, Zap } from 'lucide-react';

export default function SocialSpace() {
  const { userProfile, socialFeed, setSocialFeed, userSession } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialFeed();
    const subscription = supabase
      .channel('public:activity_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_feed' }, payload => {
        setSocialFeed([payload.new, ...socialFeed]);
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchInitialFeed = async () => {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) console.error(error);
    else setSocialFeed(data || []);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="hero-section text-center">
        <h2 className="hero-title" style={{ fontSize: '3rem' }}>SOCIAL<span>SPACE</span></h2>
        <p className="hero-subtitle">Was hört das Omni-Universum gerade?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
        
        {/* Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
             <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Synchronisiere Social Graph...</div>
          ) : socialFeed.length === 0 ? (
             <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Noch keine Aktivitäten. Sei der Erste!</div>
          ) : (
            socialFeed.map((act) => (
              <div key={act.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="black" />
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 800 }}>{act.username || 'Anonymus'}</span>
                      <span style={{ color: 'var(--text-secondary)' }}> {act.action_type === 'listen' ? 'hört gerade' : 'hat kommentiert'}: </span>
                      {act.track_name}
                   </p>
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(act.created_at).toLocaleTimeString()} • <MapPin size={10} style={{ display: 'inline' }} /> Global Matrix</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button className="btn-icon" style={{ width: '32px', height: '32px' }}><Heart size={14} /></button>
                   <button className="btn-icon" style={{ width: '32px', height: '32px' }}><MessageCircle size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global Map & Leaderboard (Simulated Widgets) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="glass-panel" style={{ padding: '1.50rem' }}>
              <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} color="var(--accent-cyan)" /> Top Listener
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>1. @cyber_dj</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>LVL 42</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>2. @bass_queen</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>LVL 38</span>
                 </div>
              </div>
           </div>

           <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 0.5rem' }}>Livemap Beta</h4>
              <div style={{ width: '100%', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', top: '40%', left: '30%', width: '10px', height: '10px', background: 'var(--accent-cyan)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-cyan)' }}></div>
                 <div style={{ position: 'absolute', top: '60%', left: '70%', width: '10px', height: '10px', background: 'var(--accent-pink)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-pink)' }}></div>
                 <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--accent-cyan)', opacity: 0.1, borderRadius: '8px' }}></div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>2.540 Hörer online weltweit</p>
           </div>
        </div>

      </div>
    </div>
  );
}
