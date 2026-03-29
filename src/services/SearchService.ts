import { supabase } from './supabaseClient';

export interface ITunesTrack {
  trackId: number;
  artistName: string;
  trackName: string;
  previewUrl: string | null;
  artworkUrl100: string;
  collectionName: string;
  primaryGenreName: string;
}

export interface ITunesArtist {
  artistId: number;
  artistName: string;
  primaryGenreName: string;
  artistLinkUrl?: string;
}

export const searchiTunes = async (query: string, mode: 'songs' | 'artists' = 'songs'): Promise<any[]> => {
  if (!query) return [];
  
  try {
    const entity = mode === 'artists' ? 'musicArtist' : 'song';
    // Use iTunes Search API
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=${entity}&limit=50`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("iTunes API error:", error);
    return [];
  }
};
export const syncDiscoveredTrack = async (track: ITunesTrack) => {
   try {
     const { data, error } = await supabase.from('discovered_tracks').upsert([{
       track_id: track.trackId,
       track_name: track.trackName,
       artist_name: track.artistName,
       genre: track.primaryGenreName,
       artwork_url: track.artworkUrl100,
       platform_source: 'Global Sync',
       detected_at: new Date().toISOString()
     }], { onConflict: 'track_id' });
     if (error) console.error("Sync Error:", error);
     return data;
   } catch (e) {
     console.error("Cloud Write Error:", e);
   }
};

export const globalDiscoveryEngine = async (): Promise<ITunesTrack[]> => {
  try {
    // Phase 8.1 True Production: High-quality Worldwide Music Feeds
    const feeds = [
       'https://itunes.apple.com/search?term=pop&limit=15&entity=song&sort=recent',
       'https://itunes.apple.com/search?term=new&limit=15&entity=song&sort=recent',
       'https://itunes.apple.com/search?term=hiphop&limit=15&entity=song&sort=recent'
    ];
    const feed = feeds[Math.floor(Math.random() * feeds.length)];
    const res = await fetch(feed);
    const result = await res.json();
    const tracks = result.results || [];
    
    // Sync all found tracks to the database automatically
    for (const track of tracks) {
      await syncDiscoveredTrack(track);
    }
    
    return tracks;
  } catch (err) {
    console.error("Discovery Engine Failure:", err);
    return [];
  }
};

export const deepSearchArtist = async (name: string): Promise<ITunesTrack[]> => {
   // Fuzzy logic implementation for ShadoWorld111 and more
   const cleanName = name.replace(/\s+/g, '').toLowerCase();
   const query = (cleanName === 'shadoworld111' || cleanName.includes('shadoworld')) ? 'ShadoWorld111' : name;
   return await searchiTunes(query, 'songs');
};
export const recognizeMusic = async (audioBlob: Blob): Promise<ITunesTrack | null> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('api_token', 'test'); 
    formData.append('return', 'apple_music,spotify');

    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.status === 'success' && data.result) {
      const { title, artist } = data.result;
      const tracks = await searchiTunes(`${artist} ${title}`, 'songs');
      return tracks.length > 0 ? tracks[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Music Recognition Error:", error);
    return null;
  }
};
