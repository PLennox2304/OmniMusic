import { create } from 'zustand';
import type { ITunesTrack } from './services/SearchService';

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  searchResults: ITunesTrack[];
  setSearchResults: (results: ITunesTrack[]) => void;
  
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  
  currentTrack: ITunesTrack | null;
  setCurrentTrack: (track: ITunesTrack | null) => void;
  
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;

  userHistory: ITunesTrack[];
  addToHistory: (track: ITunesTrack) => void;
  
  // Audio Analysis State
  audioData: { rms: number; energy: number; zcr: number } | null;
  setAudioData: (data: { rms: number; energy: number; zcr: number } | null) => void;

  micAudioData: { rms: number; energy: number; zcr: number } | null;
  setMicAudioData: (data: { rms: number; energy: number; zcr: number } | null) => void;

  appMode: 'home' | 'artists' | 'timemachine' | 'scanner' | 'aistudio';
  setAppMode: (mode: 'home' | 'artists' | 'timemachine' | 'scanner' | 'aistudio') => void;

  selectedArtist: any | null;
  setSelectedArtist: (artist: any | null) => void;

  userFavorites: ITunesTrack[];
  setUserFavorites: (favorites: ITunesTrack[]) => void;
  toggleFavorite: (track: ITunesTrack) => void;

  userSession: any | null;
  setUserSession: (session: any | null) => void;

  scannedTracks: ITunesTrack[];
  addScannedTracks: (tracks: ITunesTrack[]) => void;
  lastScannerMessage: string;
  setLastScannerMessage: (msg: string) => void;

  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;

  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  
  isSearching: false,
  setIsSearching: (isSearching) => set({ isSearching: isSearching }),
  
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),
  
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  userHistory: [],
  addToHistory: (track) => set((state) => ({ 
    userHistory: [track, ...state.userHistory.filter(t => t.trackId !== track.trackId)].slice(0, 50) 
  })),

  audioData: null,
  setAudioData: (data) => set({ audioData: data }),

  micAudioData: null,
  setMicAudioData: (data) => set({ micAudioData: data }),
  
  appMode: 'home',
  setAppMode: (mode) => set({ appMode: mode, selectedArtist: null, searchQuery: '' }),

  selectedArtist: null,
  setSelectedArtist: (artist) => set({ selectedArtist: artist }),

  userFavorites: [],
  setUserFavorites: (favorites) => set({ userFavorites: favorites }),
  toggleFavorite: (track) => set((state) => {
    const isFav = state.userFavorites.some(t => t.trackId === track.trackId);
    if (isFav) {
      return { userFavorites: state.userFavorites.filter(t => t.trackId !== track.trackId) };
    } else {
      return { userFavorites: [...state.userFavorites, track] };
    }
  }),

  userSession: null,
  setUserSession: (session) => set({ userSession: session }),

  scannedTracks: [],
  addScannedTracks: (newTracks) => set((state) => {
    const existingIds = new Set(state.scannedTracks.map(t => t.trackId));
    const uniqueNew = newTracks.filter(t => !existingIds.has(t.trackId));
    return { scannedTracks: [...uniqueNew, ...state.scannedTracks].slice(0, 100) };
  }),
  lastScannerMessage: 'Scanner bereit...',
  setLastScannerMessage: (msg) => set({ lastScannerMessage: msg }),

  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  isListening: false,
  setIsListening: (listening) => set({ isListening: listening })
}));
