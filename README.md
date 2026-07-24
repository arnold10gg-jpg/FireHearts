FireHearts ❤️‍🔥
Trova la tua scintilla. Non il tuo prossimo match.
Dating app premium con Fire Score reale. Swipe fluido, Super Like monetizzabile, profilo editabile, prompts stile Hinge e foto HD. Pronta per demo client.

Version
Expo
React Native
Status
License

📑 Indice
Panoramica
Demo
Features
Tech Stack
Struttura Progetto
Installazione
Come Funziona
Fix Giorno 5
Roadmap
Autore
Panoramica
FireHearts non è un clone di Tinder. È un'app che misura il valore reale delle persone con un Fire Score basato su feedback.

Filosofia: meno swipe a caso, più personalità. Foto HD + bio vera + prompts + feedback reali.

Stato attuale: v0.5.3 - Giorno 5 chiuso. Grafica HD, 6 profili, Super Like, Edit Profilo, prompts Hinge integrati. Flip da stabilizzare Giorno 6.

Demo
Avvio rapido
bash
npx expo install @react-native-async-storage/async-storage
npx expo start --clear
# w -> Chrome
# Scan QR con Expo Go su Android
Cosa vedi
Scopri  -> 6 card HD 800px, no banda nera sopra, badge flottanti, prompt preview
          Bottoni: X - Undo - SUPER - Like
          Tap bottone "Vedi Bio Completa + Prompts" per flip

Inviate -> Lista attese con SUPER badge

Match   -> Card con bordo blu se Super Like, bottone Apri Chat

Profilo -> Avatar con anello Fire, Score 4.7, Modifica profilo salvato, Stats, Super rimanenti

Chat    -> Bubble rossa/grigia, input fisso

Match Popup -> Match! / Super Match! con animazione spring
Features
Giorno 5 - Grafica HD & Personalità [ATTUALE - v0.5.3]
Foto HD & Card Pulita
Da randomuser.me 200px a Unsplash 800px q=80 - 6 profili alta definizione
Rimossa banda nera sopra (cardGradientTop) che copriva le facce
Solo cardGradientBottom 170px 0.85 per leggibilità testo
Badge flottanti con ombra: ⭐ Score + ✓ Verificato + SUPER
Card 32px radius, 480px height, ombra profonda, maxWidth 360
2 card dietro con scala 0.88 / 0.94 per effetto mazzo infinito
Hinge Prompts 💭 - Must da Hinge
Ogni profilo ha 2 prompts tipo Hinge:
Il mio weekend ideale -> Lago di Como + aperitivo + nessun telefono
Unpopular opinion -> La palestra è meditazione
Cucino meglio di -> Tua nonna. E non scherzo.
Fronte card: preview 1 prompt sotto bio
Retro card (flip): lista completa prompts + bio lunga + feedback reali
Rende l'app meno banale, vedi subito personalità
Fix Flip & Stabilità
flipAnim.setValue(0) in goNextCard e handleUndo per reset completo
Bottone esplicito Vedi Bio Completa + Prompts per flip garantito anche con mouse
setFlippedId(null) al cambio filtro città
Fix da finalizzare Giorno 6: round card fluido
Mantenuti dal Giorno 4
Super Like 💙: 3 al giorno, 100% match, animazione su 280ms, badge blu, counter persistente, undo restituisce
Edit Profilo ✏️: nome, età, città, bio, salvataggio AsyncStorage permanente
Persistenza totale: sent, matches, swipeIndex, chats, history, superLiked, superCount, myProfile
Undo ↩️: torna indietro anche per Super Like
Giorno 4 - Monetizzazione
Super Like monetizzabile, counter, popup Super Match!
Edit Profilo con modal
Client pulito, emoji reali
Giorno 3 - Persistenza Core
AsyncStorage per tutto
Mazzo infinito con 2 card dietro
Match popup spring
Reset cancella tutto
Giorno 2 - Swipe Premium
PanResponder fluido, overlay, badge score, bottom bar, glow effetti
Giorno 1 - Base
Card profilo, filtri città, tab Scopri/Inviate/Match/Profilo, chat 1-to-1
Tech Stack
Layer	Tecnologia	Note Giorno 5
Framework	React Native + Expo 53	Managed workflow
Linguaggio	JavaScript (ES6+)	Single file per velocità, modularizzazione Giorno 6
Immagini	Unsplash 800px	HD, auto=format&fit=crop
Animazioni	Animated API + PanResponder	Swipe, Flip 300ms, Match spring
Storage	@react-native-async-storage/async-storage	8 chiavi persistenti
UI	StyleSheet custom	Dark premium #08080a, no lib esterne
Deploy	Expo Go	QR + --tunnel per Android
Struttura Progetto
FireHearts/
├── App.js              # Tutta l'app - 6 profili HD, Swipe, Flip, Super Like, Prompts, Chat
├── README.md           # Questo file - v0.5.3
├── package.json        # Dipendenze + async-storage
├── app.json            # Config Expo
├── assets/             # Icone splash Expo
└── screenshots/        # Da aggiungere Giorno 6
Architettura Giorno 1-5: single-file per review rapida. Giorno 6 si splitta in /components, /screens, /hooks, /services, /data.

