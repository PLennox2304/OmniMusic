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

  appMode: 'home' | 'artists' | 'timemachine';
  setAppMode: (mode: 'home' | 'artists' | 'timemachine') => void;

  selectedArtist: any | null;
  setSelectedArtist: (artist: any | null) => void;

  userSession: any | null;
  setUserSession: (session: any | null) => void;
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
  setAppMode: (mode) => set({ appMode: mode, selectedArtist: null }),

  selectedArtist: null,
  setSelectedArtist: (artist) => set({ selectedArtist: artist }),

  userSession: null,
  setUserSession: (session) => set({ userSession: session })
}));
