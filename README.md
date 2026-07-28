FireHearts 🔥❤️
Trova la tua scintilla. Non il tuo prossimo match.
Dating app premium con Fire Score DINAMICO, Vibe Tags, Voice Intro, AI Compatibility + Ice-breaker, Nearby, Boost, Verifica. Logo 3D cuore ammiccante con fiamme animate. Pronta per demo client epica.

Version
Expo
React Native
Status
License
Logo

📑 Indice
Panoramica
Demo
Branding - Logo Epico
Features Giorno 7
Tech Stack
Struttura
Installazione
Come Funziona
Changelog
Roadmap
Panoramica
FireHearts misura il valore reale con Fire Score dinamico. Non è Tinder: vibe, voice, AI, nearby, boost, verifica.

Stato: v0.7.0 - Giorno 7 CHIUSO GLORIOSO - Traccia 1 (Retention + Monetizzazione) + Traccia 2 (Voice + AI) + Logo 3D cuore ammiccante con fiamme animate. Client-safe.

Logo: Cuore 3D con 3 layer ombra + faccia ammiccante (wink ogni 3s) + 3 fiamme animate flicker + testo FIREHEARTS 32px 900 con glow animato.

Demo
bash
npx expo install @react-native-async-storage/async-storage
npx expo start --clear
# w -> Chrome | QR con Expo Go
Scopri -> Card HD + Fire Score colorato + 87% match AI + Vibe tappabili #Chef + Voice 12s waveform + Prompts carousel + bottoni X - ↩️ - 🚀 - 💙 - ❤️
Flip -> Fire Score breakdown + Compatibility + Voice transcript + Vibe filtrabili + 3 Prompts
Vicino -> Mappa mock 📍 4 incroci + lista Incrociata 2h fa Brera 300m + azioni dirette
Match -> Timer 24h ⏰ Scade tra 23h 42m + SUPER bordo blu + giallo urgente <6h
Profilo -> Score dinamico pulse + Boost card 🚀 + Verifica card ✓ + Premium banner 💎
Chat -> Ice-breaker AI 3 suggerimenti basati su prompts + reply simulata
Onboarding -> 3 slide Fire Score / Vibe / Prompts + logo small
Social Proof -> Banner 3 like blurred + Paywall €4,99
Boost -> Overlay full-screen 🚀 BOOST ATTIVO 24m 12s + 10x views
Verifica -> Modal selfie 🤳 + badge blu
Premium -> 3 piani Week €4,99 / Month €14,99 POPOLARE / Year €59,99
Branding - Logo Epico
Giorno 7.7 - Logo 3D Cuore Ammiccante + Fiamme Animate
Prima: Text FireHearts 34px bianco

Ora - Logo System Professionale:

Icona Principale:

  🔥    🔥
🔥  ❤️(•‿•)  🔥  -> 3 fiamme flicker
    /3D shadow\
Cuore 3D: 3 layer #8a1a1a ombra + #cc2a2a mid + #ff3b30 base + border bianco 20% + highlight 35%
Faccia: occhio sx wink scaleY 1→0.1 ogni 3s + occhio dx • + smile ‿
Fiamme: 3 🔥 con translateY -6/-8/-5 + scale 1.3/1.4/1.2 loop 600-700ms sfasati
Pulse cuore: scale 1→1.15 ogni 800ms
Size: 56px normal, 32px small onboarding
Testo FIREHEARTS:

32px 900 weight, letter-spacing -0.5, più rilevante UX
Animazione glow: textShadowColor rgba(255,59,48,0.3)→rgba(255,122,46,0.8) + radius 8→20 loop 1500ms
Tagline: • Trova la tua scintilla + dot verde online
Client-safe: nessun "Giorno X" nel UI, solo branding epico.

