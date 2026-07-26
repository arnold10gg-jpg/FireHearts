FireHearts 🔥
Trova la tua scintilla. Non il tuo prossimo match.
Dating app premium con Fire Score DINAMICO, Vibe Tags, Prompts swipeabili e Daily Limits. Pronta per demo.

Version
Expo
React Native
Status
License

📑 Indice
Panoramica
Demo
Features Giorno 6
Tech Stack
Struttura
Installazione
Come Funziona
Changelog
Roadmap
Panoramica
FireHearts misura il valore reale con Fire Score dinamico. Non è Tinder: vibe, prompts e feedback reali.

Stato: v0.6.0 - Giorno 6 CHIUSO - 6 profili HD 800px, Fire Score dinamico, Vibe Tags filtrabili, 3 prompts swipeabili, Super Like + Undo giornalieri con reset mezzanotte.

Demo
bash
npx expo install @react-native-async-storage/async-storage
npx expo start --clear
# w -> Chrome | QR con Expo Go
Scopri -> 6 card HD, Fire Score colorato, Vibe tappabili #Chef, Prompts carousel 3x swipeabile, bottoni X - Undo(3) - SUPER(3) - Like
Flip -> Fire Score breakdown + Vibe filtrabili + 3 Prompts + Reviews con rating
Inviate -> Attese
Match -> SUPER bordo blu
Profilo -> Score dinamico con pulse + stats + daily limits
Chat -> Chat 1-to-1
Match Popup -> Match! / Super Match! + Fire Score
Features Giorno 6
6.1 Fire Score Dinamico 🔥
js
calculateFireScore = mediaReviews + verified(0.15) + online(0.05) + attivita(0-0.1) + match*0.02
Colore: verde 4.8+, giallo 4.5+, rosso <4.5
Breakdown visibile nel flip
+0.02 per ogni match - il tuo score sale giocando
Pulse animation
6.2 Vibe Tags Interattivi 🔍
17 vibe: Avventurosa, Buongustaia, Viaggi, Intensa, Natura, Palestra, Chef, Passionale, Creativa, Arty, Design, Zen, Curiosa, Yoga, Analogica, Vinile
Tap su #Chef in card -> filtra tutte le Chef
Doppio filtro: Citta + Vibe
Pillola gialla attiva + Azzera filtri
6.3 Prompts Swipeabili 💬
3 prompts per profilo con icona: 🏔️ Weekend ideale, ✈️ Sono brava a, 💚 Green flag
Carousel orizzontale nella card front con dots ● ○ ○
Flip mostra tutti e 3 grandi
Ice-breaker per chat
6.4 Daily Limits 💙↩️
3 Super Like + 3 Undo al giorno
Reset automatico mezzanotte: check lastResetDate != today
Contatori in pill + bottoni con badge
AsyncStorage: fh_superCount, fh_undoCount, fh_lastResetDate
Base Stabile
6 profili Unsplash 800px q=80
Emoji UTF-8 reali visibili (no \u escapes)
Flip fixato con topProfileIdRef per tutte le 6 card
Bottoni pillola flottante zIndex 30, paddingBottom 300, mai nascosti
Persistenza: 11 chiavi AsyncStorage
Tech Stack
Layer	Tech	Note Giorno 6
Framework	React Native + Expo 53	Managed
Storage	AsyncStorage	11 chiavi
Anim	Animated + PanResponder	Swipe, Flip 300ms, Match spring, Score pulse
Immagini	Unsplash 800px	HD
UI	StyleSheet custom	Dark #08080a
Struttura
FireHearts/
├── App.js              # v0.6.0 Giorno 6 finale - 6 HD + Fire Score dinamico + Vibe + Prompts + Daily
├── README.md           # Questo file
├── CHIUSURA_GIORNO6.md # Procedura chiusura
├── package.json
├── app.json
└── assets/
Giorno 7: split in /components, /data, /utils, /hooks

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
// Swipe: dx>110 Like (75% match), dx<-110 Nope, dy<-110 Super (100% match, -1 counter)
// Tap <10px = Flip
// Vibe tap = filterVibe = vibe, reset index
// Prompt carousel = ScrollView horizontal pagingEnabled, onMomentumScrollEnd setPromptIndex
// Daily reset: today = new Date().toDateString(), if lastReset != today -> reset 3/3
// Fire Score: media rating + bonus + match*0.02
Profili:

js
{ id, name, city, distance, vibe[3], bio, longBio, prompts[3]{q,a,icon}, reviews[2-3]{author,text,rating}, photo Unsplash, online, verified, activity }
AsyncStorage:

fh_sent, fh_matches, fh_swipeIndex, fh_chats, fh_history, fh_superLiked, fh_superCount, fh_undoCount, fh_lastResetDate, fh_myProfile, fh_filterVibe
Changelog
v0.6.0 Giorno 6 - Fire Score Dinamico + Vibe Tags + Prompts Swipeabili + Daily Limits + 6 HD + Emoji visibili + Flip fix + Bottoni fix
v0.5.3 Giorno 5 - HD + Prompts Hinge + No banda nera
v0.4 Giorno 4 - Super Like + Edit Profilo
v0.3 Giorno 3 - Persistenza
v0.2 Giorno 2 - Swipe premium
v0.1 Giorno 1 - Base
Roadmap
 Giorno 6 - Fire Score dinamico, Vibe, Prompts, Daily Limits - CHIUSO
 Giorno 7 - Refactoring /components + Onboarding + SVG icons
 Giorno 8 - Firebase Auth + Firestore + Chat realtime
 Giorno 9 - Monetizzazione: Boost, Super illimitati paywall
Autore
Carl Fogarty - Fondatore FireHearts - Bascape • Lombardia

Giorno 6 di 30 - v0.6.0 chiuso.

v0.6.0 - Giorno 6 FINALE - Fire Score Dinamico + Vibe Tags + Prompts Swipeabili + Daily Limits

Made with 🔥 in Bascape

