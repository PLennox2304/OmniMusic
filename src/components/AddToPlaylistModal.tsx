import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../services/supabaseClient';
import { Plus, X, ListPlus, CheckCircle } from 'lucide-react';

interface AddToPlaylistModalProps {
  track: any;
  onClose: () => void;
}

export default function AddToPlaylistModal({ track, onClose }: AddToPlaylistModalProps) {
  const { userSession } = useAppStore();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userSession) {
      fetchPlaylists();
    }
  }, [userSession]);

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from('user_playlists')
      .select('*')
      .eq('user_id', userSession?.user.id)
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setPlaylists(data || []);
  };

  const addToPlaylist = async (playlistId: string) => {
    const { error } = await supabase
      .from('playlist_tracks')
      .insert([{
        playlist_id: playlistId,
        track_id: track.trackId,
        track_data: track
      }]);
    
    if (error) {
      console.error(error);
      alert("Fehler beim Hinzufügen.");
    } else {
      setSuccess(true);
      setTimeout(onClose, 1500);
    }
  };

  const createAndAdd = async () => {
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);

    const { data, error } = await supabase
      .from('user_playlists')
      .insert([{
        user_id: userSession?.user.id,
        name: newPlaylistName
      }])
      .select();

    if (error) {
      console.error(error);
      alert("Fehler beim Erstellen.");
    } else if (data && data[0]) {
      await addToPlaylist(data[0].id);
    }
    setIsCreating(false);
  };

  return (
    <div className="flex-center" style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
      {/* Backdrop */}
      <div 
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} 
        onClick={onClose}
      />
      
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative' }}>
        <button className="btn-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={onClose}>
          <X size={20} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
             <CheckCircle size={60} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
             <h2 style={{ margin: 0 }}>Hinzugefügt!</h2>
             <p style={{ color: 'var(--text-secondary)' }}>Deine Playlist wurde um 1 Song erweitert.</p>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ListPlus size={24} color="var(--accent-cyan)" />
              Zu Playlist hinzufügen
            </h2>
            
            <div style={{ marginBottom: '2rem' }}>
               <h4 style={{ marginBottom: '1rem', color: 'var(--text-tertiary)' }}>Bestehende Playlists</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                 {playlists.map(pl => (
                   <button 
                    key={pl.id} 
                    className="btn btn-glass" 
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.9rem' }}
                    onClick={() => addToPlaylist(pl.id)}
                   >
                     {pl.name}
                   </button>
                 ))}
                 {playlists.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Noch keine Playlists.</p>}
               </div>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
               <h4 style={{ marginBottom: '1rem', color: 'var(--text-tertiary)' }}>Neue Playlist erstellen</h4>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Name der Playlist..." 
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    style={{ padding: '0.75rem 1.25rem', fontSize: '1rem', flex: 1 }}
                  />
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.75rem' }} 
                    onClick={createAndAdd}
                    disabled={isCreating}
                  >
                    <Plus size={20} />
                  </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
