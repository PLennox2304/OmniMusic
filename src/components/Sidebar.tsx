import { useState } from 'react';
import { Home, Users, Clock, ListMusic, UserCircle, LogOut, Radar } from 'lucide-react';
import { useAppStore } from '../store';
import AuthModal from './AuthModal';

export default function Sidebar() {
  const { appMode, setAppMode, userSession, setUserSession } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);

  const navItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Home Universe' },
    { id: 'artists', icon: <Users size={20} />, label: 'Künstler-Nexus' },
    { id: 'timemachine', icon: <Clock size={20} />, label: 'Zeitmaschine' },
    { id: 'scanner', icon: <Radar size={20} />, label: 'Galactic Scanner' },
  ];

  return (
    <>
      <div className="glass-panel sidebar-container" style={{
        position: 'fixed', left: '2rem', top: '15vh', bottom: '150px', width: '250px',
        padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 10
      }}>
        
        <div className="sidebar-nav-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setAppMode(item.id as any)}
              className="btn btn-glass sidebar-btn"
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                background: appMode === item.id ? 'rgba(79, 172, 254, 0.2)' : 'transparent',
                borderColor: appMode === item.id ? 'var(--accent-cyan)' : 'transparent',
                color: appMode === item.id ? 'white' : 'var(--text-secondary)'
              }}
            >
              {item.icon}
              <span className="sidebar-btn-label">{item.label}</span>
            </button>
          ))}
          
          <div style={{ margin: '2rem 0', height: '1px', background: 'var(--glass-border)' }}></div>
          
          <button
            className="btn btn-glass sidebar-btn"
            style={{ justifyContent: 'flex-start', width: '100%', border: 'none' }}
            onClick={() => {
               if(userSession) {
                 alert("Hier würden die generierten Smart Playlists aus deiner Datenbank abgerufen.");
               } else {
                 setShowAuth(true);
               }
            }}
          >
            <ListMusic size={20} />
            <span className="sidebar-btn-label">Meine Playlists</span>
          </button>
        </div>

        <div className="sidebar-user-block">
          {userSession ? (
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(to right, var(--accent-purple), var(--accent-pink))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 U
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>Logged in as</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userSession.user?.email || 'User'}</p>
              </div>
              <button className="btn-icon" onClick={() => setUserSession(null)} style={{ width: 32, height: 32 }}>
                <LogOut size={16} color="var(--error)" />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary sidebar-btn sidebar-user-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowAuth(true)}>
              <UserCircle size={20} />
              <span className="sidebar-btn-label">Account Sync an</span>
            </button>
          )}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
