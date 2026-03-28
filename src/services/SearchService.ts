export interface ITunesTrack {
  trackId: number;
  artistName: string;
  trackName: string;
  collectionName: string;
  previewUrl: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
}

export const searchiTunes = async (query: string): Promise<ITunesTrack[]> => {
  if (!query) return [];
  
  try {
    // We use iTunes Search API as a reliable open database with 50M+ tracks
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=24`);
    const data = await response.json();
    return data.results as ITunesTrack[];
  } catch (error) {
    console.error("Fehler beim Abrufen der globalen Datenbank:", error);
    return [];
  }
};
