import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../services/supabaseClient';
import { Play, Trash2, Music, ListMusic, X } from 'lucide-react';

export default function PlaylistView() {
  const { userSession, setCurrentTrack, setIsPlaying } = useAppStore();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchTracks = async (playlistId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('playlist_tracks')
      .select('*')
      .eq('playlist_id', playlistId);
    
    if (error) console.error(error);
    else setPlaylistTracks(data || []);
    setIsLoading(false);
  };

  const handlePlaylistClick = (playlist: any) => {
    setSelectedPlaylist(playlist);
    fetchTracks(playlist.id);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="hero-section text-center">
        <h2 className="hero-title" style={{ fontSize: '3.5rem' }}>MUSIK<span>GALAXIEN</span></h2>
        <p className="hero-subtitle">Deine persönlichen Playlists. Synchronisiert in Lichtgeschwindigkeit.</p>
      </div>

      {!selectedPlaylist ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {playlists.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center' }}>
               <ListMusic size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
               <h3>Noch keine Playlists erstellt.</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Füge Songs über das "+" Icon zu einer Playlist hinzu.</p>
            </div>
          ) : (
            playlists.map(pl => (
              <div 
                key={pl.id} 
                className="glass-panel playlist-card" 
                style={{ padding: '2rem', cursor: 'pointer', textAlign: 'center' }}
                onClick={() => handlePlaylistClick(pl)}
              >
                <div style={{ width: 120, height: 120, margin: '0 auto 1.5rem', borderRadius: '12%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Music size={40} color="white" />
                </div>
                <h3 style={{ margin: 0 }}>{pl.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{new Date(pl.created_at).toLocaleDateString()} erstellt</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
             <button className="btn-icon" onClick={() => setSelectedPlaylist(null)}>
                <X size={20} />
             </button>
             <div style={{ width: 80, height: 80, borderRadius: '12%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music size={30} color="white" />
             </div>
             <div>
                <h2 style={{ margin: 0, fontSize: '2.5rem' }}>{selectedPlaylist.name}</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{playlistTracks.length} Songs in dieser Galaxie</p>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isLoading ? (
               <div style={{ textAlign: 'center', padding: '3rem' }}>Lade Songs...</div>
            ) : playlistTracks.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>Diese Playlist ist leer.</div>
            ) : (
              playlistTracks.map(pt => {
                const track = pt.track_data;
                return (
                  <div 
                    key={pt.id} 
                    className="glass-panel track-row" 
                    style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 1.5rem', cursor: 'pointer' }}
                    onClick={() => {
                        setCurrentTrack(track);
                        setIsPlaying(true);
                    }}
                  >
                     <div className="play-btn-circle" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={16} fill="currentColor" />
                     </div>
                     <img src={track.artworkUrl100} style={{ width: 40, height: 40, borderRadius: '6px' }} alt="" />
                     <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{track.trackName}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{track.artistName}</p>
                     </div>
                     <button className="btn-icon">
                        <Trash2 size={16} color="var(--error)" />
                     </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        .playlist-card:hover { transform: translateY(-5px); border-color: var(--accent-cyan); }
        .track-row:hover { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
}