Features Giorno 7
Traccia 1 - Retention + Monetizzazione
7.1 Refactoring Pulito 🏗️
DATA layer: PROFILES_DATA, CITIES, ALL_VIBES, ONBOARDING_SLIDES, PREMIUM_PLANS, NEARBY_ENCOUNTERS
UTILS: calculateFireScore, getScoreColor, checkDailyReset, getExpiryText, calculateCompatibility, getIceBreakers
COMPONENTS: VibeTags, PromptCarousel, FilterChips, FireHeartsLogo, VoicePlayer, CompatibilityBadge, IceBreakerSuggestions, NearbyCard, BoostOverlay, VerificationModal, PremiumPaywall
STORAGE_KEYS centralizzate: 16 chiavi
7.2 Onboarding + Social Proof 🔥
3 slide animate: Fire Score / Vibe Tags / Prompts Swipeabili
Dots + bottone colore slide + Salta
fh_onboardingDone
Social Proof Banner: 3 avatar blurred + "3 persone ti hanno messo like" + Sblocca CTA
LikesPaywall: grid 6 blurred + benefits + €4,99/mese
7.3 Nearby / Incrociati + Timer 24h 📍⏰
Tab Vicino: mappa mock Milano 4 incroci + puntini rossi
NEARBY_ENCOUNTERS: Via Brera 300m 2h fa x2, Navigli 450m, Parco Sempione 1.1km x3, Stazione 800m
Azioni dirette: X Nope / 💙 Super / ❤️ Like
Timer Match 24h: expiry = now + 24h, getExpiryText, isExpiringSoon <6h giallo
Tick ogni 60s (e 1s per boost), persistenza fh_matchesExpiry
7.4 Boost + Verifica + Paywall Finale 🚀✓💎
Boost: bottone 🚀 nel swipe row + card profilo + overlay full-screen con countdown 30min live + 10x views + fh_boostActive/Expiry/Count
Verifica: card profilo + modal 2 step selfie mock + badge blu + isVerified + myProfile.verified
Premium Paywall: 3 piani Week €4,99 / Month €14,99 POPOLARE (Boost + Verifica + Timer 48h) / Year €59,99 -60%
Traccia 2 - Unico nel Mercato
7.5 Voice Intro + AI Compatibility 🎤🤖
Voice: {duration, transcript} per 6 profili, VoicePlayer con waveform animata 12-20 barre + play ▶/❚❚ + auto-stop 4s + transcript
Compatibility: vibe overlap15 + Fire Score proximity + activity0.15 + random = 62-98% match, colore verde 85%+ giallo 75%+ rosso <75%, badge in topBar + breakdown
7.6 AI Ice-breaker 💬
getIceBreakers(profile): 3 suggerimenti basati su prompts + vibe
Es: "Ho visto che Weekend ideale... Lago di Como + aperitivo - raccontami di più?"
In chat se msgs<=1: IceBreakerSuggestions chip tappabili -> invio diretto + scompare + reply simulata 1-2s
Header chat: 4.8 ★ • 87% match
7.7 Logo Epico ❤️🔥
Come sopra
Base Giorno 6 Mantenuta
6 profili Unsplash 800px q=80 HD, emoji UTF-8 visibili, flip fix topProfileIdRef, bottoni pillola zIndex 30 paddingBottom 300, Fire Score dinamico +0.02 per match, Vibe 17 filtrabili, 3 prompts carousel dots, Daily 3 Super + 3 Undo reset mezzanotte
Tech Stack
Layer	Tech	Note Giorno 7
Framework	React Native + Expo 53	Managed
Storage	AsyncStorage	16 chiavi
Anim	Animated + PanResponder	Swipe, Flip 300ms, Match spring, Score pulse, Flame flicker 600ms, Heart pulse 800ms, Wink 3s, Glow 1500ms, Timer tick 1s
Immagini	Unsplash 800px	HD
UI	StyleSheet custom	Dark #08080a + logo 3D + fiamme
Branding	Custom 3D Heart + Flames	Logo system
Struttura
FireHearts/
├── App.js                    # v0.7.0 Giorno 7 finale glorioso - 111k - Traccia 1+2 + Logo 3D
├── App_8.js                  # Backup finale glorioso
├── App_7.js                  # Backup 7.6 Ice-breaker
├── App_6.js                  # Backup 7.5 Voice + Compatibility
├── App_5.js                  # Backup 7.4 Boost + Verifica + Paywall
├── App_4.js                  # Backup 7.3 Nearby + Timer
├── App_3.js                  # Backup 7.2 Onboarding + Social Proof
├── App_1.js                  # Backup 7.1 Refactoring
├── README.md                 # Questo file v0.7.0
├── CHIUSURA_GIORNO7.md       # Procedura chiusura gloriosa
├── package.json
├── app.json
└── assets/
Giorno 8: split in /components, /data, /utils, /hooks + funzionalità uniche

