import { useState } from 'react';
import { Mail, Lock, X, LogIn } from 'lucide-react';
import { supabase, hasValidSupabaseKeys } from '../services/supabaseClient';
import { useAppStore } from '../store';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setUserSession = useAppStore(state => state.setUserSession);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidSupabaseKeys()) {
      setMessage('LOKALER MODUS: Dein Account wurde temporär im Browser simuliert. (Hinweis: Sobald du die kostenlosen Supabase Keys einträgst, wird dies eine echte weltweite Cloud-Speicherung!).');
      setUserSession({ user: { email: email } });
      setTimeout(() => onClose(), 3000);
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Erfolgreich registriert! Bitte bestätige deine E-Mail (falls konfiguriert).');
        if (data.session) setUserSession(data.session);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUserSession(data.session);
        onClose();
      }
    } catch (error: any) {
      setMessage(error.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <LogIn color="var(--accent-cyan)" />
          {isSignUp ? 'OmniMusic beitreten' : 'Willkommen zurück'}
        </h2>

         {!hasValidSupabaseKeys() && (
           <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--warning)' }}>
             Die App läuft im <b>Local Mode</b> (keine Supabase Keys gefunden). Logins werden momentan nur lokal simuliert.
           </div>
         )}
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="email" 
              placeholder="E-Mail Adresse" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="search-input" 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', fontSize: '1rem' }} 
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="password" 
              placeholder="Passwort" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="search-input" 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', fontSize: '1rem' }} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Lade...' : isSignUp ? 'Account erstellen' : 'Einloggen'}
          </button>
        </form>
        
        {message && (
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: isSignUp ? 'var(--success)' : 'var(--error)', textAlign: 'center' }}>{message}</p>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Du hast schon einen Account? ' : 'Noch kein Mitglied? '}
          <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Einloggen' : 'Registrieren'}
          </span>
        </div>
      </div>
    </div>
  );
}
