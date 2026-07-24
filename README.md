FireHearts ❤️‍🔥
Trova la tua scintilla. Non il tuo prossimo match.
Dating app premium con Fire Score basato su feedback reali. Swipe fluido, Super Like monetizzabile e profilo editabile. Client pulito, pronta per demo e TestFlight.

Version
Expo
React Native
License

📑 Indice
Panoramica
Demo
Features
Tech Stack
Struttura Progetto
Installazione
Come Funziona
Roadmap
Autore
Panoramica
FireHearts non è un clone di Tinder. È un'app dating focalizzata sul valore reale delle persone, misurato con un Fire Score.

Il flusso è semplice: scopri, swipe, match, chat. Tutto salvato in locale e pronto per diventare cloud.

Stato attuale: v0.4.0 - Giorno 4 completato. App usabile, monetizzabile, client-ready.

Demo
Avvio rapido
bash
npx expo install @react-native-async-storage/async-storage
npx expo start
# Premi w per aprire su Chrome
Screenshots
Scopri  -> Mazzo con 2 card dietro, swipe ✕ ↩️ 💙 ✨
Inviate -> Lista attese con badge SUPER 💙
Match   -> Card con bordo blu se Super Like
Profilo -> Fire Score + Edit profilo ✏️ + Stats
Chat    -> Bolla rossa / grigia, input fisso
Match Popup -> Super Match! 💙 animazione spring
Features
Giorno 4 - Monetizzazione & Identità [ATTUALE]
Super Like 💙
3 Super Like al giorno disponibili
Garanzia Match al 100% (non 75% come swipe normale)
Bottone blu dedicato + swipe in su
Badge SUPER 💙 sulla card e nelle liste
Popup dedicato Super Match! 💙 con bordo blu
Undo restituisce il Super Like
Counter persistente Super 3💙 nella pill in alto
Edit Profilo ✏️
Profilo utente completamente editabile
Campi: Nome, Età, Città, Bio
Bottone Modifica profilo ✏️ nel tab Profilo
Modalità editing con input dedicati
Salvataggio permanente con AsyncStorage
Visualizzazione immediata ovunque (anche nel popup Match)
Reset riporta ai dati di default
Client Pulito
Sottotitolo solo Trova la tua scintilla
Emoji reali: ❤️‍🔥 • ✨ ✕ ↩️ 💙 🔥 💬 🔍 👤
Zero codici \uXXXX visibili
Nessun riferimento interno (Giorno X) esposto
Giorno 3 - Persistenza & UX Core
AsyncStorage per tutto: Inviate, Match, Chat, swipeIndex, history, superLiked, superCount, myProfile
Undo Swipe ↩️: torna indietro di una card, ripristina anche Super Like
Mazzo infinito: 2 card dietro con scala 0.90 / 0.95
Flip card: tap sulla card per vedere bio lunga + feedback reali
Match Popup: animazione spring con scala
Giorno 2 - Swipe & Design Premium
PanResponder fluido: destra = Scintilla ✨, sinistra = Scarta ✕
Overlay 85px fisso per leggibilità testo
Badge Score con bordo rosso
Bottom bar con 4 label originali
Glow effetti top/bottom
Giorno 1 - Base
Card profilo con foto, città, distanza, bio
Filtri città: Tutti, Milano, Bergamo, Brescia, Pavia
Tab navigazione: Scopri, Inviate, Match, Profilo
Chat base 1-to-1
Tech Stack
Layer	Tecnologia	Note
Framework	React Native + Expo 53	Managed workflow
Linguaggio	JavaScript (ES6+)	No TypeScript per velocità Day 1-4
Animazioni	Animated API + PanResponder	Swipe, Flip, Match Popup
Storage	@react-native-async-storage/async-storage	Persistenza locale
UI	StyleSheet custom	Dark mode premium, no UI lib
Deploy	Expo Go	Pronto per TestFlight Giorno 5
Struttura Progetto
FireHearts/
├── App.js              # Tutta l'app - Deck, Swipe, Super Like, Edit Profilo, Chat, Persistenza
├── README.md           # Questo file
├── package.json        # Dipendenze
├── app.json            # Config Expo
├── assets/             # Icone, splash (Expo default per ora)
└── screenshots/        # Screenshot demo (da aggiungere)
Nota architetturale Giorno 1-4: single-file per velocità di sviluppo e review. Da Giorno 5 si modularizza in /components, /screens, /hooks, /services.

Installazione
Prerequisiti
Node.js >= 18
npm o yarn
Expo CLI: npm install -g expo-cli
Setup pulito
bash
# 1. Clona
git clone https://github.com/TUO-USER/FireHearts.git
cd FireHearts

# 2. Installa dipendenze
npm install

# 3. Installa AsyncStorage (obbligatorio per persistenza)
npx expo install @react-native-async-storage/async-storage

# 4. Avvia
npx expo start
Comandi utili
bash
npx expo start          # Avvia Metro bundler
# poi premi:
# w -> Chrome web
# a -> Android emulator
# i -> iOS simulator
# r -> Reload

npx expo start --clear  # Pulisci cache se vedi schermata bianca
Come Funziona
Logica Swipe
javascript
// Destra > 110px = Like ✨ (75% match random)
// Sinistra < -110px = Nope ✕
// Su < -110px = Super Like 💙 (100% match)
// Tap < 8px = Flip bio
// History stack per Undo ↩️
Persistenza
Tutte le chiavi AsyncStorage usate:

fh_sent         -> array ID profili a cui hai inviato scintilla
fh_matches      -> array ID match
fh_swipeIndex   -> posizione attuale nel mazzo
fh_chats        -> oggetto { profileId: [messaggi] }
fh_history      -> stack per undo [{id, action}]
fh_superLiked   -> array ID con super like
fh_superCount   -> numero super like rimasti (3)
fh_myProfile    -> oggetto profilo editabile
Reset cancella tutto con AsyncStorage.clear().

Super Like - Monetizzazione
Il Super Like è il core revenue di Tinder. In FireHearts:

Utente preme 💙 o swipe in su
Counter -1
Card vola in alto con animazione 280ms
Aggiunto a sent + matches + superLiked
Popup blu Super Match!
Destinatario vede badge blu
Undo restituisce +1 al counter.

Roadmap
Giorno 5 - Backend & Launch
 Firebase Auth (login email / Apple / Google)
 Firestore per profili, match, chat realtime
 Sync cross-device (risolve limite Chrome = cassetto diverso)
 Onboarding con 3 slide
 Deploy Expo Go + QR per test su device reali
Giorno 6+ - Scale
 Super Like illimitati a pagamento
 Boost profilo
 Filtro avanzato (età, score minimo)
 Report & Block
 Push notification
Note Tecniche
Storage web vs native: su web, AsyncStorage usa localStorage del browser (Chrome ≠ Edge). Normale fino a Giorno 5. Su app nativa è per device.
Emoji: usati caratteri UTF-8 reali, non \uXXXX, per evitare bug visualizzati nello screenshot Day 3.
Performance: deck di 4 profili mock, infinito con modulo %. Da sostituire con fetch paginato Giorno 5.
Autore
Carl Fogarty - Fondatore FireHearts

Sto costruendo l'app che misura il valore vero delle persone. Giorno 4 di 30.

GitHub: TuoUser
Location: Bascape • Lombardia
Licenza
MIT License - Libero per studio e portfolio. Per uso commerciale contatta l'autore.

v0.4.0 - Giorno 4 - Super Like + Edit Profilo - Client Ready

Made with ❤️‍🔥 in Bascape

