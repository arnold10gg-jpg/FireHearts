import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Pressable, Animated, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GIORNO 6 FINALE - TUTTE LE FEATURE: Fire Score Dinamico + Vibe Tags + Prompts + Daily Limits
const profiles = [
  { id: 1, name: 'Sofia, 24', city: 'Milano', distance: '1.2km', vibe: ['Avventurosa','Buongustaia','Viaggi'], bio: 'Marketing, aperitivi e viaggi spontanei', longBio: 'Vivo a Milano, lavoro nel marketing moda. Viaggi last-minute e vino naturale.', prompts: [{ q: 'Weekend ideale', a: 'Lago di Como + aperitivo + nessun telefono', icon: '🏔️' }, { q: 'Sono brava a', a: 'Organizzare viaggi impossibili in 24h', icon: '✈️' }, { q: 'Green flag', a: 'Porta sempre snack in borsa', icon: '💚' }], reviews: [{ author: 'Marco 27', text: 'Solare e conversazione top!', rating: 5.0 }, { author: 'Luca 29', text: 'Super divertente', rating: 4.7 }, { author: 'Andrea 26', text: 'Vibe incredibile', rating: 4.8 }], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop', online: true, verified: true, activity: 92 },
  { id: 2, name: 'Giulia, 22', city: 'Bergamo', distance: '3.4km', vibe: ['Intensa','Natura','Palestra'], bio: 'Psicologia, palestra e tramonti', longBio: 'Studio psicologia a Bergamo. Cerco persone vere.', prompts: [{ q: 'Unpopular opinion', a: 'Palestra e meditazione', icon: '🤫' }, { q: 'Superpower', a: 'Capisco se menti in 3 secondi', icon: '👁️' }, { q: 'Happy place', a: 'Palestra alle 6AM con tramonto', icon: '🌅' }], reviews: [{ author: 'Davide 24', text: 'Dolce e intelligente.', rating: 4.6 }, { author: 'Fede 25', text: 'Profonda', rating: 4.5 }], photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop', online: true, verified: false, activity: 78 },
  { id: 3, name: 'Martina, 26', city: 'Brescia', distance: '6.1km', vibe: ['Chef','Passionale','Buongustaia'], bio: 'Chef privato, cucino io', longBio: 'Chef Lago di Garda. Porti il vino, preparo io.', prompts: [{ q: 'Cucino meglio di', a: 'Tua nonna - sfida accettata?', icon: '👨‍🍳' }, { q: 'Love language', a: 'Cibo e vino buono', icon: '🍷' }, { q: 'Sabato sera', a: 'Cucino per te, tu porti storie', icon: '✨' }], reviews: [{ author: 'Carlo 28', text: 'Serata 10 e lode.', rating: 5.0 }, { author: 'Ste 27', text: 'Chef pazzesca', rating: 5.0 }, { author: 'Gio 26', text: 'Top', rating: 4.8 }], photo: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=800&q=80&auto=format&fit=crop', online: false, verified: true, activity: 95 },
  { id: 4, name: 'Alice, 23', city: 'Milano', distance: '2.8km', vibe: ['Creativa','Arty','Design'], bio: 'Designer in Brera', longBio: 'Designer a Milano, Brera, arte e aperitivi.', prompts: [{ q: 'Museo preferito', a: 'Fondazione Prada a mezzanotte', icon: '🎨' }, { q: 'Design e', a: 'Rendere semplice il complicato', icon: '💡' }, { q: 'Sono famosa per', a: 'Perdere chiavi ma trovare idee', icon: '🔑' }], reviews: [{ author: 'Marta 25', text: 'Stile pazzesco!', rating: 4.7 }, { author: 'Chiara 24', text: 'Creativa', rating: 4.6 }], photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80&auto=format&fit=crop', online: true, verified: true, activity: 88 },
  { id: 5, name: 'Elena, 25', city: 'Pavia', distance: '8.3km', vibe: ['Zen','Curiosa','Yoga'], bio: 'Yoga e caffe specialty', longBio: 'Istruttrice yoga a Pavia.', prompts: [{ q: 'Mattina ideale', a: 'Yoga 6am + libro + caffe', icon: '🧘' }, { q: 'Non vivo senza', a: 'Tappetino e vinili', icon: '🎶' }, { q: 'Life motto', a: 'Respira, poi decidi', icon: '🌿' }], reviews: [{ author: 'Luca 26', text: 'Energia calma.', rating: 4.9 }, { author: 'Sara 24', text: 'Dolce', rating: 4.7 }], photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&auto=format&fit=crop', online: true, verified: true, activity: 90 },
  { id: 6, name: 'Chiara, 24', city: 'Milano', distance: '0.9km', vibe: ['Analogica','Vinile','Creativa'], bio: 'Fotografa analogica', longBio: 'Fotografa analogica, camera oscura e vinili.', prompts: [{ q: 'Scatto migliore', a: 'Quello che non ho ancora fatto - con te?', icon: '📸' }, { q: 'Nota per', a: 'Perdere rullini ma trovare momenti', icon: '🎞️' }, { q: 'Sviluppo a', a: 'Lento, come le cose belle', icon: '⏳' }], reviews: [{ author: 'Fede 27', text: 'Creativa da paura.', rating: 4.7 }, { author: 'Tom 28', text: 'Stile unico', rating: 4.3 }], photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80&auto=format&fit=crop', online: false, verified: false, activity: 65 },
];

const defaultMyProfile = { name: 'Carl', age: 28, city: 'Bascape - Lombardia', bio: 'Fondatore di FireHearts.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop', baseReviews: [{ rating: 4.7 }, { rating: 4.8 }, { rating: 4.6 }], myVibes: ['Founder','Avventuroso','Business'], myPrompts: [{ q: 'Sto costruendo', a: 'FireHearts - dating con Fire Score', icon: '🔥' }, { q: 'Weekend perfetto', a: 'Code + aperitivo + brainstorming', icon: '💻' }, { q: 'Cerco', a: 'Persone che sognano in grande', icon: '🚀' }] };
const cities = ['Tutti', 'Milano', 'Bergamo', 'Brescia', 'Pavia'];
const allVibes = ['Tutti', 'Avventurosa','Buongustaia','Viaggi','Intensa','Natura','Palestra','Chef','Passionale','Creativa','Arty','Design','Zen','Curiosa','Yoga','Analogica','Vinile'];

function calculateFireScore(profile, extraMatches = 0) {
  const reviewsAvg = profile.reviews ? (profile.reviews.reduce((s,r)=>s+r.rating,0) / profile.reviews.length) : (profile.baseReviews ? profile.baseReviews.reduce((s,r)=>s+r.rating,0)/profile.baseReviews.length : 4.5);
  const verifiedBonus = profile.verified ? 0.15 : 0;
  const onlineBonus = profile.online ? 0.05 : 0;
  const activityBonus = profile.activity ? (profile.activity / 1000) : 0.08;
  const matchBonus = extraMatches * 0.02;
  let score = reviewsAvg + verifiedBonus + onlineBonus + activityBonus + matchBonus;
  score = Math.min(5.0, Math.max(3.5, score));
  return score.toFixed(1);
}
function getScoreColor(score) { const s = parseFloat(score); if (s >= 4.8) return '#00d084'; if (s >= 4.5) return '#ffcc00'; return '#ff7a7a'; }

export default function App() {
  const [sent, setSent] = useState([]);
  const [matches, setMatches] = useState([]);
  const [superLiked, setSuperLiked] = useState([]);
  const [superCount, setSuperCount] = useState(3);
  const [undoCount, setUndoCount] = useState(3);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('scopri');
  const [filterCity, setFilterCity] = useState('Tutti');
  const [filterVibe, setFilterVibe] = useState('Tutti');
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [flippedId, setFlippedId] = useState(null);
  const [activeFlipId, setActiveFlipId] = useState(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(null);
  const [isSuperMatch, setIsSuperMatch] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [myProfile, setMyProfile] = useState(defaultMyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBio, setEditBio] = useState('');
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swipePosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const matchScale = useRef(new Animated.Value(0)).current;
  const topProfileIdRef = useRef(null);
  const scorePulse = useRef(new Animated.Value(1)).current;
  const [chats, setChats] = useState({ 1: [{ id: 1, text: 'Ehi! Grazie per la scintilla!', from: 'them' }] });

  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('fh_sent');
        const m = await AsyncStorage.getItem('fh_matches');
        const idx = await AsyncStorage.getItem('fh_swipeIndex');
        const c = await AsyncStorage.getItem('fh_chats');
        const h = await AsyncStorage.getItem('fh_history');
        const sup = await AsyncStorage.getItem('fh_superLiked');
        const supCount = await AsyncStorage.getItem('fh_superCount');
        const uCount = await AsyncStorage.getItem('fh_undoCount');
        const lastReset = await AsyncStorage.getItem('fh_lastResetDate');
        const prof = await AsyncStorage.getItem('fh_myProfile');
        const fVibe = await AsyncStorage.getItem('fh_filterVibe');
        if (s) setSent(JSON.parse(s));
        if (m) setMatches(JSON.parse(m));
        if (idx) setSwipeIndex(JSON.parse(idx));
        if (c) setChats(JSON.parse(c));
        if (h) setHistory(JSON.parse(h));
        if (sup) setSuperLiked(JSON.parse(sup));
        if (supCount) setSuperCount(JSON.parse(supCount));
        if (uCount) setUndoCount(JSON.parse(uCount));
        if (lastReset) setLastResetDate(lastReset);
        if (prof) setMyProfile(JSON.parse(prof));
        if (fVibe) setFilterVibe(fVibe);
        const today = new Date().toDateString();
        if (lastReset !== today) {
          setSuperCount(3); setUndoCount(3); setLastResetDate(today);
          await AsyncStorage.setItem('fh_superCount', JSON.stringify(3));
          await AsyncStorage.setItem('fh_undoCount', JSON.stringify(3));
          await AsyncStorage.setItem('fh_lastResetDate', today);
        }
      } catch {} setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_sent', JSON.stringify(sent)); }, [sent, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_matches', JSON.stringify(matches)); }, [matches, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_swipeIndex', JSON.stringify(swipeIndex)); }, [swipeIndex, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_chats', JSON.stringify(chats)); }, [chats, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_history', JSON.stringify(history)); }, [history, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_superLiked', JSON.stringify(superLiked)); }, [superLiked, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_superCount', JSON.stringify(superCount)); }, [superCount, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_undoCount', JSON.stringify(undoCount)); }, [undoCount, loaded]);
  useEffect(() => { if (loaded && lastResetDate) AsyncStorage.setItem('fh_lastResetDate', lastResetDate); }, [lastResetDate, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_myProfile', JSON.stringify(myProfile)); }, [myProfile, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_filterVibe', filterVibe); }, [filterVibe, loaded]);

  let filteredProfiles = filterCity === 'Tutti' ? profiles : profiles.filter((p) => p.city === filterCity);
  if (filterVibe !== 'Tutti') filteredProfiles = filteredProfiles.filter((p) => p.vibe.includes(filterVibe));
  const topProfile = filteredProfiles[swipeIndex % (filteredProfiles.length || 1)];
  const nextProfile = filteredProfiles[(swipeIndex + 1) % (filteredProfiles.length || 1)];
  const nextNextProfile = filteredProfiles[(swipeIndex + 2) % (filteredProfiles.length || 1)];
  useEffect(() => { topProfileIdRef.current = topProfile?.id || null; setPromptIndex(0); }, [topProfile]);
  const myDynamicScore = calculateFireScore({ ...myProfile, verified: true, online: true, activity: 90, reviews: myProfile.baseReviews }, matches.length);
  useEffect(() => { Animated.sequence([Animated.timing(scorePulse, { toValue: 1.2, duration: 150, useNativeDriver: true }), Animated.timing(scorePulse, { toValue: 1, duration: 150, useNativeDriver: true })]).start(); }, [matches.length]);

  const startEditing = () => { setEditName(myProfile.name); setEditAge(String(myProfile.age || 28)); setEditCity(myProfile.city); setEditBio(myProfile.bio); setIsEditing(true); };
  const saveEditing = () => { setMyProfile({ ...myProfile, name: editName || myProfile.name, age: parseInt(editAge) || myProfile.age, city: editCity || myProfile.city, bio: editBio || myProfile.bio }); setIsEditing(false); };
  const handleFlip = (id) => { if (activeFlipId) return; if (flippedId === id) { setActiveFlipId(id); Animated.timing(flipAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => { setFlippedId(null); setActiveFlipId(null); }); } else { setActiveFlipId(id); flipAnim.setValue(0); Animated.timing(flipAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => { setFlippedId(id); setActiveFlipId(null); }); } };
  const triggerMatchPopup = (p, superLike = false) => { setIsSuperMatch(superLike); setShowMatch(p); matchScale.setValue(0); Animated.spring(matchScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start(); };
  const sendScintilla = (p) => { if (!sent.includes(p.id)) { setSent([...sent, p.id]); setTimeout(() => { if (Math.random() > 0.25) { setMatches((prev) => (prev.includes(p.id) ? prev : [...prev, p.id])); triggerMatchPopup(p, false); } }, 800); } };
  const goNextCard = () => { swipePosition.setValue({ x: 0, y: 0 }); setFlippedId(null); flipAnim.setValue(0); setSwipeIndex((s) => s + 1); };
  const handleSwipeRight = () => { if (!topProfile) return; setHistory((prev) => [...prev, { id: topProfile.id, action: 'like' }]); Animated.timing(swipePosition, { toValue: { x: 550, y: -60 }, duration: 230, useNativeDriver: true }).start(() => { sendScintilla(topProfile); goNextCard(); }); };
  const handleSwipeLeft = () => { if (!topProfile) return; setHistory((prev) => [...prev, { id: topProfile.id, action: 'nope' }]); Animated.timing(swipePosition, { toValue: { x: -550, y: -60 }, duration: 230, useNativeDriver: true }).start(() => goNextCard()); };
  const handleSuperLike = () => { if (!topProfile || superCount <= 0) return; setSuperCount((s) => s - 1); setSuperLiked((prev) => [...prev, topProfile.id]); setHistory((prev) => [...prev, { id: topProfile.id, action: 'super' }]); Animated.timing(swipePosition, { toValue: { x: 0, y: -500 }, duration: 280, useNativeDriver: true }).start(() => { setSent((prev) => prev.includes(topProfile.id) ? prev : [...prev, topProfile.id]); setMatches((prev) => prev.includes(topProfile.id) ? prev : [...prev, topProfile.id]); triggerMatchPopup(topProfile, true); goNextCard(); }); };
  const handleUndo = () => { if (history.length === 0) return; if (undoCount <= 0) return; setUndoCount((c) => c - 1); const last = history[history.length - 1]; setHistory((prev) => prev.slice(0, -1)); setSwipeIndex((s) => Math.max(0, s - 1)); if (last.action === 'like') { setSent((prev) => prev.filter((x) => x !== last.id)); setMatches((prev) => prev.filter((x) => x !== last.id)); } if (last.action === 'super') { setSent((prev) => prev.filter((x) => x !== last.id)); setMatches((prev) => prev.filter((x) => x !== last.id)); setSuperLiked((prev) => prev.filter((x) => x !== last.id)); setSuperCount((s) => s + 1); } swipePosition.setValue({ x: 0, y: 0 }); setFlippedId(null); flipAnim.setValue(0); };
  const handleReset = async () => { setSent([]); setMatches([]); setSwipeIndex(0); setHistory([]); setSuperLiked([]); setSuperCount(3); setUndoCount(3); setFilterVibe('Tutti'); setLastResetDate(new Date().toDateString()); setMyProfile(defaultMyProfile); setChats({ 1: [{ id: 1, text: 'Ehi!', from: 'them' }] }); await AsyncStorage.clear(); };
  const handleVibePress = (vibe) => { setFilterVibe(vibe); setSwipeIndex(0); setFlippedId(null); flipAnim.setValue(0); };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => { if (flippedId || showMatch) return; swipePosition.setValue({ x: g.dx, y: g.dy * 0.25 }); },
    onPanResponderRelease: (_, g) => {
      if (flippedId || showMatch) return;
      if (Math.abs(g.dx) < 10 && Math.abs(g.dy) < 10) { if (topProfileIdRef.current) handleFlip(topProfileIdRef.current); Animated.spring(swipePosition, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start(); return; }
      if (g.dx > 110) handleSwipeRight(); else if (g.dx < -110) handleSwipeLeft(); else if (g.dy < -110 && superCount > 0) handleSuperLike(); else Animated.spring(swipePosition, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: true }).start();
    },
  })).current;

  const rotate = swipePosition.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-14deg', '0deg', '14deg'], extrapolate: 'clamp' });
  const likeOpacity = swipePosition.x.interpolate({ inputRange: [20, 110], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = swipePosition.x.interpolate({ inputRange: [-110, -20], outputRange: [1, 0], extrapolate: 'clamp' });
  const superOpacity = swipePosition.y.interpolate({ inputRange: [-110, -20], outputRange: [1, 0], extrapolate: 'clamp' });
  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const handleSendMessage = () => { if (!inputText.trim() || !activeChat) return; const newMsg = { id: Date.now(), text: inputText, from: 'me' }; setChats((prev) => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), newMsg] })); setInputText(''); };
  const inviateProfiles = profiles.filter((p) => sent.includes(p.id) && !matches.includes(p.id));
  const matchProfiles = profiles.filter((p) => matches.includes(p.id));
  const isFlipped = topProfile && flippedId === topProfile.id; const isFlipping = topProfile && activeFlipId === topProfile.id;

  if (!loaded) { return (<View style={styles.container}><Text style={styles.logoPremium}>FireHearts</Text><Text style={styles.subtitlePremium}>Caricamento...</Text></View>); }
  if (activeChat) {
    const messages = chats[activeChat.id] || [];
    return (<View style={styles.container}><View style={styles.glowTop} /><View style={styles.chatHeaderPremium}><TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backButtonPremium}><Text style={styles.backText}>Indietro</Text></TouchableOpacity><Image source={{ uri: activeChat.photo }} style={styles.chatAvatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.chatNamePremium}>{activeChat.name}</Text><Text style={styles.chatStatusPremium}>{calculateFireScore(activeChat)} ★</Text></View></View><ScrollView style={styles.chatMessages} contentContainerStyle={{ padding: 16 }}>{messages.map((msg) => (<View key={msg.id} style={[styles.bubblePremium, msg.from === 'me' ? styles.myBubblePremium : styles.theirBubblePremium]}><Text style={styles.bubbleTextPremium}>{msg.text}</Text></View>))}</ScrollView><View style={styles.chatInputBarPremium}><TextInput style={styles.textInputPremium} placeholder="Scrivi..." placeholderTextColor="#666" value={inputText} onChangeText={setInputText} onSubmitEditing={handleSendMessage} /><TouchableOpacity style={styles.sendButtonPremium} onPress={handleSendMessage}><Text style={styles.sendButtonTextPremium}>Invia</Text></TouchableOpacity></View></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} /><View style={styles.glowBottom} />
      <Text style={styles.logoPremium}>FireHearts</Text><Text style={styles.subtitlePremium}>Giorno 6 FINALE - Fire Score + Vibe + Prompts + Daily 🔥</Text>
      <View style={styles.counterPill}><View style={styles.counterDot} /><Text style={styles.counterTextPremium}>{filteredProfiles.length > 0 ? `${swipeIndex % filteredProfiles.length +1} / ${filteredProfiles.length}` : `0 / 0`} - {matches.length} Match - 💙{superCount} ↩️{undoCount}{filterVibe !== 'Tutti' ? ` - #${filterVibe}` : ''}</Text><TouchableOpacity onPress={handleReset} style={styles.resetPill}><Text style={styles.resetTextPremium}>Reset</Text></TouchableOpacity></View>
      {tab === 'scopri' && (<><View style={styles.filterWrapperPremium}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContentPremium}>{cities.map((c) => (<TouchableOpacity key={c} style={[styles.filterChipPremium, filterCity === c && styles.filterChipActivePremium]} onPress={() => { setFilterCity(c); setSwipeIndex(0); setFlippedId(null); flipAnim.setValue(0); }}><Text style={[styles.filterTextPremium, filterCity === c && styles.filterTextActivePremium]}>{c}</Text></TouchableOpacity>))}</ScrollView></View><View style={styles.filterWrapperPremium}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContentPremium}>{allVibes.map((v) => (<TouchableOpacity key={v} style={[styles.filterChipPremium, styles.vibeFilterChip, filterVibe === v && styles.filterChipVibeActive]} onPress={() => handleVibePress(v)}><Text style={[styles.filterTextPremium, filterVibe === v && styles.filterTextActivePremium]}>{v === 'Tutti' ? 'Tutti Vibe' : `#${v}`}</Text></TouchableOpacity>))}</ScrollView></View>{filterVibe !== 'Tutti' && (<TouchableOpacity style={styles.activeVibePill} onPress={() => setFilterVibe('Tutti')}><Text style={styles.activeVibeText}>Filtro: {filterVibe} ✕</Text></TouchableOpacity>)}</>)}
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 300 }} showsVerticalScrollIndicator={false}>
        {tab === 'scopri' && filteredProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyTextPremium}>Nessuno con vibe {filterVibe} a {filterCity} 😅</Text><TouchableOpacity style={styles.clearFilterBtn} onPress={() => { setFilterCity('Tutti'); setFilterVibe('Tutti'); }}><Text style={styles.clearFilterText}>Azzera filtri</Text></TouchableOpacity></View>)}
        {tab === 'scopri' && topProfile && (
          <View style={styles.deckContainerFixed}>
            {nextNextProfile && (<View style={[styles.premiumCard, styles.cardBehind2]}><Image source={{ uri: nextNextProfile.photo }} style={styles.premiumImage} /><View style={styles.cardGradientBottom} /></View>)}
            {nextProfile && (<View style={[styles.premiumCard, styles.cardBehind1]}><Image source={{ uri: nextProfile.photo }} style={styles.premiumImage} /><View style={styles.cardGradientBottom} /></View>)}
            {isFlipped || isFlipping ? (
              <Pressable style={styles.flipContainer} onPress={() => handleFlip(topProfile.id)}>
                <Animated.View style={[styles.flipCard, { transform: [{ perspective: 1000 }, { rotateY: isFlipping ? frontInterpolate : '180deg' }] }]}><Image source={{ uri: topProfile.photo }} style={styles.premiumImage} /><View style={styles.cardGradientBottom} /></Animated.View>
                <Animated.View style={[styles.flipCard, styles.flipBackCard, { transform: [{ perspective: 1000 }, { rotateY: isFlipping ? backInterpolate : '360deg' }] }]}>
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.cardBack} showsVerticalScrollIndicator={false}>
                    <View style={styles.cardBackHeader}><Image source={{ uri: topProfile.photo }} style={styles.cardBackAvatar} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.cardBackName}>{topProfile.name}</Text><Text style={[styles.cardBackScore, { color: getScoreColor(calculateFireScore(topProfile)) }]}>{calculateFireScore(topProfile)} ★</Text></View><View style={styles.closeFlip}><Text style={styles.closeFlipText}>X</Text></View></View>
                    <View style={styles.vibeRow}>{topProfile.vibe.map((v,i)=>(<TouchableOpacity key={i} style={[styles.vibeTag, filterVibe === v && styles.vibeTagActive]} onPress={() => handleVibePress(v)}><Text style={[styles.vibeTagText, filterVibe === v && styles.vibeTagTextActive]}>#{v}</Text></TouchableOpacity>))}</View>
                    <View style={styles.fireScoreBreakdown}><Text style={styles.breakdownTitle}>Fire Score {calculateFireScore(topProfile)} ★</Text><Text style={styles.breakdownLabel}>Media {topProfile.reviews.length} recensioni: {(topProfile.reviews.reduce((s,r)=>s+r.rating,0)/topProfile.reviews.length).toFixed(1)} + bonus verificato/online/attivita</Text></View>
                    <Text style={styles.cardBackBioTitle}>Prompts (3)</Text>{topProfile.prompts.map((pr,idx)=>(<View key={idx} style={styles.promptCard}><Text style={styles.promptCardQ}>{pr.icon} {pr.q}</Text><Text style={styles.promptCardA}>{pr.a}</Text></View>))}
                    <View style={styles.backButtonFlip}><Text style={styles.backButtonFlipText}>Tocca per tornare</Text></View>
                  </ScrollView>
                </Animated.View>
              </Pressable>
            ) : (
              <Pressable onPress={() => handleFlip(topProfile.id)} style={{ width: '100%', alignItems: 'center' }}>
                <Animated.View {...panResponder.panHandlers} style={[styles.premiumCard, styles.cardTop, { transform: [{ translateX: swipePosition.x }, { translateY: swipePosition.y }, { rotate: rotate }] }]}>
                  <Image source={{ uri: topProfile.photo }} style={styles.premiumImage} /><View style={styles.cardGradientBottom} />
                  <View style={styles.topBarClean}><View style={[styles.scoreBadgePremium, { borderColor: getScoreColor(calculateFireScore(topProfile)), borderWidth: 1.5 }]}><Text style={[styles.scoreTextPremium, { color: getScoreColor(calculateFireScore(topProfile)) }]}>{calculateFireScore(topProfile)} ★</Text></View><View style={{ flexDirection: 'row', gap: 8 }}>{topProfile.verified && (<View style={styles.verifiedBadgeClean}><Text style={styles.verifiedTextClean}>✓ Verificato</Text></View>)}</View></View>
                  <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}><Text style={styles.likeText}>LIKE</Text></Animated.View>
                  <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}><Text style={styles.nopeText}>NOPE</Text></Animated.View>
                  <Animated.View style={[styles.superBadge, { opacity: superOpacity }]}><Text style={styles.superText}>SUPER</Text></Animated.View>
                  <View style={styles.premiumCardContent}>
                    <Text style={styles.premiumName}>{topProfile.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}><Text style={styles.premiumCity}>📍 {topProfile.city}</Text><View style={styles.distancePill}><Text style={styles.distanceText}>{topProfile.distance}</Text></View></View>
                    <View style={styles.vibeRowSmall}>{topProfile.vibe.map((v,i)=>(<TouchableOpacity key={i} style={[styles.vibeTagSmall, filterVibe === v && styles.vibeTagSmallActive]} onPress={() => handleVibePress(v)}><Text style={[styles.vibeTagSmallText, filterVibe === v && styles.vibeTagSmallTextActive]}>#{v}</Text></TouchableOpacity>))}</View>
                    <View style={styles.promptCarouselContainer}><ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.x / 280); setPromptIndex(idx); }} style={styles.promptCarousel} contentContainerStyle={{ gap: 8 }}>{topProfile.prompts.map((pr, idx) => (<View key={idx} style={styles.promptPreviewCard}><Text style={styles.promptQ}>{pr.icon} {pr.q}</Text><Text style={styles.promptA} numberOfLines={2}>{pr.a}</Text></View>))}</ScrollView><View style={styles.promptDots}>{topProfile.prompts.map((_, idx) => (<View key={idx} style={[styles.promptDot, promptIndex === idx && styles.promptDotActive]} />))}</View></View>
                  </View>
                </Animated.View>
              </Pressable>
            )}
            <View style={styles.swipeButtonsRowFixed}><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnNo]} onPress={handleSwipeLeft}><Text style={styles.swipeBtnText}>✕</Text></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnUndo, undoCount === 0 && styles.swipeBtnUndoDisabled]} onPress={handleUndo}><Text style={styles.swipeBtnUndoText}>↩️</Text><View style={styles.superCountBadge}><Text style={styles.superCountText}>{undoCount}</Text></View></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnSuper, superCount === 0 && styles.swipeBtnUndoDisabled]} onPress={handleSuperLike}><Text style={styles.swipeBtnSuperText}>💙</Text><View style={styles.superCountBadge}><Text style={styles.superCountText}>{superCount}</Text></View></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnYes]} onPress={handleSwipeRight}><Text style={styles.swipeBtnTextYes}>❤️</Text></TouchableOpacity></View>
          </View>
        )}
        {tab === 'inviate' && inviateProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyTextPremium}>Nessuna scintilla 💌</Text></View>)}
        {tab === 'inviate' && inviateProfiles.map((p) => (<View key={p.id} style={styles.premiumCardSmall}><Image source={{ uri: p.photo }} style={styles.avatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.namePremium}>{p.name} - {calculateFireScore(p)} ★</Text><Text style={styles.cityPremium}>#{p.vibe[0]}</Text></View></View>))}
        {tab === 'match' && matchProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyTextPremium}>Nessun Match 🔥</Text></View>)}
        {tab === 'match' && matchProfiles.map((p) => (<View key={p.id} style={[styles.matchCardPremium, superLiked.includes(p.id) && styles.matchCardSuper]}><Image source={{ uri: p.photo }} style={styles.matchAvatarPremium} /><View style={{ flex: 1, marginLeft: 14 }}><Text style={styles.matchNamePremium}>{p.name} - {calculateFireScore(p)} ★</Text><Text style={styles.matchSubText}>#{p.vibe.join(' #')}</Text><TouchableOpacity style={styles.chatButtonPremium} onPress={() => setActiveChat(p)}><Text style={styles.chatButtonTextPremium}>Chat 💬</Text></TouchableOpacity></View></View>))}
        {tab === 'profilo' && (<View style={styles.profileContainerPremium}>{isEditing ? (<View style={styles.editContainer}><Text style={styles.editTitle}>Modifica ✏️</Text><Text style={styles.editLabel}>Nome</Text><TextInput style={styles.editInput} value={editName} onChangeText={setEditName} /><Text style={styles.editLabel}>Citta</Text><TextInput style={styles.editInput} value={editCity} onChangeText={setEditCity} /><Text style={styles.editLabel}>Bio</Text><TextInput style={[styles.editInput, styles.editInputBio]} value={editBio} onChangeText={setEditBio} multiline /><View style={styles.editButtonsRow}><TouchableOpacity style={styles.editCancel} onPress={() => setIsEditing(false)}><Text style={styles.editCancelText}>Annulla</Text></TouchableOpacity><TouchableOpacity style={styles.editSave} onPress={saveEditing}><Text style={styles.editSaveText}>Salva</Text></TouchableOpacity></View></View>) : (<><View style={styles.profileAvatarWrapper}><View style={styles.profileAvatarRing} /><Image source={{ uri: myProfile.photo }} style={styles.profileAvatarPremium} /><Animated.View style={[styles.profileScoreFloat, { transform: [{ scale: scorePulse }], borderColor: getScoreColor(myDynamicScore) }]}><Text style={[styles.profileScoreFloatText, { color: getScoreColor(myDynamicScore) }]}>{myDynamicScore} ★</Text></Animated.View></View><Text style={styles.profileNamePremium}>{myProfile.name}</Text><TouchableOpacity style={styles.editProfileButton} onPress={startEditing}><Text style={styles.editProfileButtonText}>Modifica ✏️</Text></TouchableOpacity><View style={[styles.bigScoreBoxPremium, { borderColor: getScoreColor(myDynamicScore) + '40' }]}><Text style={[styles.bigScorePremium, { color: getScoreColor(myDynamicScore) }]}>{myDynamicScore} ❤️‍🔥</Text><Text style={styles.bigScoreLabelPremium}>Fire Score Dinamico</Text><Text style={styles.bigScoreSubPremium}>💙{superCount} Super + ↩️{undoCount} Undo oggi - Reset mezzanotte</Text></View><View style={styles.bioCardPremium}><Text style={styles.bioTitlePremium}>Giorno 6 FINALE COMPLETO</Text><Text style={styles.bioTextPremium}>6.1 Fire Score Dinamico + 6.2 Vibe Tags + 6.3 Prompts Swipeabili + 6.4 Daily Limits. 6 HD profili, emoji visibili, flip fix, filtri combo citta+vibe.</Text></View></>)}</View>)}
      </ScrollView>
      {showMatch && (<View style={styles.matchOverlay}><Animated.View style={[styles.matchPopup, isSuperMatch && styles.matchPopupSuper, { transform: [{ scale: matchScale }] }]}><Text style={styles.matchPopupTitle}>{isSuperMatch ? 'Super Match! 💙' : 'Match! ❤️‍🔥'}</Text><Text style={styles.matchPopupSub}>Fire Score {calculateFireScore(showMatch)} ★ - #{showMatch.vibe[0]}</Text><View style={styles.matchAvatarsRow}><Image source={{ uri: myProfile.photo }} style={styles.matchPopupAvatar} /><Image source={{ uri: showMatch.photo }} style={styles.matchPopupAvatar} /></View><TouchableOpacity style={[styles.matchPopupPrimary, isSuperMatch && styles.matchPopupPrimarySuper]} onPress={() => { setActiveChat(showMatch); setShowMatch(null); }}><Text style={styles.matchPopupPrimaryText}>Messaggio 💬</Text></TouchableOpacity><TouchableOpacity style={styles.matchPopupSecondary} onPress={() => setShowMatch(null)}><Text style={styles.matchPopupSecondaryText}>Continua</Text></TouchableOpacity></Animated.View></View>)}
      <View style={styles.bottomBarPremium}><TouchableOpacity style={[styles.tabPremium, tab === 'scopri' && styles.tabActivePremium]} onPress={() => setTab('scopri')}><Text style={styles.tabIconPremium}>🔍</Text><Text style={[styles.tabTextPremium, tab === 'scopri' && styles.tabTextActivePremium]}>Scopri</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'inviate' && styles.tabActivePremium]} onPress={() => setTab('inviate')}><Text style={styles.tabIconPremium}>✨</Text><Text style={[styles.tabTextPremium, tab === 'inviate' && styles.tabTextActivePremium]}>Inviate</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'match' && styles.tabActivePremium]} onPress={() => setTab('match')}><Text style={styles.tabIconPremium}>❤️</Text><Text style={[styles.tabTextPremium, tab === 'match' && styles.tabTextActivePremium]}>Match</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'profilo' && styles.tabActivePremium]} onPress={() => setTab('profilo')}><Text style={styles.tabIconPremium}>👤</Text><Text style={[styles.tabTextPremium, tab === 'profilo' && styles.tabTextActivePremium]}>Profilo</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080a', alignItems: 'center', paddingTop: 50 },
  glowTop: { position: 'absolute', top: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff3b30', opacity: 0.12, borderRadius: 200 },
  glowBottom: { position: 'absolute', bottom: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff7a2e', opacity: 0.08, borderRadius: 200 },
  logoPremium: { fontSize: 34, fontWeight: '900', color: '#fff' },
  subtitlePremium: { color: '#666', fontSize: 9, textTransform: 'uppercase', marginTop: 4, marginBottom: 12, fontWeight: '600', textAlign: 'center' },
  counterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, gap: 8, marginBottom: 12 },
  counterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00d084' },
  counterTextPremium: { color: '#aaa', fontSize: 10, fontWeight: '600' },
  resetPill: { marginLeft: 8, backgroundColor: 'rgba(255,59,48,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  resetTextPremium: { color: '#ff3b30', fontSize: 10, fontWeight: 'bold' },
  filterWrapperPremium: { width: '100%', height: 44, marginBottom: 8 },
  filterContentPremium: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingRight: 32 },
  filterChipPremium: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100 },
  filterChipActivePremium: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  filterChipVibeActive: { backgroundColor: '#ffcc00', borderColor: '#ffcc00' },
  vibeFilterChip: { backgroundColor: 'rgba(255,204,0,0.12)', borderColor: 'rgba(255,204,0,0.2)' },
  filterTextPremium: { color: '#777', fontSize: 12, fontWeight: '600' },
  filterTextActivePremium: { color: 'white' },
  activeVibePill: { backgroundColor: 'rgba(255,204,0,0.15)', borderWidth: 1, borderColor: '#ffcc00', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, marginBottom: 12 },
  activeVibeText: { color: '#ffcc00', fontSize: 11, fontWeight: '800' },
  deckContainerFixed: { width: '100%', maxWidth: 380, alignSelf: 'center', height: 580, alignItems: 'center', position: 'relative' },
  flipContainer: { width: '100%', maxWidth: 360, height: 460, position: 'absolute', top: 0 },
  flipCard: { position: 'absolute', width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden', backfaceVisibility: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  flipBackCard: { backgroundColor: '#111113' },
  premiumCard: { width: '100%', maxWidth: 360, height: 460, borderRadius: 32, overflow: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', position: 'absolute', top: 0 },
  cardBehind2: { transform: [{ scale: 0.88 }], top: 22, opacity: 0.4 },
  cardBehind1: { transform: [{ scale: 0.94 }], top: 11, opacity: 0.7 },
  cardTop: { top: 0, zIndex: 10 },
  premiumImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cardGradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 190, backgroundColor: 'rgba(0,0,0,0.82)' },
  topBarClean: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreBadgePremium: { backgroundColor: 'rgba(20,20,20,0.88)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100 },
  scoreTextPremium: { fontWeight: '800', fontSize: 12 },
  verifiedBadgeClean: { backgroundColor: 'rgba(46,140,255,0.92)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  verifiedTextClean: { color: 'white', fontWeight: '800', fontSize: 11 },
  premiumCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
  premiumName: { color: 'white', fontSize: 24, fontWeight: '900' },
  premiumCity: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  premiumBio: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
  vibeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  vibeTag: { backgroundColor: 'rgba(255,59,48,0.15)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.25)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  vibeTagActive: { backgroundColor: '#ffcc00', borderColor: '#ffcc00' },
  vibeTagText: { color: '#ff8a7a', fontSize: 11, fontWeight: '700' },
  vibeTagTextActive: { color: 'black' },
  vibeRowSmall: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 2 },
  vibeTagSmall: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  vibeTagSmallActive: { backgroundColor: '#ffcc00', borderColor: '#ffcc00' },
  vibeTagSmallText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
  vibeTagSmallTextActive: { color: 'black', fontWeight: '800' },
  promptCarouselContainer: { width: '100%', marginTop: 8 },
  promptCarousel: { width: 300 },
  promptPreviewCard: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, width: 280, marginRight: 8 },
  promptQ: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  promptA: { color: 'white', fontSize: 13, fontWeight: '600', marginTop: 2 },
  promptDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 6 },
  promptDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  promptDotActive: { backgroundColor: '#ff3b30', width: 14 },
  distancePill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  distanceText: { color: 'white', fontSize: 11, fontWeight: '700' },
  likeBadge: { position: 'absolute', top: 80, left: 20, borderWidth: 3, borderColor: '#00d084', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, transform: [{ rotate: '-12deg' }], backgroundColor: 'rgba(0,0,0,0.2)' },
  likeText: { color: '#00d084', fontWeight: '900', fontSize: 18 },
  nopeBadge: { position: 'absolute', top: 80, right: 20, borderWidth: 3, borderColor: '#ff3b30', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, transform: [{ rotate: '12deg' }], backgroundColor: 'rgba(0,0,0,0.2)' },
  nopeText: { color: '#ff3b30', fontWeight: '900', fontSize: 18 },
  superBadge: { position: 'absolute', bottom: 140, alignSelf: 'center', borderWidth: 3, borderColor: '#2e8cff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: 'rgba(0,0,0,0.2)' },
  superText: { color: '#2e8cff', fontWeight: '900', fontSize: 18 },
  cardBack: { flex: 1, padding: 22 },
  cardBackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardBackAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#ff3b30' },
  cardBackName: { color: 'white', fontSize: 18, fontWeight: '800' },
  cardBackScore: { fontSize: 12, marginTop: 2, fontWeight: '700' },
  closeFlip: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeFlipText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  fireScoreBreakdown: { backgroundColor: 'rgba(255,59,48,0.08)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.15)', borderRadius: 16, padding: 14, marginBottom: 16 },
  breakdownTitle: { color: '#ff7a7a', fontSize: 11, fontWeight: '800', marginBottom: 10, textTransform: 'uppercase' },
  breakdownLabel: { color: '#888', fontSize: 11 },
  cardBackBioTitle: { color: '#666', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
  cardBackBio: { color: '#ddd', fontSize: 13, lineHeight: 20 },
  promptCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 10 },
  promptCardQ: { color: '#888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  promptCardA: { color: '#fff', fontSize: 14, fontWeight: '600' },
  backButtonFlip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  backButtonFlipText: { color: '#888', fontSize: 11, fontWeight: '700' },
  premiumCardSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 10, width: '100%', maxWidth: 380, alignSelf: 'center' },
  avatarPremium: { width: 52, height: 52, borderRadius: 26 },
  namePremium: { color: 'white', fontWeight: '700', fontSize: 15 },
  cityPremium: { color: '#777', fontSize: 12, marginTop: 2 },
  matchCardPremium: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.08)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.15)', borderRadius: 22, padding: 18, marginBottom: 12, width: '100%', maxWidth: 380, alignSelf: 'center' },
  matchCardSuper: { borderColor: '#2e8cff', backgroundColor: 'rgba(46,140,255,0.12)' },
  matchAvatarPremium: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#ff3b30' },
  matchNamePremium: { color: 'white', fontSize: 17, fontWeight: '800' },
  matchSubText: { color: '#888', fontSize: 12, marginTop: 2 },
  chatButtonPremium: { backgroundColor: '#ff3b30', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 16, marginTop: 10, alignSelf: 'flex-start' },
  chatButtonTextPremium: { color: 'white', fontWeight: '800', fontSize: 12 },
  emptyBoxPremium: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 28, padding: 36, alignItems: 'center', marginTop: 40, width: '100%', maxWidth: 380, alignSelf: 'center' },
  clearFilterBtn: { marginTop: 16, backgroundColor: '#ff3b30', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 100 },
  clearFilterText: { color: 'white', fontWeight: '800', fontSize: 12 },
  profileContainerPremium: { width: '100%', maxWidth: 380, alignSelf: 'center', alignItems: 'center' },
  profileAvatarWrapper: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  profileAvatarRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#ff3b30', opacity: 0.5 },
  profileAvatarPremium: { width: 104, height: 104, borderRadius: 52 },
  profileScoreFloat: { position: 'absolute', bottom: -2, right: 2, backgroundColor: '#111', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  profileScoreFloatText: { fontSize: 11, fontWeight: '800' },
  profileNamePremium: { color: 'white', fontSize: 24, fontWeight: '900' },
  editProfileButton: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100, marginBottom: 18 },
  editProfileButtonText: { color: '#bbb', fontSize: 13, fontWeight: '700' },
  bigScoreBoxPremium: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderRadius: 24, paddingVertical: 20, paddingHorizontal: 28, alignItems: 'center', width: '100%', marginBottom: 16 },
  bigScorePremium: { fontSize: 32, fontWeight: '900' },
  bigScoreLabelPremium: { color: 'white', fontSize: 13, fontWeight: '700', marginTop: 4 },
  bigScoreSubPremium: { color: '#666', fontSize: 11, marginTop: 4, textAlign: 'center' },
  bioCardPremium: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, width: '100%', marginBottom: 12 },
  bioTitlePremium: { color: 'white', fontWeight: '700', fontSize: 14, marginBottom: 8 },
  bioTextPremium: { color: '#999', fontSize: 13, lineHeight: 19 },
  editContainer: { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 20 },
  editTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  editLabel: { color: '#666', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 6 },
  editInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: 'white', fontSize: 14 },
  editInputBio: { height: 90, textAlignVertical: 'top' },
  editButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  editCancel: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingVertical: 14, alignItems: 'center' },
  editCancelText: { color: '#888', fontWeight: '700', fontSize: 13 },
  editSave: { flex: 1, backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 14, alignItems: 'center' },
  editSaveText: { color: 'white', fontWeight: '800', fontSize: 13 },
  bottomBarPremium: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', backgroundColor: 'rgba(20,20,22,0.95)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 28, paddingVertical: 10, justifyContent: 'space-around' },
  tabPremium: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20 },
  tabActivePremium: { backgroundColor: 'rgba(255,59,48,0.12)' },
  tabIconPremium: { fontSize: 20 },
  tabTextPremium: { color: '#555', fontSize: 10, fontWeight: '700', marginTop: 4 },
  tabTextActivePremium: { color: '#ff3b30' },
  chatHeaderPremium: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: 'rgba(20,20,22,0.95)', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backButtonPremium: { width: 80, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: 'white', fontSize: 14, fontWeight: '800' },
  chatAvatarPremium: { width: 42, height: 42, borderRadius: 21, marginLeft: 12 },
  chatNamePremium: { color: 'white', fontWeight: '700', fontSize: 15 },
  chatStatusPremium: { color: '#666', fontSize: 12 },
  chatMessages: { flex: 1, width: '100%' },
  bubblePremium: { maxWidth: '76%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, marginBottom: 10 },
  myBubblePremium: { alignSelf: 'flex-end', backgroundColor: '#ff3b30', borderBottomRightRadius: 6 },
  theirBubblePremium: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 6 },
  bubbleTextPremium: { fontSize: 14, color: 'white', lineHeight: 18 },
  chatInputBarPremium: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: 'rgba(20,20,22,0.95)', paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  textInputPremium: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', borderRadius: 100, paddingHorizontal: 20, paddingVertical: 14, fontSize: 14 },
  sendButtonPremium: { backgroundColor: '#ff3b30', width: 72, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sendButtonTextPremium: { color: 'white', fontWeight: '800', fontSize: 14 },
  swipeButtonsRowFixed: { position: 'absolute', bottom: 12, flexDirection: 'row', gap: 14, alignItems: 'center', zIndex: 30, backgroundColor: 'rgba(8,8,10,0.85)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  swipeBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  swipeBtnNo: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' },
  swipeBtnYes: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  swipeBtnUndo: { backgroundColor: 'rgba(255,200,0,0.15)', borderColor: 'rgba(255,200,0,0.3)', width: 48, height: 48, borderRadius: 24 },
  swipeBtnSuper: { backgroundColor: 'rgba(46,140,255,0.2)', borderColor: 'rgba(46,140,255,0.4)', width: 58, height: 58, borderRadius: 29 },
  swipeBtnUndoDisabled: { opacity: 0.25 },
  swipeBtnText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  swipeBtnTextYes: { color: 'white', fontSize: 20, fontWeight: '900' },
  swipeBtnUndoText: { color: '#ffcc00', fontSize: 18, fontWeight: '900' },
  swipeBtnSuperText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  superCountBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#2e8cff', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#08080a' },
  superCountText: { color: 'white', fontSize: 10, fontWeight: '900' },
  matchOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  matchPopup: { width: '85%', maxWidth: 340, backgroundColor: '#151515', borderRadius: 32, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#ff3b30' },
  matchPopupSuper: { borderColor: '#2e8cff' },
  matchPopupTitle: { color: 'white', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  matchPopupSub: { color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 18 },
  matchAvatarsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 28 },
  matchPopupAvatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: '#ff3b30' },
  matchPopupPrimary: { backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 16, paddingHorizontal: 28, width: '100%', alignItems: 'center', marginBottom: 12 },
  matchPopupPrimarySuper: { backgroundColor: '#2e8cff' },
  matchPopupPrimaryText: { color: 'white', fontWeight: '800', fontSize: 14 },
  matchPopupSecondary: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingVertical: 13, width: '100%', alignItems: 'center' },
  matchPopupSecondaryText: { color: '#888', fontWeight: '700', fontSize: 13 },
  emptyTextPremium: { color: 'white', fontWeight: '800', fontSize: 14, textAlign: 'center' },
});
