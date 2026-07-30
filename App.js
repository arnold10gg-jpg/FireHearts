
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Pressable, Animated, PanResponder, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let ImagePicker = null;
try { ImagePicker = require('expo-image-picker'); } catch(e){}

const PROFILES_DATA = [
  { id: 1, name: 'Sofia, 24', city: 'Milano', distance: '1.2km', vibe: ['Avventurosa','Buongustaia','Viaggi'], bio: 'Marketing, aperitivi e viaggi spontanei', longBio: 'Vivo a Milano, lavoro nel marketing moda. Viaggi last-minute e vino naturale.', prompts: [{ q: 'Weekend ideale', a: 'Lago di Como + aperitivo + nessun telefono', icon: '🏔️' }, { q: 'Sono brava a', a: 'Organizzare viaggi impossibili in 24h', icon: '✈️' }], reviews: [{ rating: 5.0 }], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop', online: true, verified: true },
  { id: 2, name: 'Giulia, 22', city: 'Bergamo', distance: '3.4km', vibe: ['Intensa','Natura','Palestra'], bio: 'Psicologia, palestra e tramonti', longBio: 'Studio psicologia a Bergamo.', prompts: [{ q: 'Unpopular opinion', a: 'Palestra e meditazione', icon: '🤫' }], reviews: [{ rating: 4.6 }], photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop', online: true, verified: false },
  { id: 3, name: 'Martina, 26', city: 'Brescia', distance: '6.1km', vibe: ['Chef','Passionale','Buongustaia'], bio: 'Chef privato, cucino io', longBio: 'Chef Lago di Garda.', prompts: [{ q: 'Cucino meglio di', a: 'Tua nonna - sfida accettata?', icon: '👨‍🍳' }], reviews: [{ rating: 5.0 }], photo: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=800&q=80&auto=format&fit=crop', online: false, verified: true },
  { id: 4, name: 'Alice, 23', city: 'Milano', distance: '2.8km', vibe: ['Creativa','Arty','Design'], bio: 'Designer in Brera', longBio: 'Designer a Milano, Brera.', prompts: [{ q: 'Museo preferito', a: 'Fondazione Prada', icon: '🎨' }], reviews: [{ rating: 4.7 }], photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80&auto=format&fit=crop', online: true, verified: true },
  { id: 5, name: 'Elena, 25', city: 'Pavia', distance: '8.3km', vibe: ['Zen','Curiosa','Yoga'], bio: 'Yoga e caffe specialty', longBio: 'Istruttrice yoga a Pavia.', prompts: [{ q: 'Mattina ideale', a: 'Yoga 6am + libro + caffe', icon: '🧘' }], reviews: [{ rating: 4.9 }], photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&auto=format&fit=crop', online: true, verified: true },
  { id: 6, name: 'Chiara, 24', city: 'Milano', distance: '0.9km', vibe: ['Analogica','Vinile','Creativa'], bio: 'Fotografa analogica', longBio: 'Fotografa analogica, camera oscura e vinili.', prompts: [{ q: 'Scatto migliore', a: 'Quello che non ho ancora fatto', icon: '📸' }], reviews: [{ rating: 4.7 }], photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80&auto=format&fit=crop', online: false, verified: false },
];

const QUICK_CITIES = ['Tutti', 'Milano', 'Roma', 'Torino', 'Firenze', 'Napoli', 'Bologna', 'Londra', 'Parigi', 'Barcellona', 'New York', 'Tokyo'];
const ALL_VIBES = ['Tutti', 'Avventurosa','Buongustaia','Viaggi','Intensa','Natura','Palestra','Chef','Passionale','Creativa','Arty','Design','Zen','Curiosa','Yoga','Analogica','Vinile'];
const NEARBY_ENCOUNTERS = [
  { profileId: 1, location: 'Via Brera, Milano', timeAgo: '2h fa', distance: '300m' },
  { profileId: 4, location: 'Navigli, Milano', timeAgo: '5h fa', distance: '450m' },
  { profileId: 6, location: 'Parco Sempione', timeAgo: 'Oggi, 9:12', distance: '1.1km' },
  { profileId: 2, location: 'Stazione Centrale', timeAgo: 'Ieri, 18:30', distance: '800m' },
];

const STORAGE_KEYS = {
  SENT: 'fh_sent', MATCHES: 'fh_matches', SUPER_LIKED: 'fh_superLiked', SWIPE_INDEX: 'fh_swipeIndex',
  FILTER_CITY: 'fh_filterCity', CUSTOM_CITY: 'fh_customCity', FILTER_VIBE: 'fh_filterVibe',
  MY_PROFILE: 'fh_myProfile', ONBOARDING_DONE: 'fh_onboardingDone', NEARBY_SEEN: 'fh_nearbySeen', CHATS: 'fh_chats_v2',
};

const DEFAULT_MY_PROFILE = { 
  name: 'Carl', age: 28, city: 'Torino', bio: 'Fondatore di FireHearts.', longBio: 'Vivo a Torino, amo codice e persone autentiche.',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop', myVibes: ['Founder','Avventuroso'] 
};

function calculateFireScore(p){ const avg = p.reviews ? p.reviews.reduce((s,r)=>s+r.rating,0)/p.reviews.length : 4.6; return Math.min(5, avg+0.15).toFixed(1); }
function getScoreColor(s){ const v=parseFloat(s); if(v>=4.8) return '#00d084'; if(v>=4.5) return '#ffcc00'; return '#ff7a7a'; }

// ICONA PROFESSIONALE CON ANIMAZIONE AL CLICK
function HeartDevilPro({ size = 84, triggerAnim }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const wink = useRef(new Animated.Value(0)).current;
  const clickScale = useRef(new Animated.Value(1)).current;
  const clickRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    try {
      Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1.05, duration: 1100, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true })])).start();
      Animated.loop(Animated.sequence([Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: true }), Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: true })])).start();
      Animated.loop(Animated.sequence([Animated.delay(2500), Animated.timing(wink, { toValue: 1, duration: 70, useNativeDriver: true }), Animated.delay(90), Animated.timing(wink, { toValue: 0, duration: 70, useNativeDriver: true })])).start();
    } catch {}
  }, []);

  useEffect(() => {
    if (triggerAnim && triggerAnim > 0) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(clickScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
          Animated.timing(clickRotate, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(clickScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
          Animated.timing(clickRotate, { toValue: -1, duration: 100, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(clickScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
          Animated.timing(clickRotate, { toValue: 0.5, duration: 120, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(clickScale, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(clickRotate, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [triggerAnim]);

  const glowOp = glow.interpolate({ inputRange: [0,1], outputRange: [0.10,0.28] });
  const rotateDeg = clickRotate.interpolate({ inputRange: [-1,0,1], outputRange: ['-15deg','0deg','15deg'] });

  return (
    <View style={{ width: size+16, height: size+16, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: size*1.18, height: size*1.18, borderRadius: size*0.6, backgroundColor: '#ff3b30', opacity: glowOp }} />
      <View style={{ position: 'absolute', top: 0, left: size*0.20, zIndex: 20, transform: [{ rotate: '-15deg' }] }}><View style={{ width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#e51a1a' }} /></View>
      <View style={{ position: 'absolute', top: 0, right: size*0.20, zIndex: 20, transform: [{ rotate: '15deg' }] }}><View style={{ width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#e51a1a' }} /></View>
      <View style={{ position: 'absolute', top: -2, left: size*0.5 }}><Text style={{ fontSize: size*0.12 }}>🔥</Text></View>
      <Animated.View style={{ width: size, height: size*0.86, transform: [{ scale: Animated.multiply(pulse, clickScale) }, { rotate: rotateDeg }], alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: size, height: size*0.86, borderRadius: size*0.26, backgroundColor: '#1a0808', top: 3, left: 2 }} />
        <View style={{ width: size, height: size*0.86, borderRadius: size*0.24, backgroundColor: '#101010', borderWidth: 1, borderColor: 'rgba(255,59,48,0.25)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <View style={{ position: 'absolute', top: size*0.07, left: size*0.13, width: size*0.26, height: size*0.13, borderRadius: size*0.13, backgroundColor: 'rgba(255,255,255,0.11)', transform: [{ rotate: '-18deg' }] }} />
          <Text style={{ fontSize: size*0.48, marginTop: -1 }}>❤️</Text>
          <View style={{ position: 'absolute', top: '36%', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 9, alignItems: 'center' }}>
              <Animated.View style={{ transform: [{ scaleY: wink.interpolate({ inputRange:[0,1], outputRange:[1,0.08] }) }] }}><View style={{ width: 10, height: 2, borderRadius: 1, backgroundColor: '#000' }} /></Animated.View>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#000' }} /></View>
            </View>
            <Text style={{ color: 'white', fontSize: size*0.10, fontWeight: '900', marginTop: 1 }}>‿</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function FireHeartsArtisticLogo({ onLogoPress, logoAnimTrigger }) {
  const textScale = useRef(new Animated.Value(1)).current;
  const textGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (logoAnimTrigger && logoAnimTrigger > 0) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(textScale, { toValue: 1.2, duration: 180, useNativeDriver: true }),
          Animated.timing(textGlow, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]),
        Animated.timing(textScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(textScale, { toValue: 1.1, duration: 120, useNativeDriver: true }),
          Animated.timing(textGlow, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.timing(textScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [logoAnimTrigger]);

  const glowOpacity = textGlow.interpolate({ inputRange: [0,1], outputRange: [0,0.6] });

  return (
    <TouchableOpacity onPress={onLogoPress} activeOpacity={0.8} style={{ width: '100%', alignItems: 'center', paddingTop: 4, paddingBottom: 6 }}>
      <HeartDevilPro size={78} triggerAnim={logoAnimTrigger} />
      <Animated.View style={{ flexDirection: 'row', marginTop: 4, transform: [{ scale: textScale }] }}>
        <Text style={{ color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -1.2, fontStyle: 'italic' }}>FIRE</Text>
        <Text style={{ color: '#ff3b30', fontSize: 32, fontWeight: '900', letterSpacing: -1.2, fontStyle: 'italic', marginLeft: 2 }}>HEARTS</Text>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', bottom: 0, width: 120, height: 20, backgroundColor: '#ff3b30', opacity: glowOpacity, borderRadius: 10, top: 95 }} />
      <Text style={{ color: '#666', fontSize: 8.5, fontWeight: '700', letterSpacing: 1.8, marginTop: 4, textTransform: 'uppercase' }}>Non e' dating. E' scintilla.</Text>
    </TouchableOpacity>
  );
}

function FaviconSetter() {
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.title = 'FireHearts - Non è dating. È scintilla.';
      }
    } catch {}
  }, []);
  return null;
}

function OnboardingSingle({ onComplete }) {
  const [animTrigger, setAnimTrigger] = useState(0);
  return (
    <View style={styles.onboardingSingle}>
      <View style={styles.onboardingGlow} />
      <FireHeartsArtisticLogo onLogoPress={()=>setAnimTrigger(v=>v+1)} logoAnimTrigger={animTrigger} />
      <View style={{ width: '100%', maxWidth: 340, marginTop: 8 }}>
        <Text style={styles.onboardingBigTitle}>Basta profili finti.{"\n"}Persone reali.</Text>
        <Text style={styles.onboardingBigSub}>Fire Score vero. Voice 15s. Incroci reali.</Text>
      </View>
      <TouchableOpacity style={styles.enterButton} onPress={onComplete}><Text style={styles.enterButtonText}>Entra 🔥</Text></TouchableOpacity>
    </View>
  );
}

function VibeTags({ vibes, small }) {
  if (!vibes) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {vibes.map((v,i)=><View key={i} style={small ? styles.vibeTagSmall : styles.vibeTag}><Text style={small ? styles.vibeTagSmallText : styles.vibeTagText}>#{v}</Text></View>)}
    </View>
  );
}

function FiltersBottomSheet({ visible, onClose, quickCities, allVibes, filterCity, setFilterCity, customCity, setCustomCity, filterVibe, setFilterVibe }) {
  if (!visible) return null;
  return (
    <View style={styles.filtersOverlay}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={styles.filtersSheet}>
        <View style={styles.filtersHandle} />
        <View style={styles.filtersHeader}><Text style={styles.filtersTitle}>Filtri - Qualsiasi città</Text><TouchableOpacity onPress={onClose} style={styles.filtersClose}><Text style={{ color: 'white' }}>✕</Text></TouchableOpacity></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.filterSectionLabel}>CITTÀ - SCRIVI QUALSIASI CITTÀ</Text>
          <TextInput style={styles.cityInput} value={customCity} onChangeText={setCustomCity} placeholder="Tokyo, New York, Torino..." placeholderTextColor="#555" />
          <View style={styles.chipsWrap}>{quickCities.map(c=><TouchableOpacity key={c} style={[styles.chip, filterCity===c && !customCity && styles.chipActive]} onPress={()=>{ setFilterCity(c); setCustomCity(''); }}><Text style={[styles.chipText, filterCity===c && !customCity && styles.chipTextActive]}>{c}</Text></TouchableOpacity>)}</View>
          <Text style={styles.filterSectionLabel}>VIBE</Text>
          <View style={styles.chipsWrap}>{allVibes.map(v=><TouchableOpacity key={v} style={[styles.chip, filterVibe===v && styles.chipActiveVibe]} onPress={()=>setFilterVibe(v)}><Text style={[styles.chipText, filterVibe===v && styles.chipTextActiveVibe]}>{v==='Tutti'?'Tutte':'#'+v}</Text></TouchableOpacity>)}</View>
        </ScrollView>
        <TouchableOpacity style={styles.applyButton} onPress={onClose}><Text style={styles.applyText}>Mostra risultati</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function NearbyCard({ encounter, profile, onLike, onSuperLike }) {
  if (!profile) return null;
  return (
    <View style={styles.nearbyCard}>
      <Image source={{ uri: profile.photo }} style={{ width: 56, height: 56, borderRadius: 28 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: 'white', fontWeight: '800' }}>{profile.name} • {calculateFireScore(profile)}★</Text>
        <Text style={{ color: '#888', fontSize: 12 }}>📍 {encounter.location} • {encounter.timeAgo}</Text>
        <VibeTags vibes={profile.vibe.slice(0,2)} small />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={styles.nearbyBlueBtn} onPress={()=>onSuperLike(profile)}><Text>💙</Text></TouchableOpacity>
        <TouchableOpacity style={styles.nearbyRedBtn} onPress={()=>onLike(profile)}><Text>❤️</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function ChatScreen({ profile, messages, onSend, onBack }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
    setTimeout(()=>scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };
  return (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}><TouchableOpacity onPress={onBack} style={styles.chatBackBtn}><Text style={{ color: 'white' }}>←</Text></TouchableOpacity><Image source={{ uri: profile.photo }} style={styles.chatAvatar} /><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.chatName}>{profile.name}</Text><Text style={styles.chatStatus}>Online • {calculateFireScore(profile)}★</Text></View></View>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {messages.length===0 && <View style={styles.chatEmpty}><Text style={{ color: '#666', textAlign: 'center' }}>Inizia la chat con {profile.name.split(',')[0]} 🔥</Text></View>}
        {messages.map((m,i)=><View key={i} style={[styles.chatBubble, m.from==='me' ? styles.chatBubbleMe : styles.chatBubbleThem]}><Text style={styles.chatBubbleText}>{m.text}</Text><Text style={styles.chatBubbleTime}>{m.time}</Text></View>)}
      </ScrollView>
      <View style={styles.chatInputBar}><TextInput style={styles.chatInput} value={input} onChangeText={setInput} placeholder="Scrivi..." placeholderTextColor="#666" onSubmitEditing={handleSend} /><TouchableOpacity style={styles.chatSendBtn} onPress={handleSend}><Text style={{ color: 'white', fontWeight: '800' }}>Invia</Text></TouchableOpacity></View>
    </View>
  );
}

function HomeDashboard({ onGoToTab }) {
  return (
    <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <View style={styles.statsHero}>
        <View style={styles.statHeroItem}><Text style={styles.statHeroNumber}>{PROFILES_DATA.length}</Text><Text style={styles.statHeroLabel}>vicino a te</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statHeroItem}><Text style={[styles.statHeroNumber,{color:'#ff3b30'}]}>3</Text><Text style={styles.statHeroLabel}>like</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statHeroItem}><Text style={[styles.statHeroNumber,{color:'#00d084'}]}>4</Text><Text style={styles.statHeroLabel}>incroci</Text></View>
      </View>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>🔥 Per te</Text><TouchableOpacity onPress={()=>onGoToTab('scopri')}><Text style={styles.sectionAction}>Vedi tutti →</Text></TouchableOpacity></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginTop: 12 }}>{PROFILES_DATA.slice(0,4).map(p=><TouchableOpacity key={p.id} style={styles.hCard} onPress={()=>onGoToTab('scopri')}><Image source={{uri:p.photo}} style={styles.hCardImage} /><View style={styles.hCardGrad} /><Text style={styles.hCardName}>{p.name.split(',')[0]}</Text></TouchableOpacity>)}</ScrollView>
      </View>
      <TouchableOpacity style={styles.ctaScopri} onPress={()=>onGoToTab('scopri')}><Text style={styles.ctaScopriText}>Inizia a swipare 🔥</Text></TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  const [sent,setSent]=useState([]); const [matches,setMatches]=useState([]); const [superLiked,setSuperLiked]=useState([]); const [tab,setTab]=useState('home'); const [filterCity,setFilterCity]=useState('Tutti'); const [customCity,setCustomCity]=useState(''); const [filterVibe,setFilterVibe]=useState('Tutti'); const [swipeIndex,setSwipeIndex]=useState(0); const [loaded,setLoaded]=useState(false); const [onboardingDone,setOnboardingDone]=useState(false); const [showFilters,setShowFilters]=useState(false); const [boostActive,setBoostActive]=useState(false); const [boostExpiry,setBoostExpiry]=useState(null); const [boostCount,setBoostCount]=useState(3); const [myProfile,setMyProfile]=useState(DEFAULT_MY_PROFILE); const [isEditing,setIsEditing]=useState(false); const [editName,setEditName]=useState(''); const [editCity,setEditCity]=useState(''); const [editBio,setEditBio]=useState(''); const [editLongBio,setEditLongBio]=useState(''); const [editPhoto,setEditPhoto]=useState(''); const [nowTick,setNowTick]=useState(Date.now()); const [flippedId,setFlippedId]=useState(null); const [nearbySeen,setNearbySeen]=useState([]); const [chats,setChats]=useState({}); const [activeChat,setActiveChat]=useState(null); const [logoAnimTrigger,setLogoAnimTrigger]=useState(0);
  const swipePos=useRef(new Animated.ValueXY({x:0,y:0})).current;
  const flipAnim=useRef(new Animated.Value(0)).current;

  useEffect(()=>{ const i=setInterval(()=>setNowTick(Date.now()),1000); return()=>clearInterval(i); },[]);
  useEffect(()=>{ (async()=>{ try{
    const s=await AsyncStorage.getItem(STORAGE_KEYS.SENT); const m=await AsyncStorage.getItem(STORAGE_KEYS.MATCHES); const sl=await AsyncStorage.getItem(STORAGE_KEYS.SUPER_LIKED); const si=await AsyncStorage.getItem(STORAGE_KEYS.SWIPE_INDEX); const o=await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE); const fc=await AsyncStorage.getItem(STORAGE_KEYS.FILTER_CITY); const cc=await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_CITY); const fv=await AsyncStorage.getItem(STORAGE_KEYS.FILTER_VIBE); const mp=await AsyncStorage.getItem(STORAGE_KEYS.MY_PROFILE); const ns=await AsyncStorage.getItem(STORAGE_KEYS.NEARBY_SEEN); const ch=await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
    if(s) setSent(JSON.parse(s)); if(m) setMatches(JSON.parse(m)); if(sl) setSuperLiked(JSON.parse(sl)); if(si) setSwipeIndex(JSON.parse(si)); if(o) setOnboardingDone(JSON.parse(o)); if(fc) setFilterCity(fc); if(cc) setCustomCity(cc); if(fv) setFilterVibe(fv); if(mp) setMyProfile(JSON.parse(mp)); if(ns) setNearbySeen(JSON.parse(ns)); if(ch) setChats(JSON.parse(ch));
  }catch(e){} setLoaded(true); })(); },[]);

  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.SENT, JSON.stringify(sent)); },[sent,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches)); },[matches,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.SUPER_LIKED, JSON.stringify(superLiked)); },[superLiked,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.SWIPE_INDEX, JSON.stringify(swipeIndex)); },[swipeIndex,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, JSON.stringify(onboardingDone)); },[onboardingDone,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.FILTER_CITY, filterCity); },[filterCity,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_CITY, customCity); },[customCity,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.FILTER_VIBE, filterVibe); },[filterVibe,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.NEARBY_SEEN, JSON.stringify(nearbySeen)); },[nearbySeen,loaded]);
  useEffect(()=>{ if(loaded) AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats)); },[chats,loaded]);

  const pickImage = async () => {
    try {
      if (!ImagePicker) { Alert.alert('Info', 'npx expo install expo-image-picker'); return; }
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permesso negato'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets && result.assets[0]) setEditPhoto(result.assets[0].uri);
    } catch (e) { Alert.alert('Errore'); }
  };

  // RESET FUNZIONANTE - pulisce tutto
  const handleReset = async () => {
    try {
      setFilterCity('Tutti'); setCustomCity(''); setFilterVibe('Tutti'); setSwipeIndex(0); setSent([]); setMatches([]); setSuperLiked([]); setNearbySeen([]); setFlippedId(null); swipePos.setValue({x:0,y:0}); flipAnim.setValue(0);
      await AsyncStorage.multiRemove([STORAGE_KEYS.SENT, STORAGE_KEYS.MATCHES, STORAGE_KEYS.SUPER_LIKED, STORAGE_KEYS.SWIPE_INDEX, STORAGE_KEYS.FILTER_CITY, STORAGE_KEYS.CUSTOM_CITY, STORAGE_KEYS.FILTER_VIBE, STORAGE_KEYS.NEARBY_SEEN]);
      Alert.alert('Reset', 'Tutto azzerato! Filtri, swipe, inviate e match resettati 🔄');
    } catch(e){ console.log(e); }
  };

  let filtered = PROFILES_DATA;
  const activeCity = customCity.trim() || filterCity;
  if(activeCity && activeCity!=='Tutti') filtered = filtered.filter(p=> p.city.toLowerCase().includes(activeCity.toLowerCase()) || activeCity.toLowerCase().includes(p.city.toLowerCase()));
  if(filterVibe!=='Tutti') filtered = filtered.filter(p=>p.vibe.includes(filterVibe));

  const topProfile = filtered[swipeIndex % (filtered.length || 1)];
  const nextProfile = filtered[(swipeIndex+1) % (filtered.length || 1)];
  const isFlipped = flippedId === topProfile?.id;

  const goNext = () => { try { swipePos.setValue({x:0,y:0}); setSwipeIndex(s=>s+1); setFlippedId(null); flipAnim.setValue(0); } catch {} };
  const sendLike = (p) => { if(!p) return; if(!sent.includes(p.id)){ setSent([...sent,p.id]); if(Math.random()>0.35) setMatches(m=>[...m,p.id]); } };
  const sendSuperLike = (p) => { if(!p) return; if(!superLiked.includes(p.id)) setSuperLiked([...superLiked,p.id]); if(!sent.includes(p.id)){ setSent([...sent,p.id]); setMatches(m=>[...m,p.id]); } };
  const handleNearbyLike = (p) => { sendLike(p); setNearbySeen(s=>[...s,p.id]); };
  const handleNearbySuperLike = (p) => { sendSuperLike(p); setNearbySeen(s=>[...s,p.id]); };
  const handleFlip = (id) => {
    if(flippedId===id){ Animated.timing(flipAnim,{ toValue: 0, duration: 300, useNativeDriver: true }).start(()=>setFlippedId(null)); }
    else { setFlippedId(id); Animated.timing(flipAnim,{ toValue: 1, duration: 300, useNativeDriver: true }).start(); }
  };
  const handleBoost = () => { if(boostActive) return; if(boostCount<=0) return; const exp=Date.now()+30*60*1000; setBoostActive(true); setBoostExpiry(exp); setBoostCount(c=>c-1); };
  const startEditing = () => { setEditName(myProfile.name); setEditCity(myProfile.city); setEditBio(myProfile.bio); setEditLongBio(myProfile.longBio || ''); setEditPhoto(myProfile.photo); setIsEditing(true); };
  const saveEditing = async () => { 
    let finalPhoto = editPhoto || myProfile.photo;
    if (finalPhoto.includes('C:\\') || finalPhoto.includes('C:/') || finalPhoto.includes('Users\\')) { Alert.alert('Errore percorso', 'Usa galleria o link https://'); return; }
    const upd={...myProfile, name: editName, city: editCity, bio: editBio, longBio: editLongBio, photo: finalPhoto}; 
    setMyProfile(upd); setIsEditing(false); await AsyncStorage.setItem(STORAGE_KEYS.MY_PROFILE, JSON.stringify(upd)); 
  };
  const handleSendMessage = (profileId, text) => {
    const newMsg = { id: Date.now(), text, from: 'me', time: new Date().toLocaleTimeString().slice(0,5) };
    setChats(prev=>({ ...prev, [profileId]: [...(prev[profileId]||[]), newMsg] }));
    setTimeout(()=>{ const replies = ["Ahah vero! 😏","Dimmi di più 🔥","Ci sta, quando ci vediamo?"]; const reply = { id: Date.now()+1, text: replies[Math.floor(Math.random()*replies.length)], from: 'them', time: new Date().toLocaleTimeString().slice(0,5) }; setChats(prev=>({ ...prev, [profileId]: [...(prev[profileId]||[]), reply] })); }, 1200);
  };

  const panResponder = useRef(PanResponder.create({ 
    onStartShouldSetPanResponder:()=>true, 
    onPanResponderMove:(_,g)=>{ try { if(!isFlipped) swipePos.setValue({x:g.dx,y:g.dy*0.2}); } catch {} }, 
    onPanResponderRelease:(_,g)=>{ try { 
      if(isFlipped) return; 
      if(g.dx>110){ Animated.timing(swipePos,{toValue:{x:500,y:-30},duration:220,useNativeDriver:true}).start(()=>{ if(topProfile) sendLike(topProfile); goNext(); }); } 
      else if(g.dx<-110){ Animated.timing(swipePos,{toValue:{x:-500,y:-30},duration:220,useNativeDriver:true}).start(()=>goNext()); } 
      else Animated.spring(swipePos,{toValue:{x:0,y:0},friction:6,useNativeDriver:true}).start(); 
    } catch { goNext(); } } 
  })).current;
  const rotate = swipePos.x.interpolate({ inputRange:[-200,0,200], outputRange:['-12deg','0deg','12deg'], extrapolate:'clamp' });
  const flipBack = flipAnim.interpolate({ inputRange:[0,1], outputRange:['180deg','360deg'] });

  const inviateProfiles = PROFILES_DATA.filter(p=>sent.includes(p.id) && !matches.includes(p.id));
  const matchProfiles = PROFILES_DATA.filter(p=>matches.includes(p.id));

  if(!loaded) return (<View style={styles.container}><FaviconSetter /><HeartDevilPro size={88} /><Text style={{ color:'white', marginTop: 14, fontWeight: '900' }}>FireHearts</Text></View>);
  if(!onboardingDone) return (<View style={styles.container}><FaviconSetter /><OnboardingSingle onComplete={()=>setOnboardingDone(true)} /></View>);
  if(activeChat){
    const profile = PROFILES_DATA.find(p=>p.id===activeChat);
    const msgs = chats[activeChat] || [];
    if(!profile) { setActiveChat(null); return null; }
    return (<View style={styles.container}><FaviconSetter /><ChatScreen profile={profile} messages={msgs} onSend={(t)=>handleSendMessage(activeChat, t)} onBack={()=>setActiveChat(null)} /></View>);
  }

  return (
    <View style={styles.container}>
      <FaviconSetter />
      <View style={styles.glowTop} />
      <View style={styles.headerBig}>
        <FireHeartsArtisticLogo onLogoPress={()=>setLogoAnimTrigger(v=>v+1)} logoAnimTrigger={logoAnimTrigger} />
        <View style={{ position: 'absolute', right: 16, top: 24 }}><TouchableOpacity style={styles.headerIconBtn} onPress={()=>setShowFilters(true)}><Text>⚙️</Text>{((filterCity!=='Tutti'&&filterCity!=='')||customCity||filterVibe!=='Tutti')&&<View style={styles.dotActive} />}</TouchableOpacity></View>
      </View>
      <View style={styles.counterPill}><View style={styles.counterDot} /><Text style={styles.counterText}>{filtered.length} profili • {matches.length} Match • 💙{superLiked.length}</Text><TouchableOpacity onPress={handleReset} style={styles.resetPill}><Text style={styles.resetText}>Reset ↺</Text></TouchableOpacity></View>

      {tab==='home' && <HomeDashboard onGoToTab={setTab} />}

      {tab==='scopri' && (
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
          <View style={styles.filterPillRow}><TouchableOpacity style={styles.filterPillMain} onPress={()=>setShowFilters(true)}><Text style={styles.filterPillText}>⚙️ Filtri</Text><Text style={styles.filterPillSub}>{customCity || filterCity!=='Tutti'? (customCity || filterCity) : ''}{filterVibe!=='Tutti'?' • #'+filterVibe:''}</Text></TouchableOpacity></View>
          {topProfile && filtered.length>0 ? (
            <View style={styles.deck}>
              {nextProfile && filtered.length>1 && (<View style={[styles.card, styles.cardBehind]}><Image source={{ uri: nextProfile.photo }} style={styles.cardImage} /></View>)}
              {isFlipped ? (
                <Pressable style={styles.flipContainer} onPress={()=>handleFlip(topProfile.id)}>
                  <Animated.View style={[styles.flipCard, { transform: [{ perspective: 1000 }, { rotateY: flipBack }] }]}>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.cardBack} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                      <View style={styles.cardBackHeader}><Image source={{ uri: topProfile.photo }} style={styles.cardBackAvatar} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.cardBackName}>{topProfile.name}</Text><Text style={[styles.cardBackScore, { color: getScoreColor(calculateFireScore(topProfile)) }]}>{calculateFireScore(topProfile)} ★</Text></View><View style={styles.closeFlip}><Text style={styles.closeFlipText}>✕</Text></View></View>
                      <Text style={styles.cardBackBioTitle}>Bio</Text><Text style={styles.cardBackBio}>{topProfile.longBio}</Text>
                      <VibeTags vibes={topProfile.vibe} />
                      <Text style={styles.cardBackBioTitle}>Prompts</Text>{topProfile.prompts.map((pr,idx)=>(<View key={idx} style={styles.promptCard}><Text style={styles.promptCardQ}>{pr.icon} {pr.q}</Text><Text style={styles.promptCardA}>{pr.a}</Text></View>))}
                      <View style={styles.backButtonFlip}><Text style={styles.backButtonFlipText}>Tocca per tornare ↩️</Text></View>
                    </ScrollView>
                  </Animated.View>
                </Pressable>
              ) : (
                <Pressable onPress={()=>handleFlip(topProfile.id)} style={{ width: '100%', alignItems: 'center' }}>
                  <Animated.View {...panResponder.panHandlers} style={[styles.card, styles.cardTop, { transform: [{ translateX: swipePos.x }, { translateY: swipePos.y }, { rotate }] }]}>
                    <Image source={{ uri: topProfile.photo }} style={styles.cardImage} />
                    <View style={styles.cardTopBar}><View style={[styles.scoreBadge,{borderColor:getScoreColor(calculateFireScore(topProfile))}]}><Text style={[styles.scoreText,{color:getScoreColor(calculateFireScore(topProfile))}]}>{calculateFireScore(topProfile)} ★</Text></View>{topProfile.verified&&<View style={styles.verifiedBadge}><Text style={{color:'white',fontSize:11,fontWeight:'800'}}>Verificato</Text></View>}</View>
                    <View style={styles.cardContentNoBand}><Text style={styles.cardName}>{topProfile.name}</Text><Text style={styles.cardCity}>📍 {topProfile.city} • {topProfile.distance}</Text><VibeTags vibes={topProfile.vibe} small /><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 6 }}>Tap per bio completa →</Text></View>
                  </Animated.View>
                </Pressable>
              )}
              <View style={styles.swipeRow}>
                <TouchableOpacity style={[styles.swipeBtn,styles.swipeNo]} onPress={()=>{ Animated.timing(swipePos,{toValue:{x:-500,y:-30},duration:200,useNativeDriver:true}).start(()=>goNext()); }}><Text style={{fontSize:20}}>✕</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.swipeBtn,styles.swipeSuper]} onPress={()=>{ if(topProfile) sendSuperLike(topProfile); goNext(); }}><Text style={{fontSize:18}}>💙</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.swipeBtn,styles.swipeYes]} onPress={()=>{ Animated.timing(swipePos,{toValue:{x:500,y:-30},duration:200,useNativeDriver:true}).start(()=>{ sendLike(topProfile); goNext(); }); }}><Text style={{fontSize:20}}>❤️</Text></TouchableOpacity>
              </View>
            </View>
          ) : (<View style={styles.emptyBox}><Text style={{color:'white'}}>Finito! Reset filtri</Text><TouchableOpacity onPress={handleReset} style={{marginTop:12,backgroundColor:'#ff3b30',paddingHorizontal:16,paddingVertical:8,borderRadius:100}}><Text style={{color:'white',fontWeight:'800'}}>Reset completo</Text></TouchableOpacity></View>)}
        </ScrollView>
      )}

      {tab==='vicino' && (
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View style={styles.mapBig}><Text style={{ color: 'white', fontWeight: '900' }}>📍 Vicino a te • {NEARBY_ENCOUNTERS.length} incroci reali</Text><Text style={{ color: '#666', fontSize: 12, marginTop: 6 }}>❤️ → inviate, 💙 → super like</Text></View>
          {NEARBY_ENCOUNTERS.filter(enc=>!nearbySeen.includes(enc.profileId)).map(enc=>{ const prof=PROFILES_DATA.find(p=>p.id===enc.profileId); if(!prof) return null; return (<NearbyCard key={enc.profileId} encounter={enc} profile={prof} onLike={handleNearbyLike} onSuperLike={handleNearbySuperLike} />); })}
          {NEARBY_ENCOUNTERS.filter(enc=>!nearbySeen.includes(enc.profileId)).length===0 && <View style={styles.emptyBox}><Text style={{color:'white',fontWeight:'800'}}>Hai visto tutti oggi 🔍</Text><TouchableOpacity onPress={handleReset} style={{marginTop:10,backgroundColor:'#ff3b30',paddingHorizontal:12,paddingVertical:6,borderRadius:100}}><Text style={{color:'white',fontSize:12,fontWeight:'700'}}>Reset vicino</Text></TouchableOpacity></View>}
        </ScrollView>
      )}

      {tab==='inviate' && (
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>INVIATE ({inviateProfiles.length})</Text>
          {inviateProfiles.length===0 ? <View style={styles.emptyBox}><Text style={{color:'white',fontWeight:'800'}}>Nessuna scintilla</Text></View> : inviateProfiles.map(p=><View key={p.id} style={styles.inviateCard}><Image source={{uri:p.photo}} style={{width:48,height:48,borderRadius:24}} /><View style={{flex:1,marginLeft:12}}><Text style={{color:'white',fontWeight:'800'}}>{p.name}</Text></View></View>)}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>SUPER LIKE 💙 ({superLiked.length})</Text>
          {PROFILES_DATA.filter(p=>superLiked.includes(p.id)).map(p=><View key={p.id} style={[styles.inviateCard,{borderColor:'#2e8cff'}]}><Image source={{uri:p.photo}} style={{width:48,height:48,borderRadius:24}} /><View style={{flex:1,marginLeft:12}}><Text style={{color:'white',fontWeight:'800'}}>{p.name} 💙</Text></View></View>)}
          {(inviateProfiles.length>0 || superLiked.length>0) && <TouchableOpacity onPress={handleReset} style={{marginTop:20,backgroundColor:'rgba(255,255,255,0.06)',paddingVertical:12,borderRadius:100,alignItems:'center'}}><Text style={{color:'#888',fontWeight:'700'}}>Reset tutto ↺</Text></TouchableOpacity>}
        </ScrollView>
      )}

      {tab==='match' && (
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>MATCH ({matchProfiles.length}) - TAP PER CHAT</Text>
          {matchProfiles.length===0 ? <View style={styles.emptyBox}><Text style={{color:'white',fontWeight:'800'}}>Nessun match ancora</Text><TouchableOpacity onPress={handleReset} style={{marginTop:10,backgroundColor:'#ff3b30',paddingHorizontal:12,paddingVertical:6,borderRadius:100}}><Text style={{color:'white',fontSize:12}}>Reset</Text></TouchableOpacity></View> : matchProfiles.map(p=>{ const msgs = chats[p.id]||[]; return (<TouchableOpacity key={p.id} style={styles.matchCard} onPress={()=>setActiveChat(p.id)}><Image source={{uri:p.photo}} style={{width:56,height:56,borderRadius:28}} /><View style={{flex:1,marginLeft:12}}><Text style={{color:'white',fontWeight:'800'}}>{p.name} • {calculateFireScore(p)}★</Text><Text style={{color:'#888',fontSize:12}} numberOfLines={1}>{msgs.length>0 ? msgs[msgs.length-1].text : 'Tocca per chattare →'}</Text></View><View style={{backgroundColor:'#ff3b30',paddingHorizontal:14,paddingVertical:8,borderRadius:100}}><Text style={{color:'white',fontWeight:'800',fontSize:12}}>Chat</Text></View></TouchableOpacity>); })}
        </ScrollView>
      )}

      {tab==='profilo' && (
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <Text style={styles.editTitle}>Modifica profilo</Text>
              <Text style={styles.editLabel}>Nome</Text><TextInput style={styles.editInput} value={editName} onChangeText={setEditName} />
              <Text style={styles.editLabel}>Città - qualsiasi</Text><TextInput style={styles.editInput} value={editCity} onChangeText={setEditCity} placeholder="Tokyo, Torino..." placeholderTextColor="#555" />
              <Text style={styles.editLabel}>Bio</Text><TextInput style={styles.editInput} value={editBio} onChangeText={setEditBio} />
              <Text style={styles.editLabel}>Foto profilo</Text><TouchableOpacity style={styles.pickPhotoBtn} onPress={pickImage}><Text style={styles.pickPhotoText}>📸 Scegli dalla galleria</Text></TouchableOpacity>
              <TextInput style={[styles.editInput,{marginTop:8}]} value={editPhoto} onChangeText={setEditPhoto} placeholder="https://..." placeholderTextColor="#555" />
              {editPhoto ? <Image source={{ uri: editPhoto }} style={{ width: 140, height: 140, borderRadius: 70, marginTop: 12, alignSelf: 'center', borderWidth: 2, borderColor: '#ff3b30' }} /> : null}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}><TouchableOpacity style={styles.editCancel} onPress={()=>setIsEditing(false)}><Text style={styles.editCancelText}>Annulla</Text></TouchableOpacity><TouchableOpacity style={styles.editSave} onPress={saveEditing}><Text style={styles.editSaveText}>Salva</Text></TouchableOpacity></View>
            </View>
          ) : (
            <>
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <View style={styles.profileAvatarWrapper}><View style={styles.profileAvatarRing} /><Image source={{ uri: myProfile.photo }} style={styles.profileAvatar} /></View>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', marginTop: 14 }}>{myProfile.name}</Text>
                <Text style={{ color: '#ff3b30', fontSize: 12, marginTop: 2 }}>{myProfile.city}</Text>
                <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6, textAlign: 'center' }}>{myProfile.bio}</Text>
                <TouchableOpacity style={styles.editProfileButton} onPress={startEditing}><Text style={styles.editProfileButtonText}>Modifica foto e bio</Text></TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                  <View style={styles.profileStat}><Text style={styles.profileStatNum}>{sent.length}</Text><Text style={styles.profileStatLabel}>Inviate</Text></View>
                  <View style={styles.profileStat}><Text style={styles.profileStatNum}>{matches.length}</Text><Text style={styles.profileStatLabel}>Match</Text></View>
                  <View style={styles.profileStat}><Text style={styles.profileStatNum}>{superLiked.length}</Text><Text style={styles.profileStatLabel}>Super</Text></View>
                </View>
              </View>
              <TouchableOpacity style={[styles.boostCard, boostActive && styles.boostCardActive]} onPress={handleBoost}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={styles.boostCardIcon}><Text>🚀</Text></View><View><Text style={styles.boostCardTitle}>{boostActive ? 'BOOST ATTIVO' : 'BOOST'}</Text><Text style={styles.boostCardSub}>{boostActive && boostExpiry ? `Scade tra ${Math.max(0, Math.floor((boostExpiry - nowTick)/60000))}m` : `${boostCount} disponibili`}</Text></View></View><View style={[styles.boostCardCta, boostActive && styles.boostCardCtaActive]}><Text style={styles.boostCardCtaText}>{boostActive ? 'Attivo' : 'Attiva'}</Text></View></View></TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 20, backgroundColor: 'rgba(255,59,48,0.12)', paddingVertical: 14, borderRadius: 100, alignItems: 'center' }} onPress={handleReset}><Text style={{ color: '#ff3b30', fontWeight: '800' }}>Reset completo app ↺</Text></TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      <FiltersBottomSheet visible={showFilters} onClose={()=>setShowFilters(false)} quickCities={QUICK_CITIES} allVibes={ALL_VIBES} filterCity={filterCity} setFilterCity={setFilterCity} customCity={customCity} setCustomCity={setCustomCity} filterVibe={filterVibe} setFilterVibe={setFilterVibe} />

      <View style={styles.bottomBarTransparent}>
        <TouchableOpacity style={[styles.tabItem, tab==='home'&&styles.tabActive]} onPress={()=>setTab('home')}><Text style={styles.tabIcon}>🏠</Text><Text style={[styles.tabText, tab==='home'&&styles.tabTextActive]}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab==='scopri'&&styles.tabActive]} onPress={()=>setTab('scopri')}><Text style={styles.tabIcon}>🔥</Text><Text style={[styles.tabText, tab==='scopri'&&styles.tabTextActive]}>Scopri</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab==='vicino'&&styles.tabActive]} onPress={()=>setTab('vicino')}><Text style={styles.tabIcon}>📍</Text><Text style={[styles.tabText, tab==='vicino'&&styles.tabTextActive]}>Vicino</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab==='inviate'&&styles.tabActive]} onPress={()=>setTab('inviate')}><Text style={styles.tabIcon}>💌</Text><Text style={[styles.tabText, tab==='inviate'&&styles.tabTextActive]}>Inviate</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab==='match'&&styles.tabActive]} onPress={()=>setTab('match')}><Text style={styles.tabIcon}>❤️</Text><Text style={[styles.tabText, tab==='match'&&styles.tabTextActive]}>Match</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, tab==='profilo'&&styles.tabActive]} onPress={()=>setTab('profilo')}><Text style={styles.tabIcon}>👤</Text><Text style={[styles.tabText, tab==='profilo'&&styles.tabTextActive]}>Profilo</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080a', alignItems: 'center' },
  glowTop: { position: 'absolute', top: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff3b30', opacity: 0.10, borderRadius: 200 },
  headerBig: { width: '100%', alignItems: 'center', paddingTop: 50, paddingBottom: 12, backgroundColor: 'rgba(8,8,10,0.96)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  dotActive: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff3b30' },
  counterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, gap: 8, marginTop: 10, marginBottom: 10 },
  counterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00d084' },
  counterText: { color: '#aaa', fontSize: 10, fontWeight: '600' },
  resetPill: { marginLeft: 8, backgroundColor: 'rgba(255,59,48,0.20)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' },
  resetText: { color: '#ff3b30', fontSize: 11, fontWeight: '900' },
  onboardingSingle: { flex: 1, width: '100%', backgroundColor: '#08080a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  onboardingGlow: { position: 'absolute', top: -100, left: -50, right: -50, height: 400, backgroundColor: '#ff3b30', opacity: 0.12, borderRadius: 200 },
  onboardingBigTitle: { color: 'white', fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 26, fontStyle: 'italic' },
  onboardingBigSub: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  enterButton: { backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 16, paddingHorizontal: 32, width: '100%', maxWidth: 340, alignItems: 'center', marginTop: 24 },
  enterButtonText: { color: 'white', fontWeight: '900', fontSize: 15 },
  statsHero: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingVertical: 16, width: '100%', maxWidth: 380, alignSelf: 'center', marginBottom: 16 },
  statHeroItem: { flex: 1, alignItems: 'center' },
  statHeroNumber: { color: 'white', fontSize: 20, fontWeight: '900' },
  statHeroLabel: { color: '#666', fontSize: 10, marginTop: 3, textTransform: 'uppercase', fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  sectionCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 16, width: '100%', maxWidth: 380, alignSelf: 'center', marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '900' },
  sectionAction: { color: '#ff3b30', fontSize: 12, fontWeight: '700' },
  hCard: { width: 110, height: 140, borderRadius: 16, overflow: 'hidden', backgroundColor: '#151515' },
  hCardImage: { width: '100%', height: '100%' },
  hCardGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.5)' },
  hCardName: { position: 'absolute', bottom: 6, left: 8, color: 'white', fontSize: 12, fontWeight: '800' },
  ctaScopri: { backgroundColor: '#ff3b30', borderRadius: 20, paddingVertical: 16, width: '100%', maxWidth: 380, alignSelf: 'center', alignItems: 'center', marginTop: 8 },
  ctaScopriText: { color: 'white', fontSize: 16, fontWeight: '900' },
  filterPillRow: { width: '100%', maxWidth: 380, alignSelf: 'center', paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row' },
  filterPillMain: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 100, paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterPillText: { color: 'white', fontSize: 13, fontWeight: '800' },
  filterPillSub: { color: '#888', fontSize: 11 },
  deck: { width: '100%', maxWidth: 380, height: 560, alignItems: 'center', alignSelf: 'center' },
  card: { width: 340, height: 460, borderRadius: 28, overflow: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardBehind: { position: 'absolute', top: 12, transform: [{ scale: 0.94 }], opacity: 0.5 },
  cardTop: { zIndex: 10 },
  cardImage: { width: '100%', height: '100%' },
  cardTopBar: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' },
  scoreBadge: { backgroundColor: 'rgba(20,20,20,0.88)', borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  scoreText: { fontSize: 12, fontWeight: '800' },
  verifiedBadge: { backgroundColor: '#2e8cff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  cardContentNoBand: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'transparent' },
  cardName: { color: 'white', fontSize: 22, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  cardCity: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  swipeRow: { flexDirection: 'row', gap: 16, marginTop: 16, backgroundColor: 'rgba(8,8,10,0.85)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  swipeBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  swipeNo: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' },
  swipeSuper: { backgroundColor: 'rgba(46,140,255,0.12)', borderColor: 'rgba(46,140,255,0.25)' },
  swipeYes: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  emptyBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 30, alignItems: 'center', marginTop: 40, width: '100%', maxWidth: 340, alignSelf: 'center' },
  nearbyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 14, marginBottom: 10, width: '100%', maxWidth: 380, alignSelf: 'center' },
  nearbyBlueBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(46,140,255,0.12)', borderWidth: 1, borderColor: 'rgba(46,140,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  nearbyRedBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.25)', alignItems: 'center', justifyContent: 'center' },
  inviateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, marginBottom: 8, width: '100%', maxWidth: 380, alignSelf: 'center' },
  matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.08)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.12)', borderRadius: 20, padding: 14, marginBottom: 10, width: '100%', maxWidth: 380, alignSelf: 'center' },
  mapBig: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, width: '100%', maxWidth: 380, alignSelf: 'center', marginBottom: 12 },
  sectionLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  filtersOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 300, justifyContent: 'flex-end' },
  filtersSheet: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: '#111113', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '80%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filtersHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  filtersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filtersTitle: { color: 'white', fontSize: 16, fontWeight: '900' },
  filtersClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  filterSectionLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 16, marginBottom: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100 },
  chipActive: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  chipActiveVibe: { backgroundColor: '#ffcc00', borderColor: '#ffcc00' },
  chipText: { color: '#999', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: 'white', fontWeight: '800' },
  chipTextActiveVibe: { color: 'black', fontWeight: '800' },
  cityInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: 'white', marginTop: 8 },
  applyButton: { backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  applyText: { color: 'white', fontWeight: '800', fontSize: 14 },
  vibeTag: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  vibeTagText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  vibeTagSmall: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  vibeTagSmallText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
  flipContainer: { width: 340, height: 460 },
  flipCard: { width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', backgroundColor: '#151515', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', position: 'absolute' },
  cardBack: { padding: 16, paddingBottom: 30 },
  cardBackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardBackAvatar: { width: 50, height: 50, borderRadius: 25 },
  cardBackName: { color: 'white', fontSize: 16, fontWeight: '900' },
  cardBackScore: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  closeFlip: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeFlipText: { color: 'white', fontWeight: '900' },
  cardBackBioTitle: { color: '#666', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  cardBackBio: { color: '#ccc', fontSize: 13, lineHeight: 18 },
  promptCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 12, marginBottom: 8 },
  promptCardQ: { color: '#888', fontSize: 11, fontWeight: '700' },
  promptCardA: { color: 'white', fontSize: 13, marginTop: 4, lineHeight: 18 },
  backButtonFlip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  backButtonFlipText: { color: '#888', fontSize: 12, fontWeight: '700' },
  profileAvatarWrapper: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  profileAvatarRing: { position: 'absolute', width: 104, height: 104, borderRadius: 52, borderWidth: 2, borderColor: 'rgba(255,59,48,0.3)' },
  profileAvatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#ff3b30' },
  editProfileButton: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, marginTop: 10 },
  editProfileButtonText: { color: 'white', fontSize: 12, fontWeight: '700' },
  profileStat: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16 },
  profileStatNum: { color: 'white', fontSize: 16, fontWeight: '900' },
  profileStatLabel: { color: '#666', fontSize: 9, marginTop: 2, textTransform: 'uppercase' },
  bigScoreBox: { backgroundColor: 'rgba(255,59,48,0.08)', borderWidth: 1, borderRadius: 20, padding: 16, width: '100%', maxWidth: 380, alignSelf: 'center', marginTop: 20, alignItems: 'center' },
  bigScore: { fontSize: 28, fontWeight: '900' },
  bigScoreLabel: { color: '#ff7a7a', fontSize: 11, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },
  bigScoreSub: { color: '#888', fontSize: 11, marginTop: 6, textAlign: 'center' },
  boostCard: { backgroundColor: 'rgba(255,122,46,0.08)', borderWidth: 1, borderColor: 'rgba(255,122,46,0.15)', borderRadius: 20, padding: 14, width: '100%', maxWidth: 380, alignSelf: 'center', marginTop: 12 },
  boostCardActive: { borderColor: '#ff7a2e', backgroundColor: 'rgba(255,122,46,0.15)' },
  boostCardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,46,0.15)', alignItems: 'center', justifyContent: 'center' },
  boostCardTitle: { color: 'white', fontSize: 13, fontWeight: '800' },
  boostCardSub: { color: '#888', fontSize: 11, marginTop: 2 },
  boostCardCta: { backgroundColor: '#ff7a2e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  boostCardCtaActive: { backgroundColor: '#00d084' },
  boostCardCtaText: { color: 'white', fontSize: 11, fontWeight: '800' },
  editContainer: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, width: '100%', maxWidth: 380, alignSelf: 'center', marginTop: 20 },
  editTitle: { color: 'white', fontSize: 16, fontWeight: '900', marginBottom: 16 },
  editLabel: { color: '#888', fontSize: 11, fontWeight: '700', marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  editInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: 'white' },
  editCancel: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 14, borderRadius: 100, alignItems: 'center' },
  editCancelText: { color: '#888', fontWeight: '700' },
  editSave: { flex: 1, backgroundColor: '#ff3b30', paddingVertical: 14, borderRadius: 100, alignItems: 'center' },
  editSaveText: { color: 'white', fontWeight: '800' },
  pickPhotoBtn: { backgroundColor: '#2e8cff', borderRadius: 100, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  pickPhotoText: { color: 'white', fontWeight: '800', fontSize: 13 },
  bottomBarTransparent: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', backgroundColor: 'rgba(12,12,14,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', borderRadius: 28, paddingVertical: 10, justifyContent: 'space-around', zIndex: 100 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 16 },
  tabActive: { backgroundColor: 'rgba(255,59,48,0.14)' },
  tabIcon: { fontSize: 16 },
  tabText: { color: '#666', fontSize: 9, fontWeight: '700', marginTop: 2 },
  tabTextActive: { color: '#ff3b30' },
  chatContainer: { flex: 1, width: '100%', backgroundColor: '#08080a' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: 'rgba(8,8,10,0.96)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  chatBackBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  chatAvatar: { width: 36, height: 36, borderRadius: 18, marginLeft: 4 },
  chatName: { color: 'white', fontSize: 14, fontWeight: '800' },
  chatStatus: { color: '#00d084', fontSize: 11, marginTop: 1 },
  chatEmpty: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 40, marginHorizontal: 20 },
  chatBubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  chatBubbleMe: { backgroundColor: '#ff3b30', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  chatBubbleThem: { backgroundColor: 'rgba(255,255,255,0.08)', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  chatBubbleText: { color: 'white', fontSize: 14, lineHeight: 18 },
  chatBubbleTime: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  chatInputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 28, gap: 8, backgroundColor: 'rgba(8,8,10,0.96)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  chatInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, color: 'white' },
  chatSendBtn: { backgroundColor: '#ff3b30', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  ctaScopri: { backgroundColor: '#ff3b30', borderRadius: 20, paddingVertical: 16, width: '100%', maxWidth: 380, alignSelf: 'center', alignItems: 'center', marginTop: 8 },
  ctaScopriText: { color: 'white', fontSize: 16, fontWeight: '900' },
  onboardingSingle: { flex: 1, width: '100%', backgroundColor: '#08080a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  onboardingGlow: { position: 'absolute', top: -100, left: -50, right: -50, height: 400, backgroundColor: '#ff3b30', opacity: 0.12, borderRadius: 200 },
  onboardingBigTitle: { color: 'white', fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 26, fontStyle: 'italic' },
  onboardingBigSub: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  featureRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, gap: 10 },
  featureIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,59,48,0.12)', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { color: 'white', fontSize: 13, fontWeight: '800' },
  featureSub: { color: '#888', fontSize: 11, marginTop: 1 },
  enterButton: { backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 16, paddingHorizontal: 32, width: '100%', maxWidth: 340, alignItems: 'center', marginTop: 24 },
  enterButtonText: { color: 'white', fontWeight: '900', fontSize: 15 },
});
