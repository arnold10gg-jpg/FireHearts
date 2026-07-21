import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Pressable, Animated, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const profiles = [
  { id: 1, name: 'Sofia, 24', city: 'Milano', distance: '2km', score: '4.8', bio: 'Amo viaggi, aperitivi e cani.', longBio: 'Vivo a Milano, lavoro nel marketing. Amo viaggiare, vino buono e conversazioni profonde.', reviews: [{ author: 'Marco 27 • 5.0❤️', text: 'Super solare, conversazione top!' }], photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Giulia, 22', city: 'Bergamo', distance: '5km', score: '4.3', bio: 'Studentessa, palestra e tramonti sul lago.', longBio: 'Studio psicologia a Bergamo. Palestra, libri e tramonti. Cerco persone vere.', reviews: [{ author: 'Andrea 24 • 4.5❤️', text: 'Dolce e intelligente, ottima vibe.' }], photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: 3, name: 'Martina, 26', city: 'Brescia', distance: '8km', score: '4.9', bio: 'Chef per passione. Cucino io se porti il vino.', longBio: 'Chef privato a Brescia. Se porti il vino, preparo io la cena. Amo le cene a lume di candela.', reviews: [{ author: 'Davide 28 • 5.0❤️', text: 'Serata incredibile, 10 e lode.' }], photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 4, name: 'Alice, 23', city: 'Milano', distance: '3km', score: '4.6', bio: 'Designer, amo arte e musei.', longBio: 'Designer a Milano. Minimal, arte e aperitivi in Brera.', reviews: [{ author: 'Stefano 25 • 4.6❤️', text: 'Stile pazzesco!' }], photo: 'https://randomuser.me/api/portraits/women/26.jpg' },
];

const myProfileData = { name: 'Carl', age: 28, city: 'Bascape • Lombardia', bio: 'Fondatore di FireHearts. Sto costruendo l’app che misura il valore vero delle persone. Amo sfide, business e connessioni reali.', score: '4.7', photo: 'https://randomuser.me/api/portraits/men/32.jpg' };
const cities = ['Tutti', 'Milano', 'Bergamo', 'Brescia', 'Pavia'];

export default function App() {
  const [sent, setSent] = useState([]);
  const [matches, setMatches] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('scopri');
  const [filterCity, setFilterCity] = useState('Tutti');
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [flippedId, setFlippedId] = useState(null);
  const [activeFlipId, setActiveFlipId] = useState(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swipePosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const matchScale = useRef(new Animated.Value(0)).current;

  const [chats, setChats] = useState({
    1: [{ id: 1, text: 'Ehi! Grazie per la scintilla 🔥', from: 'them' }],
  });

  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('fh_sent');
        const m = await AsyncStorage.getItem('fh_matches');
        const idx = await AsyncStorage.getItem('fh_swipeIndex');
        const c = await AsyncStorage.getItem('fh_chats');
        const h = await AsyncStorage.getItem('fh_history');
        if (s) setSent(JSON.parse(s));
        if (m) setMatches(JSON.parse(m));
        if (idx) setSwipeIndex(JSON.parse(idx));
        if (c) setChats(JSON.parse(c));
        if (h) setHistory(JSON.parse(h));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_sent', JSON.stringify(sent)); }, [sent, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_matches', JSON.stringify(matches)); }, [matches, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_swipeIndex', JSON.stringify(swipeIndex)); }, [swipeIndex, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_chats', JSON.stringify(chats)); }, [chats, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_history', JSON.stringify(history)); }, [history, loaded]);

  const filteredProfiles = filterCity === 'Tutti' ? profiles : profiles.filter((p) => p.city === filterCity);
  const topProfile = filteredProfiles[swipeIndex % filteredProfiles.length];
  const nextProfile = filteredProfiles[(swipeIndex + 1) % filteredProfiles.length];
  const nextNextProfile = filteredProfiles[(swipeIndex + 2) % filteredProfiles.length];

  const handleFlip = (id) => {
    if (activeFlipId) return;
    if (flippedId === id) {
      setActiveFlipId(id);
      Animated.timing(flipAnim, { toValue: 0, duration: 320, useNativeDriver: true }).start(() => { setFlippedId(null); setActiveFlipId(null); });
    } else {
      setActiveFlipId(id); flipAnim.setValue(0);
      Animated.timing(flipAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start(() => { setFlippedId(id); setActiveFlipId(null); });
    }
  };
  const triggerMatchPopup = (p) => { setShowMatch(p); matchScale.setValue(0); Animated.spring(matchScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start(); };
  const sendScintilla = (p) => {
    if (!sent.includes(p.id)) {
      setSent([...sent, p.id]);
      setTimeout(() => { if (Math.random() > 0.25) { setMatches((prev) => (prev.includes(p.id) ? prev : [...prev, p.id])); triggerMatchPopup(p); } }, 800);
    }
  };
  const goNextCard = () => { swipePosition.setValue({ x: 0, y: 0 }); setFlippedId(null); setSwipeIndex((s) => s + 1); };
  
  const handleSwipeRight = () => {
    if (!topProfile) return;
    setHistory((prev) => [...prev, { id: topProfile.id, action: 'like' }]);
    Animated.timing(swipePosition, { toValue: { x: 550, y: -60 }, duration: 230, useNativeDriver: true }).start(() => { sendScintilla(topProfile); goNextCard(); });
  };
  const handleSwipeLeft = () => {
    if (!topProfile) return;
    setHistory((prev) => [...prev, { id: topProfile.id, action: 'nope' }]);
    Animated.timing(swipePosition, { toValue: { x: -550, y: -60 }, duration: 230, useNativeDriver: true }).start(() => goNextCard());
  };
  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setSwipeIndex((s) => Math.max(0, s - 1));
    if (last.action === 'like') {
      setSent((prev) => prev.filter((x) => x !== last.id));
      setMatches((prev) => prev.filter((x) => x !== last.id));
    }
    swipePosition.setValue({ x: 0, y: 0 });
    setFlippedId(null);
  };
  const handleReset = async () => {
    setSent([]); setMatches([]); setSwipeIndex(0); setHistory([]); setChats({ 1: [{ id: 1, text: 'Ehi! Grazie per la scintilla 🔥', from: 'them' }] }); await AsyncStorage.clear();
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => { if (flippedId || showMatch) return; swipePosition.setValue({ x: g.dx, y: g.dy * 0.25 }); },
    onPanResponderRelease: (_, g) => {
      if (flippedId || showMatch) return;
      if (Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8) { handleFlip(topProfile.id); Animated.spring(swipePosition, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start(); return; }
      if (g.dx > 110) handleSwipeRight(); else if (g.dx < -110) handleSwipeLeft(); else Animated.spring(swipePosition, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: true }).start();
    },
  })).current;

  const rotate = swipePosition.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-14deg', '0deg', '14deg'], extrapolate: 'clamp' });
  const likeOpacity = swipePosition.x.interpolate({ inputRange: [20, 110], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = swipePosition.x.interpolate({ inputRange: [-110, -20], outputRange: [1, 0], extrapolate: 'clamp' });
  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const handleSendMessage = () => { if (!inputText.trim() || !activeChat) return; const newMsg = { id: Date.now(), text: inputText, from: 'me' }; setChats((prev) => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), newMsg] })); setInputText(''); };
  const inviateProfiles = profiles.filter((p) => sent.includes(p.id) && !matches.includes(p.id));
  const matchProfiles = profiles.filter((p) => matches.includes(p.id));
  const isFlipped = topProfile && flippedId === topProfile.id; const isFlipping = topProfile && activeFlipId === topProfile.id;

  if (!loaded) { return (<View style={styles.container}><Text style={styles.logoPremium}>FireHearts ❤️‍🔥</Text><Text style={styles.subtitlePremium}>Caricamento...</Text></View>); }

  if (activeChat) {
    const messages = chats[activeChat.id] || [];
    return (<View style={styles.container}><View style={styles.glowTop} /><View style={styles.chatHeaderPremium}><TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backButtonPremium}><Text style={styles.backText}>‹</Text></TouchableOpacity><Image source={{ uri: activeChat.photo }} style={styles.chatAvatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.chatNamePremium}>{activeChat.name}</Text><Text style={styles.chatStatusPremium}>Online • {activeChat.score} ❤️</Text></View></View><ScrollView style={styles.chatMessages} contentContainerStyle={{ padding: 16 }}>{messages.map((msg) => (<View key={msg.id} style={[styles.bubblePremium, msg.from === 'me' ? styles.myBubblePremium : styles.theirBubblePremium]}><Text style={styles.bubbleTextPremium}>{msg.text}</Text></View>))}</ScrollView><View style={styles.chatInputBarPremium}><TextInput style={styles.textInputPremium} placeholder="Scrivi..." placeholderTextColor="#666" value={inputText} onChangeText={setInputText} onSubmitEditing={handleSendMessage} /><TouchableOpacity style={styles.sendButtonPremium} onPress={handleSendMessage}><Text style={styles.sendButtonTextPremium}>↗</Text></TouchableOpacity></View></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} /><View style={styles.glowBottom} />
      <Text style={styles.logoPremium}>FireHearts ❤️‍🔥</Text><Text style={styles.subtitlePremium}>Trova la tua scintilla</Text>
      <View style={styles.counterPill}><View style={styles.counterDot} /><Text style={styles.counterTextPremium}>Inviate {sent.length} • Match {matches.length}</Text><TouchableOpacity onPress={handleReset} style={styles.resetPill}><Text style={styles.resetTextPremium}>Reset</Text></TouchableOpacity></View>
      {tab === 'scopri' && (<View style={styles.filterWrapperPremium}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContentPremium}>{cities.map((c) => (<TouchableOpacity key={c} style={[styles.filterChipPremium, filterCity === c && styles.filterChipActivePremium]} onPress={() => { setFilterCity(c); setSwipeIndex(0); }}><Text style={[styles.filterTextPremium, filterCity === c && styles.filterTextActivePremium]}>{c}</Text></TouchableOpacity>))}</ScrollView></View>)}
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {tab === 'scopri' && topProfile && (<View style={styles.deckContainer}>{nextNextProfile && (<View style={[styles.premiumCard, styles.cardBehind2]}><Image source={{ uri: nextNextProfile.photo }} style={styles.premiumImage} /><View style={styles.premiumOverlaySmallFIXED} /></View>)}{nextProfile && (<View style={[styles.premiumCard, styles.cardBehind1]}><Image source={{ uri: nextProfile.photo }} style={styles.premiumImage} /><View style={styles.premiumOverlaySmallFIXED} /></View>)}{isFlipped || isFlipping ? (<Pressable style={styles.flipContainer} onPress={() => handleFlip(topProfile.id)}><Animated.View style={[styles.flipCard, { transform: [{ perspective: 1000 }, { rotateY: isFlipping ? frontInterpolate : '180deg' }] }]}><Image source={{ uri: topProfile.photo }} style={styles.premiumImage} /><View style={styles.premiumOverlaySmallFIXED} /><View style={styles.premiumCardContent}><Text style={styles.premiumName}>{topProfile.name}</Text></View></Animated.View><Animated.View style={[styles.flipCard, styles.flipBackCard, { transform: [{ perspective: 1000 }, { rotateY: isFlipping ? backInterpolate : '360deg' }] }]}><View style={styles.cardBack}><View style={styles.cardBackHeader}><Image source={{ uri: topProfile.photo }} style={styles.cardBackAvatar} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.cardBackName}>{topProfile.name}</Text><Text style={styles.cardBackScore}>{topProfile.score} ❤️ • {topProfile.city}</Text></View><View style={styles.closeFlip}><Text style={styles.closeFlipText}>✕</Text></View></View><Text style={styles.cardBackBioTitle}>Bio</Text><Text style={styles.cardBackBio}>{topProfile.longBio}</Text><Text style={styles.cardBackBioTitle}>Feedback reali ({topProfile.reviews.length})</Text>{topProfile.reviews.map((r, i) => (<View key={i} style={styles.reviewItem}><Text style={styles.reviewAuthor}>{r.author}</Text><Text style={styles.reviewText}>"{r.text}"</Text></View>))}<View style={styles.backButtonFlip}><Text style={styles.backButtonFlipText}>↩️ Tocca ovunque per tornare alla foto</Text></View></View></Animated.View></Pressable>) : (<Animated.View {...panResponder.panHandlers} style={[styles.premiumCard, styles.cardTop, { transform: [{ translateX: swipePosition.x }, { translateY: swipePosition.y }, { rotate: rotate }] }]}><Image source={{ uri: topProfile.photo }} style={styles.premiumImage} /><View style={styles.premiumOverlaySmallFIXED} /><Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}><Text style={styles.likeText}>SCINTILLA ✨</Text></Animated.View><Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}><Text style={styles.nopeText}>SCARTA ✕</Text></Animated.View><View style={styles.scoreBadgePremium}><Text style={styles.scoreTextPremium}>{topProfile.score} ❤️</Text></View><View style={styles.premiumCardContent}><Text style={styles.premiumName}>{topProfile.name}</Text><Text style={styles.premiumCity}>{topProfile.city} • {topProfile.distance} • {topProfile.bio}</Text></View></Animated.View>)}<View style={styles.swipeButtonsRow}><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnNo]} onPress={handleSwipeLeft}><Text style={styles.swipeBtnText}>✕</Text></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnUndo, history.length === 0 && styles.swipeBtnUndoDisabled]} onPress={handleUndo}><Text style={styles.swipeBtnUndoText}>↩️</Text></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnYes]} onPress={handleSwipeRight}><Text style={styles.swipeBtnTextYes}>✨</Text></TouchableOpacity></View></View>)}
        {tab === 'inviate' && inviateProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyIcon}>⏳</Text><Text style={styles.emptyTextPremium}>Nessuna in attesa</Text></View>)}
        {tab === 'inviate' && inviateProfiles.map((p) => (<View key={p.id} style={styles.premiumCardSmall}><Image source={{ uri: p.photo }} style={styles.avatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.namePremium}>{p.name}</Text><Text style={styles.cityPremium}>{p.city}</Text></View></View>))}
        {tab === 'match' && matchProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyIcon}>🔥</Text><Text style={styles.emptyTextPremium}>Nessun Match</Text></View>)}
        {tab === 'match' && matchProfiles.map((p) => (<View key={p.id} style={styles.matchCardPremium}><Image source={{ uri: p.photo }} style={styles.matchAvatarPremium} /><View style={{ flex: 1, marginLeft: 14 }}><Text style={styles.matchNamePremium}>{p.name}</Text><TouchableOpacity style={styles.chatButtonPremium} onPress={() => setActiveChat(p)}><Text style={styles.chatButtonTextPremium}>Apri Chat 💬</Text></TouchableOpacity></View></View>))}
        {tab === 'profilo' && (<View style={styles.profileContainerPremium}><View style={styles.profileAvatarWrapper}><View style={styles.profileAvatarRing} /><Image source={{ uri: myProfileData.photo }} style={styles.profileAvatarPremium} /><View style={styles.profileScoreFloat}><Text style={styles.profileScoreFloatText}>{myProfileData.score} ❤️</Text></View></View><Text style={styles.profileNamePremium}>{myProfileData.name}, {myProfileData.age}</Text><Text style={styles.profileCityPremium}>{myProfileData.city}</Text><View style={styles.bigScoreBoxPremium}><Text style={styles.bigScorePremium}>{myProfileData.score} ❤️‍🔥</Text><Text style={styles.bigScoreLabelPremium}>Il tuo Fire Score</Text><Text style={styles.bigScoreSubPremium}>Undo attivo • Torna indietro se sbagli</Text></View><View style={styles.statsRowPremium}><View style={styles.statItemPremium}><Text style={styles.statNumberPremium}>{sent.length}</Text><Text style={styles.statLabelPremium}>Inviate</Text></View><View style={styles.statDivider} /><View style={styles.statItemPremium}><Text style={styles.statNumberPremium}>{matchProfiles.length}</Text><Text style={styles.statLabelPremium}>Match</Text></View><View style={styles.statDivider} /><View style={styles.statItemPremium}><Text style={styles.statNumberPremium}>{history.length}</Text><Text style={styles.statLabelPremium}>Undo</Text></View></View><View style={styles.bioCardPremium}><Text style={styles.bioTitlePremium}>La mia bio</Text><Text style={styles.bioTextPremium}>{myProfileData.bio}</Text></View><View style={styles.bioCardPremium}><Text style={styles.bioTitlePremium}>I tuoi dati al sicuro</Text><Text style={styles.bioTextPremium}>I tuoi Match e le Chat restano salvati anche se chiudi l'app. Reset cancella tutto.</Text></View></View>)}
      </ScrollView>
      {showMatch && (<View style={styles.matchOverlay}><Animated.View style={[styles.matchPopup, { transform: [{ scale: matchScale }] }]}><Text style={styles.matchPopupTitle}>È un Match! ❤️‍🔥</Text><Text style={styles.matchPopupSub}>Tu e {showMatch.name} vi siete piaciuti</Text><View style={styles.matchAvatarsRow}><Image source={{ uri: myProfileData.photo }} style={styles.matchPopupAvatar} /><Text style={styles.matchHeart}>❤️</Text><Image source={{ uri: showMatch.photo }} style={styles.matchPopupAvatar} /></View><TouchableOpacity style={styles.matchPopupPrimary} onPress={() => { setActiveChat(showMatch); setShowMatch(null); }}><Text style={styles.matchPopupPrimaryText}>Manda un messaggio 💬</Text></TouchableOpacity><TouchableOpacity style={styles.matchPopupSecondary} onPress={() => setShowMatch(null)}><Text style={styles.matchPopupSecondaryText}>Continua a scoprire 🔍</Text></TouchableOpacity></Animated.View></View>)}
      <View style={styles.bottomBarPremium}><TouchableOpacity style={[styles.tabPremium, tab === 'scopri' && styles.tabActivePremium]} onPress={() => setTab('scopri')}><Text style={styles.tabIconPremium}>🔍</Text><Text style={[styles.tabTextPremium, tab === 'scopri' && styles.tabTextActivePremium]}>Scopri</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'inviate' && styles.tabActivePremium]} onPress={() => setTab('inviate')}><Text style={styles.tabIconPremium}>✨</Text><Text style={[styles.tabTextPremium, tab === 'inviate' && styles.tabTextActivePremium]}>Inviate</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'match' && styles.tabActivePremium]} onPress={() => setTab('match')}><Text style={styles.tabIconPremium}>❤️</Text><Text style={[styles.tabTextPremium, tab === 'match' && styles.tabTextActivePremium]}>Match</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'profilo' && styles.tabActivePremium]} onPress={() => setTab('profilo')}><Text style={styles.tabIconPremium}>👤</Text><Text style={[styles.tabTextPremium, tab === 'profilo' && styles.tabTextActivePremium]}>Profilo</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080a', alignItems: 'center', paddingTop: 50 },
  glowTop: { position: 'absolute', top: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff3b30', opacity: 0.12, borderRadius: 200 },
  glowBottom: { position: 'absolute', bottom: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff7a2e', opacity: 0.08, borderRadius: 200 },
  logoPremium: { fontSize: 32, fontWeight: '900', color: '#fff' },
  subtitlePremium: { color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4, marginBottom: 12, fontWeight: '600' },
  counterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, gap: 8, marginBottom: 12 },
  counterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00d084' },
  counterTextPremium: { color: '#aaa', fontSize: 11, fontWeight: '600' },
  resetPill: { marginLeft: 8, backgroundColor: 'rgba(255,59,48,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  resetTextPremium: { color: '#ff3b30', fontSize: 10, fontWeight: 'bold' },
  filterWrapperPremium: { width: '100%', height: 44, marginBottom: 4 },
  filterContentPremium: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingRight: 32 },
  filterChipPremium: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  filterChipActivePremium: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  filterTextPremium: { color: '#777', fontSize: 12, fontWeight: '600' },
  filterTextActivePremium: { color: 'white' },
  deckContainer: { width: '100%', maxWidth: 380, alignSelf: 'center', height: 480, alignItems: 'center' },
  flipContainer: { width: '100%', maxWidth: 360, height: 400, position: 'absolute', top: 0 },
  flipCard: { position: 'absolute', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden', backfaceVisibility: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  flipBackCard: { backgroundColor: '#111113' },
  premiumCard: { width: '100%', maxWidth: 360, height: 380, borderRadius: 24, overflow: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', position: 'absolute', top: 0 },
  cardBehind2: { transform: [{ scale: 0.9 }], top: 16, opacity: 0.5 },
  cardBehind1: { transform: [{ scale: 0.95 }], top: 8, opacity: 0.8 },
  cardTop: { top: 0, zIndex: 10 },
  premiumImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  premiumOverlaySmallFIXED: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 85, backgroundColor: 'rgba(0,0,0,0.45)' },
  scoreBadgePremium: { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  scoreTextPremium: { color: '#ff7a7a', fontWeight: '800', fontSize: 12 },
  premiumCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  premiumName: { color: 'white', fontSize: 20, fontWeight: '800' },
  premiumCity: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, marginBottom: 10 },
  likeBadge: { position: 'absolute', top: 20, left: 20, borderWidth: 3, borderColor: '#00d084', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-12deg' }] },
  likeText: { color: '#00d084', fontWeight: '900', fontSize: 16 },
  nopeBadge: { position: 'absolute', top: 20, right: 20, borderWidth: 3, borderColor: '#ff3b30', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '12deg' }] },
  nopeText: { color: '#ff3b30', fontWeight: '900', fontSize: 16 },
  cardBack: { flex: 1, padding: 18 },
  cardBackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardBackAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#ff3b30' },
  cardBackName: { color: 'white', fontSize: 16, fontWeight: '800' },
  cardBackScore: { color: '#ff7a7a', fontSize: 11, marginTop: 2 },
  closeFlip: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeFlipText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  cardBackBioTitle: { color: '#666', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 12, marginBottom: 6 },
  cardBackBio: { color: '#ccc', fontSize: 12, lineHeight: 18 },
  reviewItem: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 10, marginBottom: 8 },
  reviewAuthor: { color: '#ff8a6a', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  reviewText: { color: '#aaa', fontSize: 11, fontStyle: 'italic' },
  backButtonFlip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  backButtonFlipText: { color: '#888', fontSize: 11, fontWeight: '700' },
  premiumCardSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 14, marginBottom: 10, width: '100%', maxWidth: 380, alignSelf: 'center' },
  avatarPremium: { width: 48, height: 48, borderRadius: 24 },
  namePremium: { color: 'white', fontWeight: '700', fontSize: 14 },
  cityPremium: { color: '#777', fontSize: 11, marginTop: 2 },
  matchCardPremium: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.08)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.15)', borderRadius: 20, padding: 16, marginBottom: 12, width: '100%', maxWidth: 380, alignSelf: 'center' },
  matchAvatarPremium: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#ff3b30' },
  matchNamePremium: { color: 'white', fontSize: 16, fontWeight: '800' },
  chatButtonPremium: { backgroundColor: '#ff3b30', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, marginTop: 8, alignSelf: 'flex-start' },
  chatButtonTextPremium: { color: 'white', fontWeight: '800', fontSize: 11 },
  emptyBoxPremium: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 32, alignItems: 'center', marginTop: 40, width: '100%', maxWidth: 380, alignSelf: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: 12 },
  emptyTextPremium: { color: 'white', fontWeight: '700', fontSize: 15 },
  profileContainerPremium: { width: '100%', maxWidth: 380, alignSelf: 'center', alignItems: 'center' },
  profileAvatarWrapper: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  profileAvatarRing: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#ff3b30', opacity: 0.5 },
  profileAvatarPremium: { width: 96, height: 96, borderRadius: 48 },
  profileScoreFloat: { position: 'absolute', bottom: -4, right: 0, backgroundColor: '#111', borderWidth: 1, borderColor: '#ff3b30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  profileScoreFloatText: { color: '#ff3b30', fontSize: 10, fontWeight: '800' },
  profileNamePremium: { color: 'white', fontSize: 22, fontWeight: '800' },
  profileCityPremium: { color: '#666', fontSize: 12, marginTop: 4, marginBottom: 18 },
  bigScoreBoxPremium: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.15)', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', width: '100%', marginBottom: 14 },
  bigScorePremium: { color: 'white', fontSize: 28, fontWeight: '900' },
  bigScoreLabelPremium: { color: 'white', fontSize: 12, fontWeight: '700', marginTop: 4 },
  bigScoreSubPremium: { color: '#666', fontSize: 10, marginTop: 4, textAlign: 'center' },
  statsRowPremium: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingVertical: 16, width: '100%', marginBottom: 14 },
  statItemPremium: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 4 },
  statNumberPremium: { color: 'white', fontSize: 20, fontWeight: '800' },
  statLabelPremium: { color: '#666', fontSize: 10, marginTop: 3, fontWeight: '600', textTransform: 'uppercase' },
  bioCardPremium: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, width: '100%', marginBottom: 10 },
  bioTitlePremium: { color: 'white', fontWeight: '700', fontSize: 13, marginBottom: 6 },
  bioTextPremium: { color: '#999', fontSize: 12, lineHeight: 18 },
  bottomBarPremium: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', backgroundColor: 'rgba(20,20,22,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, paddingVertical: 8, justifyContent: 'space-around' },
  tabPremium: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 16 },
  tabActivePremium: { backgroundColor: 'rgba(255,59,48,0.12)' },
  tabIconPremium: { fontSize: 18 },
  tabTextPremium: { color: '#555', fontSize: 9, fontWeight: '700', marginTop: 3 },
  tabTextActivePremium: { color: '#ff3b30' },
  chatHeaderPremium: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: 'rgba(20,20,22,0.9)', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backButtonPremium: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: 'white', fontSize: 20, marginTop: -2 },
  chatAvatarPremium: { width: 38, height: 38, borderRadius: 19, marginLeft: 12 },
  chatNamePremium: { color: 'white', fontWeight: '700', fontSize: 14 },
  chatStatusPremium: { color: '#666', fontSize: 11 },
  chatMessages: { flex: 1, width: '100%' },
  bubblePremium: { maxWidth: '76%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 20, marginBottom: 8 },
  myBubblePremium: { alignSelf: 'flex-end', backgroundColor: '#ff3b30', borderBottomRightRadius: 6 },
  theirBubblePremium: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.07)', borderBottomLeftRadius: 6 },
  bubbleTextPremium: { fontSize: 13, color: 'white' },
  chatInputBarPremium: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: 'rgba(20,20,22,0.9)', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  textInputPremium: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', borderRadius: 100, paddingHorizontal: 18, paddingVertical: 12, fontSize: 13 },
  sendButtonPremium: { backgroundColor: '#ff3b30', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendButtonTextPremium: { color: 'white', fontWeight: '800', fontSize: 18, marginTop: -2 },
  swipeButtonsRow: { position: 'absolute', bottom: 0, flexDirection: 'row', gap: 18, alignItems: 'center' },
  swipeBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  swipeBtnNo: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' },
  swipeBtnYes: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  swipeBtnUndo: { backgroundColor: 'rgba(255,200,0,0.12)', borderColor: 'rgba(255,200,0,0.2)', width: 48, height: 48, borderRadius: 24 },
  swipeBtnUndoDisabled: { opacity: 0.25 },
  swipeBtnText: { color: '#ff7a7a', fontSize: 20, fontWeight: '900' },
  swipeBtnTextYes: { color: 'white', fontSize: 20, fontWeight: '900' },
  swipeBtnUndoText: { color: '#ffcc00', fontSize: 18, fontWeight: '900' },
  matchOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  matchPopup: { width: '85%', maxWidth: 340, backgroundColor: '#151515', borderRadius: 28, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#ff3b30' },
  matchPopupTitle: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 6 },
  matchPopupSub: { color: '#888', fontSize: 12, marginBottom: 20, textAlign: 'center' },
  matchAvatarsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  matchPopupAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#ff3b30' },
  matchHeart: { fontSize: 28 },
  matchPopupPrimary: { backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 10 },
  matchPopupPrimaryText: { color: 'white', fontWeight: '800', fontSize: 13 },
  matchPopupSecondary: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingVertical: 12, width: '100%', alignItems: 'center' },
  matchPopupSecondaryText: { color: '#888', fontWeight: '700', fontSize: 12 },
});
