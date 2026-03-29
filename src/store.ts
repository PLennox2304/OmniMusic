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

  appMode: 'home' | 'artists' | 'timemachine' | 'scanner' | 'aistudio' | 'design' | 'power' | 'cloud' | 'playlists' | 'social' | 'profile';
  setAppMode: (mode: 'home' | 'artists' | 'timemachine' | 'scanner' | 'aistudio' | 'design' | 'power' | 'cloud' | 'playlists' | 'social' | 'profile') => void;

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

  // Phase 15: God Mode & Social Intelligence
  socialFeed: any[];
  setSocialFeed: (feed: any[]) => void;
  
  userProfile: {
    username: string;
    xp: number;
    level: number;
    badges: string[];
    bio?: string;
    verified: boolean;
  } | null;
  setUserProfile: (profile: any) => void;
  addXP: (amount: number) => void;

  trackComments: Record<string, any[]>;
  addComment: (trackId: string, comment: any) => void;

  theme: {
    hue: number;
    blur: number;
    radius: number;
    glow: boolean;
    mesh: boolean;
    layout: 'sidebar-left' | 'sidebar-bottom' | 'compact';
    font: 'sans' | 'display' | 'mono';
  };
  setTheme: (theme: Partial<AppState['theme']>) => void;

  settings: {
    eqEnabled: boolean;
    crossfade: number;
    playbackSpeed: number;
    shortcuts: boolean;
    visualizerMode: 'sphere' | 'neural' | 'bars' | 'wave';
    karaoke: boolean;
  };
  setSettings: (settings: Partial<AppState['settings']>) => void;

  playbackTime: number;
  setPlaybackTime: (time: number) => void;

  userUploads: any[];
  setUserUploads: (uploads: any[]) => void;
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
  setIsListening: (listening) => set({ isListening: listening }),

  // Phase 15: God Mode Implementations
  socialFeed: [],
  setSocialFeed: (feed) => set({ socialFeed: feed }),
  
  userProfile: {
    username: 'Musik-Pionier',
    xp: 0,
    level: 1,
    badges: ['Neuling'],
    verified: false
  },
  setUserProfile: (profile) => set({ userProfile: profile }),
  addXP: (amount) => set((state) => {
    if (!state.userProfile) return state;
    const newXP = state.userProfile.xp + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    return { 
      userProfile: { 
        ...state.userProfile, 
        xp: newXP, 
        level: newLevel > state.userProfile.level ? newLevel : state.userProfile.level 
      } 
    };
  }),

  trackComments: {},
  addComment: (trackId, comment) => set((state) => ({
    trackComments: {
      ...state.trackComments,
      [trackId]: [comment, ...(state.trackComments[trackId] || [])]
    }
  })),

  theme: {
    hue: 190,
    blur: 20,
    radius: 20,
    glow: true,
    mesh: true,
    layout: 'sidebar-left',
    font: 'display'
  },
  setTheme: (newTheme) => set((state) => ({ theme: { ...state.theme, ...newTheme } })),

  settings: {
    eqEnabled: false,
    crossfade: 0,
    playbackSpeed: 1,
    shortcuts: true,
    visualizerMode: 'sphere',
    karaoke: false
  },
  setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  userUploads: [],
  setUserUploads: (uploads) => set({ userUploads: uploads }),

  playbackTime: 0,
  setPlaybackTime: (time) => set({ playbackTime: time })
}));
