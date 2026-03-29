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