Installazione
bash
git clone https://github.com/TUO-USER/FireHearts.git
cd FireHearts
npm install
npx expo install @react-native-async-storage/async-storage
npx expo start --clear
# Expo Go -> Scan QR (dentro app, non fotocamera)
# Stessa WiFi o --tunnel
npx expo start --tunnel
Come Funziona
js
// Logo: 3 flames flicker translateY -6/-8/-5 scale 1.3/1.4 loop 600ms + heart pulse 1->1.15 800ms + wink 3s + glow 8->20 radius 1500ms
// Swipe: dx>110 Like (75% match + expiry 24h), dx<-110 Nope, dy<-110 Super 100% + expiry + -1 counter
// Tap <10px = Flip con topProfileIdRef fix per 6 card
// Vibe tap = filterVibe, Boost = 30min expiry + overlay, Voice tap = playingVoiceId + 4s stop
// Ice-breaker: getIceBreakers(profile) -> 3 chip -> handleSendMessage(customText) + reply simulata
// Daily reset: today != lastReset -> reset 3/3 Super/Undo + 1 Boost
// Fire Score: media rating + verified 0.15 + online 0.05 + activity/1000 + match*0.02
// Compatibility: vibe overlap*15 + fire proximity + activity*0.15 + random = 62-98%
Profili:

js
{ id, name, city, distance, vibe[3], bio, longBio, prompts[3]{q,a,icon}, reviews[2-3]{author,text,rating}, photo Unsplash 800px, online, verified, activity, voice{duration, transcript} }
AsyncStorage 16 chiavi:

fh_sent, fh_matches, fh_swipeIndex, fh_chats, fh_history, fh_superLiked, fh_superCount, fh_undoCount, fh_lastResetDate, fh_myProfile, fh_filterVibe, fh_onboardingDone, fh_matchesExpiry, fh_nearbySeen, fh_boostActive, fh_boostExpiry, fh_boostCount, fh_isVerified, fh_premiumActive
Changelog
v0.7.0 Giorno 7 FINALE GLORIOSO - Traccia 1: Refactoring + Onboarding 3-step + Social Proof FOMO + Nearby 📍 + Timer 24h ⏰ + Boost 🚀 + Verifica ✓ + Paywall 💎 + Traccia 2: Voice Intro 🎤 + AI Compatibility % 🤖 + AI Ice-breaker 💬 + Logo 3D Cuore Ammiccante con Fiamme Animate 🔥❤️ - Client-safe, 111k, pronto per client epico
v0.6.0 Giorno 6 - Fire Score Dinamico + Vibe Tags + Prompts Swipeabili + Daily Limits + 6 HD
v0.5.3 Giorno 5 - HD + Prompts Hinge
v0.4 Giorno 4 - Super Like + Edit Profilo
v0.3 Giorno 3 - Persistenza
v0.2 Giorno 2 - Swipe premium
v0.1 Giorno 1 - Base
Roadmap
 Giorno 7 - Traccia 1+2 + Logo Epico - CHIUSO GLORIOSO
 Giorno 8 - Refactoring in /components /data /hooks + funzionalità uniche che rendono unico il prodotto (come da tua idea)
 Giorno 9 - Firebase Auth + Firestore + Chat realtime + Voice/Video reale
 Giorno 10 - Push Notifications + Deep Linking + App Store
Autore
Carl Fogarty - Fondatore FireHearts - Bascape • Lombardia

Giorno 7 di 30 - v0.7.0 chiuso gloriosamente con logo 3D cuore ammiccante + fiamme.

v0.7.0 - Giorno 7 FINALE GLORIOSO - Logo 3D + Fiamme + Traccia 1+2 + Client-safe

Made with 🔥❤️ in Bascape - Persone autentiche, non algoritmi.

