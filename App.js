import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Pressable, Animated, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const profiles = [
  { id: 1, name: 'Sofia, 24', city: 'Milano', distance: '1.2km', score: '4.8', bio: 'Marketing, aperitivi e viaggi spontanei', longBio: 'Vivo a Milano, lavoro nel marketing per brand di moda. Amo i viaggi last-minute, vino naturale e conversazioni che durano fino alle 2 di notte. Cerco qualcuno di ambizioso ma con i piedi per terra.', prompts: [{ q: 'Il mio weekend ideale', a: 'Lago di Como + aperitivo con vista + nessun telefono' }, { q: 'Sono brava a', a: 'Organizzare viaggi impossibili in 24h' }], reviews: [{ author: 'Marco 27 • 5.0', text: 'Super solare, conversazione top!' }], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop', online: true, verified: true },
  { id: 2, name: 'Giulia, 22', city: 'Bergamo', distance: '3.4km', score: '4.6', bio: 'Psicologia, palestra e tramonti sul lago', longBio: 'Studio psicologia a Bergamo. Tra palestra, libri e tramonti sul lago, cerco persone vere. Odio i filtri, amo la sincerità e le persone dirette.', prompts: [{ q: 'Unpopular opinion', a: 'La palestra è meditazione, non vanità' }, { q: 'La mia superpower', a: 'Capisco al volo se menti' }], reviews: [{ author: 'Andrea 24 • 4.5', text: 'Dolce e intelligente, ottima vibe.' }], photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop', online: true, verified: false },
  { id: 3, name: 'Martina, 26', city: 'Brescia', distance: '6.1km', score: '4.9', bio: 'Chef privato. Cucino io, tu porti il vino', longBio: 'Chef privato Lago di Garda. Se porti il vino, preparo io la cena. Amo le cene a lume di candela e le persone che sanno ascoltare.', prompts: [{ q: 'Cucino meglio di', a: 'Tua nonna. E non scherzo.' }, { q: 'Il mio love language', a: 'Cibo. Tanto cibo. E vino buono.' }], reviews: [{ author: 'Davide 28 • 5.0', text: 'Serata incredibile, 10 e lode.' }], photo: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=800&q=80&auto=format&fit=crop', online: false, verified: true },
  { id: 4, name: 'Alice, 23', city: 'Milano', distance: '2.8km', score: '4.7', bio: 'Designer in Brera, amo arte e musei', longBio: 'Designer a Milano, studio in Brera. Minimal, arte contemporanea e aperitivi con vista. Cerco qualcuno con cui perdersi in una galleria.', prompts: [{ q: 'Il mio museo preferito', a: 'Fondazione Prada - ci vivo praticamente' }, { q: 'Il design è', a: 'Rendere complicato semplice' }], reviews: [{ author: 'Stefano 25 • 4.6', text: 'Stile pazzesco!' }], photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80&auto=format&fit=crop', online: true, verified: true },
  { id: 5, name: 'Elena, 25', city: 'Pavia', distance: '8.3km', score: '4.8', bio: 'Yoga, libri e caffè specialty', longBio: 'Istruttrice yoga a Pavia. Mattine lente e libri sottolineati. Cerco equilibrio, non perfezione.', prompts: [{ q: 'La mia mattina ideale', a: 'Yoga 6am + caffè + libro + zero notifiche' }, { q: 'Non posso vivere senza', a: 'Il mio tappetino e i miei vinili' }], reviews: [{ author: 'Luca 26 • 4.9', text: 'Energia calma, rarissima.' }], photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&auto=format&fit=crop', online: true, verified: true },
  { id: 6, name: 'Chiara, 24', city: 'Milano', distance: '0.9km', score: '4.5', bio: 'Fotografa analogica e notti in vinile', longBio: 'Fotografa analogica. Sviluppo in camera oscura e notti in vinile. Cerco qualcuno da fotografare.', prompts: [{ q: 'Il mio scatto migliore', a: 'Quello che devo ancora fare - con te?' }, { q: 'Sono nota per', a: 'Perdere rullini e trovare storie' }], reviews: [{ author: 'Fede 27 • 4.7', text: 'Creativa da paura.' }], photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80&auto=format&fit=crop', online: false, verified: false },
];

const defaultMyProfile = { name: 'Carl', age: 28, city: 'Bascape • Lombardia', bio: 'Fondatore di FireHearts. Sto costruendo l’app che misura il valore vero delle persone. Amo sfide, business e connessioni reali.', score: '4.7', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop' };
const cities = ['Tutti', 'Milano', 'Bergamo', 'Brescia', 'Pavia'];

export default function App() {
  const [sent, setSent] = useState([]);
  const [matches, setMatches] = useState([]);
  const [superLiked, setSuperLiked] = useState([]);
  const [superCount, setSuperCount] = useState(3);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('scopri');
  const [filterCity, setFilterCity] = useState('Tutti');
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [flippedId, setFlippedId] = useState(null);
  const [activeFlipId, setActiveFlipId] = useState(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
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

  const [chats, setChats] = useState({
    1: [{ id: 1, text: 'Ehi! Grazie per la scintilla! Se ti va ci prendiamo un caffè in Brera?', from: 'them' }],
  });

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
        const prof = await AsyncStorage.getItem('fh_myProfile');
        if (s) setSent(JSON.parse(s));
        if (m) setMatches(JSON.parse(m));
        if (idx) setSwipeIndex(JSON.parse(idx));
        if (c) setChats(JSON.parse(c));
        if (h) setHistory(JSON.parse(h));
        if (sup) setSuperLiked(JSON.parse(sup));
        if (supCount) setSuperCount(JSON.parse(supCount));
        if (prof) setMyProfile(JSON.parse(prof));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_sent', JSON.stringify(sent)); }, [sent, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_matches', JSON.stringify(matches)); }, [matches, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_swipeIndex', JSON.stringify(swipeIndex)); }, [swipeIndex, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_chats', JSON.stringify(chats)); }, [chats, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_history', JSON.stringify(history)); }, [history, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_superLiked', JSON.stringify(superLiked)); }, [superLiked, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_superCount', JSON.stringify(superCount)); }, [superCount, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('fh_myProfile', JSON.stringify(myProfile)); }, [myProfile, loaded]);

  const filteredProfiles = filterCity === 'Tutti' ? profiles : profiles.filter((p) => p.city === filterCity);
  const topProfile = filteredProfiles[swipeIndex % filteredProfiles.length];
  const nextProfile = filteredProfiles[(swipeIndex + 1) % filteredProfiles.length];
  const nextNextProfile = filteredProfiles[(swipeIndex + 2) % filteredProfiles.length];

  const startEditing = () => {
    setEditName(myProfile.name);
    setEditAge(String(myProfile.age));
    setEditCity(myProfile.city);
    setEditBio(myProfile.bio);
    setIsEditing(true);
  };
  const saveEditing = () => {
    setMyProfile({
      ...myProfile,
      name: editName || myProfile.name,
      age: parseInt(editAge) || myProfile.age,
      city: editCity || myProfile.city,
      bio: editBio || myProfile.bio,
    });
    setIsEditing(false);
  };

  const handleFlip = (id) => {
    if (activeFlipId) return;
    if (flippedId === id) {
      setActiveFlipId(id);
      Animated.timing(flipAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => { setFlippedId(null); setActiveFlipId(null); });
    } else {
      setActiveFlipId(id); flipAnim.setValue(0);
      Animated.timing(flipAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => { setFlippedId(id); setActiveFlipId(null); });
    }
  };

  const triggerMatchPopup = (p, superLike = false) => { setIsSuperMatch(superLike); setShowMatch(p); matchScale.setValue(0); Animated.spring(matchScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start(); };
  const sendScintilla = (p) => {
    if (!sent.includes(p.id)) {
      setSent([...sent, p.id]);
      setTimeout(() => { if (Math.random() > 0.25) { setMatches((prev) => (prev.includes(p.id) ? prev : [...prev, p.id])); triggerMatchPopup(p, false); } }, 800);
    }
  };
  const goNextCard = () => { swipePosition.setValue({ x: 0, y: 0 }); setFlippedId(null); flipAnim.setValue(0); setSwipeIndex((s) => s + 1); };
  
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
  const handleSuperLike = () => {
    if (!topProfile || superCount <= 0) return;
    setSuperCount((s) => s - 1);
    setSuperLiked((prev) => [...prev, topProfile.id]);
    setHistory((prev) => [...prev, { id: topProfile.id, action: 'super' }]);
    Animated.timing(swipePosition, { toValue: { x: 0, y: -500 }, duration: 280, useNativeDriver: true }).start(() => {
      setSent((prev) => prev.includes(topProfile.id) ? prev : [...prev, topProfile.id]);
      setMatches((prev) => prev.includes(topProfile.id) ? prev : [...prev, topProfile.id]);
      triggerMatchPopup(topProfile, true);
      goNextCard();
    });
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
    if (last.action === 'super') {
      setSent((prev) => prev.filter((x) => x !== last.id));
      setMatches((prev) => prev.filter((x) => x !== last.id));
      setSuperLiked((prev) => prev.filter((x) => x !== last.id));
      setSuperCount((s) => s + 1);
    }
    swipePosition.setValue({ x: 0, y: 0 });
    setFlippedId(null);
    flipAnim.setValue(0);
  };
  const handleReset = async () => {
    setSent([]); setMatches([]); setSwipeIndex(0); setHistory([]); setSuperLiked([]); setSuperCount(3);
    setMyProfile(defaultMyProfile);
    setChats({ 1: [{ id: 1, text: 'Ehi! Grazie per la scintilla!', from: 'them' }] }); await AsyncStorage.clear();
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => { if (flippedId || showMatch) return; swipePosition.setValue({ x: g.dx, y: g.dy * 0.25 }); },
    onPanResponderRelease: (_, g) => {
      if (flippedId || showMatch) return;
      if (Math.abs(g.dx) < 10 && Math.abs(g.dy) < 10) { handleFlip(topProfile.id); Animated.spring(swipePosition, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start(); return; }
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
    return (<View style={styles.container}><View style={styles.glowTop} /><View style={styles.chatHeaderPremium}><TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backButtonPremium}><Text style={styles.backText}>‹</Text></TouchableOpacity><Image source={{ uri: activeChat.photo }} style={styles.chatAvatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.chatNamePremium}>{activeChat.name}</Text><Text style={styles.chatStatusPremium}>Online • {activeChat.score}</Text></View></View><ScrollView style={styles.chatMessages} contentContainerStyle={{ padding: 16 }}>{messages.map((msg) => (<View key={msg.id} style={[styles.bubblePremium, msg.from === 'me' ? styles.myBubblePremium : styles.theirBubblePremium]}><Text style={styles.bubbleTextPremium}>{msg.text}</Text></View>))}</ScrollView><View style={styles.chatInputBarPremium}><TextInput style={styles.textInputPremium} placeholder="Scrivi qualcosa di memorabile..." placeholderTextColor="#666" value={inputText} onChangeText={setInputText} onSubmitEditing={handleSendMessage} /><TouchableOpacity style={styles.sendButtonPremium} onPress={handleSendMessage}><Text style={styles.sendButtonTextPremium}>↗</Text></TouchableOpacity></View></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} /><View style={styles.glowBottom} />
      <Text style={styles.logoPremium}>FireHearts</Text><Text style={styles.subtitlePremium}>Trova la tua scintilla</Text>
      <View style={styles.counterPill}><View style={styles.counterDot} /><Text style={styles.counterTextPremium}>{swipeIndex+1} / {filteredProfiles.length} • {matches.length} Match • {superCount} super</Text><TouchableOpacity onPress={handleReset} style={styles.resetPill}><Text style={styles.resetTextPremium}>Reset</Text></TouchableOpacity></View>
      
      {tab === 'scopri' && (
        <View style={styles.filterWrapperPremium}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContentPremium}>
            {cities.map((c) => (
              <TouchableOpacity key={c} style={[styles.filterChipPremium, filterCity === c && styles.filterChipActivePremium]} onPress={() => { setFilterCity(c); setSwipeIndex(0); setFlippedId(null); flipAnim.setValue(0); }}>
                <Text style={[styles.filterTextPremium, filterCity === c && styles.filterTextActivePremium]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {tab === 'scopri' && topProfile && (
          <View style={styles.deckContainer}>
            {nextNextProfile && (
              <View style={[styles.premiumCard, styles.cardBehind2]}>
                <Image source={{ uri: nextNextProfile.photo }} style={styles.premiumImage} />
                <View style={styles.cardGradientBottom} />
              </View>
            )}
            {nextProfile && (
              <View style={[styles.premiumCard, styles.cardBehind1]}>
                <Image source={{ uri: nextProfile.photo }} style={styles.premiumImage} />
                <View style={styles.cardGradientBottom} />
              </View>
            )}

            {isFlipped || isFlipping ? (
              <Pressable style={styles.flipContainer} onPress={() => handleFlip(topProfile.id)}>
                <Animated.View style={[styles.flipCard, { transform: [{ perspective: 1000 }, { rotateY: isFlipping ? frontInterpolate : '180deg' }] }]}>
                  <Image source={{ uri: topProfile.photo }} style={styles.premiumImage} />
                  <View style={styles.cardGradientBottom} />
                  <View style={styles.premiumCardContent}><Text style={styles.premiumName}>{topProfile.name}</Text></View>
                </Animated.View>
                <Animated.View style={[styles.flipCard, styles.flipBackCard, { transform: [{ perspective: 1000 }, { rotateY: isFlipping ? backInterpolate : '360deg' }] }]}>
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.cardBack} showsVerticalScrollIndicator={false}>
                    <View style={styles.cardBackHeader}>
                      <Image source={{ uri: topProfile.photo }} style={styles.cardBackAvatar} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.cardBackName}>{topProfile.name}</Text>
                          {topProfile.verified && <View style={styles.verifiedBadgeSmall}><Text style={styles.verifiedTextSmall}>V</Text></View>}
                        </View>
                        <Text style={styles.cardBackScore}>{topProfile.score} • {topProfile.city} {topProfile.online ? '• Online' : ''}</Text>
                      </View>
                      <View style={styles.closeFlip}><Text style={styles.closeFlipText}>X</Text></View>
                    </View>
                    <Text style={styles.cardBackBioTitle}>Bio</Text>
                    <Text style={styles.cardBackBio}>{topProfile.longBio}</Text>
                    <Text style={styles.cardBackBioTitle}>Feedback reali ({topProfile.reviews.length})</Text>
                    {topProfile.reviews.map((r, i) => (
                      <View key={i} style={styles.reviewItem}>
                        <Text style={styles.reviewAuthor}>{r.author}</Text>
                        <Text style={styles.reviewText}>"{r.text}"</Text>
                      </View>
                    ))}
                    <Text style={styles.cardBackBioTitle}>I miei prompt</Text>
                    {topProfile.prompts.map((pr, idx) => (
                      <View key={idx} style={styles.promptCard}>
                        <Text style={styles.promptCardQ}>{pr.q}</Text>
                        <Text style={styles.promptCardA}>{pr.a}</Text>
                      </View>
                    ))}
                    <View style={styles.backButtonFlip}><Text style={styles.backButtonFlipText}>Tocca per tornare alla foto</Text></View>
                  </ScrollView>
                </Animated.View>
              </Pressable>
            ) : (
              <Animated.View {...panResponder.panHandlers} style={[styles.premiumCard, styles.cardTop, { transform: [{ translateX: swipePosition.x }, { translateY: swipePosition.y }, { rotate: rotate }] }]}>
                <Image source={{ uri: topProfile.photo }} style={styles.premiumImage} />
                <View style={styles.cardGradientBottom} />
                
                <View style={styles.topBarClean}>
                  <View style={styles.scoreBadgePremium}>
                    <Text style={styles.scoreTextPremium}>{topProfile.score}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {superLiked.includes(topProfile.id) && (
                      <View style={styles.superBadgeSmall}><Text style={styles.superBadgeSmallText}>SUPER</Text></View>
                    )}
                    {topProfile.verified && (
                      <View style={styles.verifiedBadgeClean}>
                        <Text style={styles.verifiedTextClean}>Verificato</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}><Text style={styles.likeText}>LIKE</Text></Animated.View>
                <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}><Text style={styles.nopeText}>NOPE</Text></Animated.View>
                <Animated.View style={[styles.superBadge, { opacity: superOpacity }]}><Text style={styles.superText}>SUPER</Text></Animated.View>

                <View style={styles.premiumCardContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.premiumName}>{topProfile.name}</Text>
                    {topProfile.verified && <View style={styles.verifiedBadgeSmall}><Text style={styles.verifiedTextSmall}>V</Text></View>}
                    {topProfile.online && <View style={styles.onlineDotSmallWhite} />}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                    <Text style={styles.premiumCity}>{topProfile.city}</Text>
                    <View style={styles.distancePill}><Text style={styles.distanceText}>{topProfile.distance}</Text></View>
                    {topProfile.online && <Text style={styles.onlineText}>Online ora</Text>}
                  </View>
                  <Text style={styles.premiumBio} numberOfLines={1}>{topProfile.bio}</Text>
                  <View style={styles.promptPreview}>
                    <Text style={styles.promptQ}>{topProfile.prompts[0].q}</Text>
                    <Text style={styles.promptA} numberOfLines={2}>{topProfile.prompts[0].a}</Text>
                  </View>
                  <TouchableOpacity style={styles.infoButton} onPress={() => handleFlip(topProfile.id)}>
                    <Text style={styles.infoButtonText}>Vedi Bio Completa + Prompts</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
            
            <View style={styles.swipeButtonsRow}>
              <TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnNo]} onPress={handleSwipeLeft}><Text style={styles.swipeBtnText}>X</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnUndo, history.length === 0 && styles.swipeBtnUndoDisabled]} onPress={handleUndo}><Text style={styles.swipeBtnUndoText}>Undo</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnSuper, superCount === 0 && styles.swipeBtnUndoDisabled]} onPress={handleSuperLike}><Text style={styles.swipeBtnSuperText}>S</Text>{superCount > 0 && <View style={styles.superCountBadge}><Text style={styles.superCountText}>{superCount}</Text></View>}</TouchableOpacity>
              <TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnYes]} onPress={handleSwipeRight}><Text style={styles.swipeBtnTextYes}>Like</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {tab === 'inviate' && inviateProfiles.length === 0 && (
          <View style={styles.emptyBoxPremium}><Text style={styles.emptyIcon}>!</Text><Text style={styles.emptyTextPremium}>Nessuna scintilla in attesa</Text><Text style={styles.emptySub}>Le persone a cui hai messo like appariranno qui</Text></View>
        )}
        {tab === 'inviate' && inviateProfiles.map((p) => (
          <View key={p.id} style={styles.premiumCardSmall}><Image source={{ uri: p.photo }} style={styles.avatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={styles.namePremium}>{p.name}</Text>{p.verified && <View style={styles.verifiedBadgeSmall}><Text style={styles.verifiedTextSmall}>V</Text></View>}</View><Text style={styles.cityPremium}>{p.city} {superLiked.includes(p.id) ? '• SUPER' : ''}</Text></View><View style={styles.waitingBadge}><Text style={styles.waitingText}>In attesa</Text></View></View>
        ))}

        {tab === 'match' && matchProfiles.length === 0 && (
          <View style={styles.emptyBoxPremium}><Text style={styles.emptyIcon}>!</Text><Text style={styles.emptyTextPremium}>Nessun Match ancora</Text><Text style={styles.emptySub}>Continua a swipare</Text></View>
        )}
        {tab === 'match' && matchProfiles.map((p) => (
          <View key={p.id} style={[styles.matchCardPremium, superLiked.includes(p.id) && styles.matchCardSuper]}><Image source={{ uri: p.photo }} style={styles.matchAvatarPremium} /><View style={{ flex: 1, marginLeft: 14 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text style={styles.matchNamePremium}>{p.name}</Text>{superLiked.includes(p.id) ? <Text>S</Text> : null}{p.online && <View style={styles.onlineDotSmall} />}</View><Text style={styles.matchSubText}>{p.city} • {p.score}</Text><TouchableOpacity style={styles.chatButtonPremium} onPress={() => setActiveChat(p)}><Text style={styles.chatButtonTextPremium}>Apri Chat</Text></TouchableOpacity></View></View>
        ))}

        {tab === 'profilo' && (
          <View style={styles.profileContainerPremium}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <Text style={styles.editTitle}>Modifica Profilo</Text>
                <Text style={styles.editLabel}>Nome</Text><TextInput style={styles.editInput} value={editName} onChangeText={setEditName} placeholder="Il tuo nome" placeholderTextColor="#555" />
                <Text style={styles.editLabel}>Età</Text><TextInput style={styles.editInput} value={editAge} onChangeText={setEditAge} keyboardType="numeric" placeholder="Età" placeholderTextColor="#555" />
                <Text style={styles.editLabel}>Città</Text><TextInput style={styles.editInput} value={editCity} onChangeText={setEditCity} placeholder="Città • Regione" placeholderTextColor="#555" />
                <Text style={styles.editLabel}>Bio</Text><TextInput style={[styles.editInput, styles.editInputBio]} value={editBio} onChangeText={setEditBio} multiline placeholder="La tua bio" placeholderTextColor="#555" />
                <View style={styles.editButtonsRow}><TouchableOpacity style={styles.editCancel} onPress={() => setIsEditing(false)}><Text style={styles.editCancelText}>Annulla</Text></TouchableOpacity><TouchableOpacity style={styles.editSave} onPress={saveEditing}><Text style={styles.editSaveText}>Salva</Text></TouchableOpacity></View>
              </View>
            ) : (
              <>
                <View style={styles.profileAvatarWrapper}><View style={styles.profileAvatarRing} /><Image source={{ uri: myProfile.photo }} style={styles.profileAvatarPremium} /><View style={styles.profileScoreFloat}><Text style={styles.profileScoreFloatText}>{myProfile.score}</Text></View></View>
                <Text style={styles.profileNamePremium}>{myProfile.name}, {myProfile.age}</Text><Text style={styles.profileCityPremium}>{myProfile.city}</Text>
                <TouchableOpacity style={styles.editProfileButton} onPress={startEditing}><Text style={styles.editProfileButtonText}>Modifica profilo</Text></TouchableOpacity>
                <View style={styles.bigScoreBoxPremium}><Text style={styles.bigScorePremium}>{myProfile.score}</Text><Text style={styles.bigScoreLabelPremium}>Il tuo Fire Score</Text><Text style={styles.bigScoreSubPremium}>Basato su feedback reali • Giorno 5</Text><View style={styles.superRemainingPill}><Text style={styles.superRemainingText}>{superCount} Super Like rimasti oggi</Text></View></View>
                <View style={styles.statsRowPremium}><View style={styles.statItemPremium}><Text style={styles.statNumberPremium}>{sent.length}</Text><Text style={styles.statLabelPremium}>Inviate</Text></View><View style={styles.statDivider} /><View style={styles.statItemPremium}><Text style={styles.statNumberPremium}>{matchProfiles.length}</Text><Text style={styles.statLabelPremium}>Match</Text></View><View style={styles.statDivider} /><View style={styles.statItemPremium}><Text style={styles.statNumberPremium}>{superLiked.length}</Text><Text style={styles.statLabelPremium}>Super</Text></View></View>
                <View style={styles.bioCardPremium}><Text style={styles.bioTitlePremium}>La mia bio</Text><Text style={styles.bioTextPremium}>{myProfile.bio}</Text></View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {showMatch && (
        <View style={styles.matchOverlay}>
          <Animated.View style={[styles.matchPopup, isSuperMatch && styles.matchPopupSuper, { transform: [{ scale: matchScale }] }]}>
            <Text style={styles.matchPopupTitle}>{isSuperMatch ? 'Super Match!' : 'Match!'}</Text>
            <Text style={styles.matchPopupSub}>Tu e {showMatch.name} vi siete piaciuti {isSuperMatch ? 'con Super Like!' : ''}</Text>
            <View style={styles.matchAvatarsRow}><Image source={{ uri: myProfile.photo }} style={styles.matchPopupAvatar} /><Text style={styles.matchHeart}>{isSuperMatch ? 'S' : 'H'}</Text><Image source={{ uri: showMatch.photo }} style={styles.matchPopupAvatar} /></View>
            <TouchableOpacity style={[styles.matchPopupPrimary, isSuperMatch && styles.matchPopupPrimarySuper]} onPress={() => { setActiveChat(showMatch); setShowMatch(null); }}><Text style={styles.matchPopupPrimaryText}>Manda un messaggio</Text></TouchableOpacity>
            <TouchableOpacity style={styles.matchPopupSecondary} onPress={() => setShowMatch(null)}><Text style={styles.matchPopupSecondaryText}>Continua a scoprire</Text></TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <View style={styles.bottomBarPremium}>
        <TouchableOpacity style={[styles.tabPremium, tab === 'scopri' && styles.tabActivePremium]} onPress={() => setTab('scopri')}><Text style={styles.tabIconPremium}>S</Text><Text style={[styles.tabTextPremium, tab === 'scopri' && styles.tabTextActivePremium]}>Scopri</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabPremium, tab === 'inviate' && styles.tabActivePremium]} onPress={() => setTab('inviate')}><Text style={styles.tabIconPremium}>I</Text><Text style={[styles.tabTextPremium, tab === 'inviate' && styles.tabTextActivePremium]}>Inviate</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabPremium, tab === 'match' && styles.tabActivePremium]} onPress={() => setTab('match')}><Text style={styles.tabIconPremium}>M</Text><Text style={[styles.tabTextPremium, tab === 'match' && styles.tabTextActivePremium]}>Match</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabPremium, tab === 'profilo' && styles.tabActivePremium]} onPress={() => setTab('profilo')}><Text style={styles.tabIconPremium}>P</Text><Text style={[styles.tabTextPremium, tab === 'profilo' && styles.tabTextActivePremium]}>Profilo</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080a', alignItems: 'center', paddingTop: 50 },
  glowTop: { position: 'absolute', top: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff3b30', opacity: 0.12, borderRadius: 200 },
  glowBottom: { position: 'absolute', bottom: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff7a2e', opacity: 0.08, borderRadius: 200 },
  logoPremium: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  subtitlePremium: { color: '#666', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4, marginBottom: 12, fontWeight: '600' },
  counterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, gap: 8, marginBottom: 12 },
  counterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00d084' },
  counterTextPremium: { color: '#aaa', fontSize: 11, fontWeight: '600' },
  resetPill: { marginLeft: 8, backgroundColor: 'rgba(255,59,48,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  resetTextPremium: { color: '#ff3b30', fontSize: 10, fontWeight: 'bold' },
  filterWrapperPremium: { width: '100%', height: 44, marginBottom: 8 },
  filterContentPremium: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingRight: 32 },
  filterChipPremium: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100 },
  filterChipActivePremium: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  filterTextPremium: { color: '#777', fontSize: 12, fontWeight: '600' },
  filterTextActivePremium: { color: 'white' },
  deckContainer: { width: '100%', maxWidth: 380, alignSelf: 'center', height: 560, alignItems: 'center' },
  flipContainer: { width: '100%', maxWidth: 360, height: 480, position: 'absolute', top: 0 },
  flipCard: { position: 'absolute', width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden', backfaceVisibility: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  flipBackCard: { backgroundColor: '#111113' },
  premiumCard: { width: '100%', maxWidth: 360, height: 480, borderRadius: 32, overflow: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', position: 'absolute', top: 0 },
  cardBehind2: { transform: [{ scale: 0.88 }], top: 22, opacity: 0.4 },
  cardBehind1: { transform: [{ scale: 0.94 }], top: 11, opacity: 0.7 },
  cardTop: { top: 0, zIndex: 10 },
  premiumImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cardGradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, backgroundColor: 'rgba(0,0,0,0.85)' },
  topBarClean: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreBadgePremium: { backgroundColor: 'rgba(20,20,20,0.88)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100 },
  scoreTextPremium: { color: '#fff', fontWeight: '800', fontSize: 12 },
  verifiedBadgeClean: { backgroundColor: 'rgba(46,140,255,0.92)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  verifiedTextClean: { color: 'white', fontWeight: '800', fontSize: 11 },
  superBadgeSmall: { backgroundColor: '#2e8cff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  superBadgeSmallText: { color: 'white', fontWeight: '900', fontSize: 11 },
  verifiedBadgeSmall: { backgroundColor: '#2e8cff', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  verifiedTextSmall: { color: 'white', fontWeight: '900', fontSize: 10 },
  onlineDotSmallWhite: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00d084', borderWidth: 1.5, borderColor: 'white', marginLeft: 4 },
  premiumCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
  premiumName: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  premiumCity: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  premiumBio: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4, lineHeight: 18 },
  promptPreview: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, marginTop: 10 },
  promptQ: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  promptA: { color: 'white', fontSize: 13, fontWeight: '600', marginTop: 2, lineHeight: 16 },
  infoButton: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 100, paddingVertical: 8, paddingHorizontal: 14, marginTop: 10, alignItems: 'center' },
  infoButtonText: { color: 'white', fontSize: 11, fontWeight: '700' },
  distancePill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  distanceText: { color: 'white', fontSize: 11, fontWeight: '700' },
  onlineText: { color: '#00d084', fontSize: 11, fontWeight: '700' },
  likeBadge: { position: 'absolute', top: 90, left: 20, borderWidth: 3, borderColor: '#00d084', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, transform: [{ rotate: '-12deg' }], backgroundColor: 'rgba(0,0,0,0.2)' },
  likeText: { color: '#00d084', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  nopeBadge: { position: 'absolute', top: 90, right: 20, borderWidth: 3, borderColor: '#ff3b30', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, transform: [{ rotate: '12deg' }], backgroundColor: 'rgba(0,0,0,0.2)' },
  nopeText: { color: '#ff3b30', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  superBadge: { position: 'absolute', bottom: 150, alignSelf: 'center', borderWidth: 3, borderColor: '#2e8cff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: 'rgba(0,0,0,0.2)' },
  superText: { color: '#2e8cff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  cardBack: { flex: 1, padding: 22 },
  cardBackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardBackAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#ff3b30' },
  cardBackName: { color: 'white', fontSize: 18, fontWeight: '800' },
  cardBackScore: { color: '#ff7a7a', fontSize: 12, marginTop: 2 },
  closeFlip: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeFlipText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  cardBackBioTitle: { color: '#666', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
  cardBackBio: { color: '#ddd', fontSize: 13, lineHeight: 20 },
  reviewItem: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, marginBottom: 8 },
  reviewAuthor: { color: '#ff8a6a', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  reviewText: { color: '#bbb', fontSize: 12, fontStyle: 'italic', lineHeight: 16 },
  promptCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 10 },
  promptCardQ: { color: '#888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  promptCardA: { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 18 },
  backButtonFlip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  backButtonFlipText: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  premiumCardSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 10, width: '100%', maxWidth: 380, alignSelf: 'center' },
  avatarPremium: { width: 52, height: 52, borderRadius: 26 },
  namePremium: { color: 'white', fontWeight: '700', fontSize: 15 },
  cityPremium: { color: '#777', fontSize: 12, marginTop: 2 },
  waitingBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  waitingText: { color: '#888', fontSize: 10, fontWeight: '700' },
  matchCardPremium: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.08)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.15)', borderRadius: 22, padding: 18, marginBottom: 12, width: '100%', maxWidth: 380, alignSelf: 'center' },
  matchCardSuper: { borderColor: '#2e8cff', backgroundColor: 'rgba(46,140,255,0.12)' },
  matchAvatarPremium: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#ff3b30' },
  matchNamePremium: { color: 'white', fontSize: 17, fontWeight: '800' },
  matchSubText: { color: '#888', fontSize: 12, marginTop: 2 },
  onlineDotSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00d084', marginLeft: 4 },
  chatButtonPremium: { backgroundColor: '#ff3b30', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 16, marginTop: 10, alignSelf: 'flex-start' },
  chatButtonTextPremium: { color: 'white', fontWeight: '800', fontSize: 12 },
  emptyBoxPremium: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 28, padding: 36, alignItems: 'center', marginTop: 40, width: '100%', maxWidth: 380, alignSelf: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyTextPremium: { color: 'white', fontWeight: '800', fontSize: 16 },
  emptySub: { color: '#666', fontSize: 12, marginTop: 6, textAlign: 'center' },
  profileContainerPremium: { width: '100%', maxWidth: 380, alignSelf: 'center', alignItems: 'center' },
  profileAvatarWrapper: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  profileAvatarRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#ff3b30', opacity: 0.5 },
  profileAvatarPremium: { width: 104, height: 104, borderRadius: 52 },
  profileScoreFloat: { position: 'absolute', bottom: -2, right: 2, backgroundColor: '#111', borderWidth: 1, borderColor: '#ff3b30', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  profileScoreFloatText: { color: '#ff3b30', fontSize: 11, fontWeight: '800' },
  profileNamePremium: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  profileCityPremium: { color: '#666', fontSize: 13, marginTop: 4, marginBottom: 10 },
  editProfileButton: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100, marginBottom: 18 },
  editProfileButtonText: { color: '#bbb', fontSize: 13, fontWeight: '700' },
  bigScoreBoxPremium: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.15)', borderRadius: 24, paddingVertical: 20, paddingHorizontal: 28, alignItems: 'center', width: '100%', marginBottom: 16 },
  bigScorePremium: { color: 'white', fontSize: 32, fontWeight: '900' },
  bigScoreLabelPremium: { color: 'white', fontSize: 13, fontWeight: '700', marginTop: 4 },
  bigScoreSubPremium: { color: '#666', fontSize: 11, marginTop: 4, textAlign: 'center' },
  superRemainingPill: { marginTop: 12, backgroundColor: 'rgba(46,140,255,0.12)', borderWidth: 1, borderColor: 'rgba(46,140,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
  superRemainingText: { color: '#6ea8ff', fontSize: 11, fontWeight: '700' },
  statsRowPremium: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 22, paddingVertical: 18, width: '100%', marginBottom: 16 },
  statItemPremium: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 4 },
  statNumberPremium: { color: 'white', fontSize: 22, fontWeight: '900' },
  statLabelPremium: { color: '#666', fontSize: 10, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  bioCardPremium: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 18, width: '100%', marginBottom: 12 },
  bioTitlePremium: { color: 'white', fontWeight: '700', fontSize: 14, marginBottom: 8 },
  bioTextPremium: { color: '#999', fontSize: 13, lineHeight: 19 },
  editContainer: { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 20 },
  editTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  editLabel: { color: '#666', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 6 },
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
  backButtonPremium: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: 'white', fontSize: 22, marginTop: -2 },
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
  sendButtonPremium: { backgroundColor: '#ff3b30', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sendButtonTextPremium: { color: 'white', fontWeight: '800', fontSize: 20, marginTop: -2 },
  swipeButtonsRow: { position: 'absolute', bottom: -16, flexDirection: 'row', gap: 14, alignItems: 'center' },
  swipeBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  swipeBtnNo: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' },
  swipeBtnYes: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  swipeBtnUndo: { backgroundColor: 'rgba(255,200,0,0.12)', borderColor: 'rgba(255,200,0,0.25)', width: 48, height: 48, borderRadius: 24 },
  swipeBtnSuper: { backgroundColor: 'rgba(46,140,255,0.18)', borderColor: 'rgba(46,140,255,0.35)', width: 58, height: 58, borderRadius: 29 },
  swipeBtnUndoDisabled: { opacity: 0.25 },
  swipeBtnText: { color: '#ff7a7a', fontSize: 20, fontWeight: '900' },
  swipeBtnTextYes: { color: 'white', fontSize: 20, fontWeight: '900' },
  swipeBtnUndoText: { color: '#ffcc00', fontSize: 18, fontWeight: '900' },
  swipeBtnSuperText: { color: '#2e8cff', fontSize: 22, fontWeight: '900' },
  superCountBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#2e8cff', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#08080a' },
  superCountText: { color: 'white', fontSize: 10, fontWeight: '900' },
  matchOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  matchPopup: { width: '85%', maxWidth: 340, backgroundColor: '#151515', borderRadius: 32, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#ff3b30' },
  matchPopupSuper: { borderColor: '#2e8cff' },
  matchPopupTitle: { color: 'white', fontSize: 30, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  matchPopupSub: { color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 18 },
  matchAvatarsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 28 },
  matchPopupAvatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: '#ff3b30' },
  matchHeart: { fontSize: 30 },
  matchPopupPrimary: { backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 16, paddingHorizontal: 28, width: '100%', alignItems: 'center', marginBottom: 12 },
  matchPopupPrimarySuper: { backgroundColor: '#2e8cff' },
  matchPopupPrimaryText: { color: 'white', fontWeight: '800', fontSize: 14 },
  matchPopupSecondary: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingVertical: 13, width: '100%', alignItems: 'center' },
  matchPopupSecondaryText: { color: '#888', fontWeight: '700', fontSize: 13 },
});
