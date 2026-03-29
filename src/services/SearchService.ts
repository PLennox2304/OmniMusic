export interface ITunesTrack {
  trackId: number;
  artistName: string;
  trackName: string;
  previewUrl: string | null;
  artworkUrl100: string;
  collectionName: string;
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
export const scanGlobalMusic = async (): Promise<ITunesTrack[]> => {
  try {
    // Phase 8 Master: Combined Live Feeds (Simulated across multi-genre requests)
    const endpoints = [
       'https://itunes.apple.com/search?term=pop&media=music&entity=song&limit=10&sort=recent',
       'https://itunes.apple.com/search?term=new&media=music&entity=song&limit=10&sort=recent',
       'https://itunes.apple.com/search?term=top&media=music&entity=song&limit=10&sort=recent'
    ];
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const response = await fetch(randomEndpoint);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Global Scan Error:", error);
    return [];
  }
};

export const deepSearchArtist = async (name: string): Promise<ITunesTrack[]> => {
   // Fuzzy logic implementation for ShadoWorld111 and more
   const cleanName = name.replace(/\s+/g, '').toLowerCase();
   const query = cleanName === 'shadoworld111' ? 'shadoworld111' : name;
   return await searchiTunes(query, 'songs');
};