Installazione
Prerequisiti
Node.js >= 18
Expo Go su Android (Play Store)
Setup
bash
# 1. Clona
git clone https://github.com/TUO-USER/FireHearts.git
cd FireHearts

# 2. Dipendenze
npm install
npx expo install @react-native-async-storage/async-storage

# 3. Avvia
npx expo start --clear

# 4. Sul telefono
# Apri Expo Go -> Scan QR (dentro Expo Go, non fotocamera)
# Stessa WiFi PC-telefono o usa --tunnel
npx expo start --tunnel
Comandi utili
bash
npx expo start --clear   # Pulisci cache se schermo bianco
r -> Reload app
w -> Web Chrome
Come Funziona
Logica Swipe & Flip
javascript
// Swipe: dx > 110 = Like ✨ (75% match), dx < -110 = Nope X, dy < -110 = Super Like SUPER (100%)
// Tap < 10px = Flip bio
// Bottone "Vedi Bio Completa + Prompts" = Flip garantito mouse + touch
// goNextCard: reset swipePosition + flippedId null + flipAnim 0 + swipeIndex++
// History per Undo: {id, action: 'like'|'nope'|'super'}
Profili Giorno 5
6 profili mock HD con:

id, name, city, distance, score, bio, longBio, prompts[2]{q,a}, reviews[1], photo Unsplash 800px, online, verified
Esempio:

javascript
{ name: 'Sofia, 24', city: 'Milano', score: '4.8',
  prompts: [
    { q: 'Il mio weekend ideale', a: 'Lago di Como + aperitivo + nessun telefono' },
    { q: 'Sono brava a', a: 'Organizzare viaggi impossibili in 24h' }
  ]
}
Persistenza
Chiavi AsyncStorage:

fh_sent, fh_matches, fh_swipeIndex, fh_chats, fh_history, fh_superLiked, fh_superCount, fh_myProfile
Super Like - Revenue Core
Press SUPER o swipe su
Counter -1
Animazione su 500px 280ms
Aggiunto a sent + matches + superLiked
Popup blu Super Match!
Undo +1 counter
Fix Giorno 5
Risolti
 Banda nera sopra rimossa - foto pulita 100%
 Da 4 a 6 profili HD Unsplash
 Prompts Hinge integrati fronte/retro
 Super Like + Edit Profilo mantenuti
 Persistenza completa
 Bottone esplicito per flip mouse
Da sistemare Giorno 6
 Round card fluido su Chrome (flip a volte non scatta al tap diretto)
 Ripristinare emoji reali ❤️‍🔥 ✨ 💙 senza \u escapes che corrompevano file
 Modularizzazione codice
 Onboarding 3 slide
 Fix Android SDK path (non serve emulatore, solo Expo Go)
Nota Emoji
Giorno 5.3 usa testo ASCII (SUPER, Verificato) per evitare corruzione file con \uXXXX vista in Giorno 4. Giorno 6 si reintroducono emoji UTF-8 reali con file salvato UTF-8 BOM.

Roadmap
Giorno 6 - Stabilità & UX
 Fix flip round 100% per tutte le 6 card
 Re-intro emoji vere pulite
 Animazione card più morbida
 Bumble must: donne scrivono per prime + timer 24h + Extend
 Modularizzazione /components
Giorno 7 - Backend
 Firebase Auth
 Firestore profili + match + chat realtime
 Sync cross-device
 Onboarding
 Deploy TestFlight
Giorno 8+ - Monetizzazione Scale
 Happn must: Incrociati vicino a te + mappa
 Super Like illimitati paywall
 Boost profilo
 Report & Block + Push
Autore
Carl Fogarty - Fondatore FireHearts

Sto costruendo l'app che misura il valore vero delle persone. Giorno 5 di 30.

Location: Bascape • Lombardia
Stack: React Native + Expo + Firebase (prossimo)
Licenza
MIT - Libero per studio/portfolio. Commerciale contatta autore.

v0.5.3 - Giorno 5 - HD + Prompts Hinge + No Banda Nera + Super Like - Flip fix Giorno 6

Made with ❤️‍🔥 in Bascape - 6 profili HD, foto pulite, personalità vera

