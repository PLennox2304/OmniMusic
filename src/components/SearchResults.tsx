import { useEffect, useState } from 'react';
import { Play, Activity, ExternalLink, Heart, Plus } from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';
import { supabase } from '../services/supabaseClient';
import { useAppStore } from '../store';
import type { ITunesTrack } from '../services/SearchService';

export default function SearchResults() {
  const { searchResults, isSearching, currentTrack, setCurrentTrack, setIsPlaying, userSession, userFavorites, toggleFavorite, setUserFavorites } = useAppStore();
  const [trackToPlaylist, setTrackToPlaylist] = useState<any | null>(null);

  // Load favorites from Supabase on mount
  useEffect(() => {
    if (userSession?.user?.id) {
       const loadFavs = async () => {
         const { data, error } = await supabase.from('user_favorites').select('*').eq('user_id', userSession.user.id);
         if (!error && data) {
           setUserFavorites(data.map((f: any) => ({
             trackId: f.track_id,
             artistName: f.artist_name,
             trackName: f.track_name,
             artworkUrl100: f.artwork_url,
             collectionName: '',
             previewUrl: '',
             primaryGenreName: ''
           })));
         }
       };
       loadFavs();
    }
  }, [userSession, setUserFavorites]);

  const handleToggleFavorite = async (e: React.MouseEvent, track: ITunesTrack) => {
    e.stopPropagation();
    if (!userSession) {
      alert("Logge dich ein, um Favoriten permanent in der Cloud zu speichern!");
      toggleFavorite(track);
      return;
    }

    const { trackId, artistName, trackName, artworkUrl100 } = track;
    const isFav = userFavorites.some(t => t.trackId === trackId);

    if (isFav) {
      const { error } = await supabase.from('user_favorites').delete().eq('user_id', userSession.user.id).eq('track_id', trackId);
      if (!error) toggleFavorite(track);
    } else {
      const { error } = await supabase.from('user_favorites').insert([{
        user_id: userSession.user.id,
        track_id: trackId,
        artist_name: artistName,
        track_name: trackName,
        artwork_url: artworkUrl100
      }]);
      if (!error) toggleFavorite(track);
    }
  };

  if (isSearching) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ display: 'inline-block', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (searchResults.length === 0) return null;

  const handlePlay = (track: ITunesTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    useAppStore.getState().addToHistory(track);
  };

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={24} color="var(--accent-cyan)" />
        Aktuelle Such-DNA
      </h2>
      
      <div className="grid-cards">
        {searchResults.map((track) => (
          <div key={track.trackId} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => handlePlay(track)}>
            <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
              <img src={track.artworkUrl100} alt={track.trackName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {currentTrack?.trackId === track.trackId && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: '2px', height: '20px', alignItems: 'flex-end' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ width: '4px', height: '100%', background: 'var(--accent-cyan)', animation: `bounce ${0.5 + i*0.1}s infinite alternate` }}></div>
                    ))}
                  </div>
                  <style>{`@keyframes bounce { 0% { height: 30%; } 100% { height: 100%; } }`}</style>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.trackName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artistName}</p>
            </div>
            
            <button className="btn-icon" style={{ flexShrink: 0, width: '36px', height: '36px' }} onClick={(e) => { e.stopPropagation(); handlePlay(track); }}>
              <Play size={16} fill="currentColor" />
            </button>
            <button 
              className="btn-icon" 
              style={{ 
                flexShrink: 0, width: '36px', height: '36px', 
                color: userFavorites.some(t => t.trackId === track.trackId) ? 'var(--accent-pink)' : 'var(--text-secondary)',
                borderColor: userFavorites.some(t => t.trackId === track.trackId) ? 'var(--accent-pink)' : 'var(--glass-border)'
              }} 
              onClick={(e) => handleToggleFavorite(e, track)}
            >
              <Heart size={16} fill={userFavorites.some(t => t.trackId === track.trackId) ? "currentColor" : "none"} />
            </button>
            <button 
              className="btn-icon" 
              title="Zu Playlist hinzufügen"
              style={{ flexShrink: 0, width: '36px', height: '36px', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
              onClick={(e) => { e.stopPropagation(); setTrackToPlaylist(track); }}
            >
              <Plus size={16} />
            </button>
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.artistName + ' ' + track.trackName)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-icon" 
              style={{ flexShrink: 0, width: '36px', height: '36px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error)', color: 'var(--error)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} />
            </a>
          </div>
        ))}
      </div>
      {trackToPlaylist && (
         <AddToPlaylistModal track={trackToPlaylist} onClose={() => setTrackToPlaylist(null)} />
      )}
    </div>
  );
}
