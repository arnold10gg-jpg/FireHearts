// data/config.js - Giorno 8
export const STORAGE_KEYS = {
  SENT: 'fh_sent', MATCHES: 'fh_matches', SUPER_LIKED: 'fh_superLiked', SWIPE_INDEX: 'fh_swipeIndex',
  FILTER_CITY: 'fh_filterCity', CUSTOM_CITY: 'fh_customCity', FILTER_VIBE: 'fh_filterVibe',
  MY_PROFILE: 'fh_myProfile', ONBOARDING_DONE: 'fh_onboardingDone', NEARBY_SEEN: 'fh_nearbySeen', CHATS: 'fh_chats_v2',
  USER_REGISTERED: 'fh_userRegistered', USER_DATA: 'fh_userData',
};
export const DEFAULT_MY_PROFILE = { 
  name: 'Carl', age: 28, city: 'Torino', bio: 'Fondatore di FireHearts.', longBio: 'Vivo a Torino, amo codice e persone autentiche.',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop', myVibes: ['Founder','Avventuroso'] 
};
export const APP_CONFIG = { version: '0.8.0', giorno: 8, name: 'FireHearts', tagline: "Non e' dating. E' scintilla." };