import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Pressable, Animated, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// GIORNO 7.1 - REFACTORING + ARCHITETTURA PULITA
// Traccia 1: Fondamenta per Onboarding + Nearby + Timer + Boost
// ============================================================================
// Struttura:
// - DATA: profili, citta, vibe
// - UTILS: Fire Score, colori, storage keys
// - HOOKS: useDailyReset logic inline
// - COMPONENTS: ProfileCard, VibeTags, PromptCarousel, FilterBar, etc.
// - MAIN APP: state + logic
// ============================================================================

// ----------------------------------------------------------------------------
// DATA LAYER - /data/profiles.js + /data/onboarding.js
// ----------------------------------------------------------------------------
const ONBOARDING_SLIDES = [
  { id: 1, icon: '🔥', title: 'Fire Score Reale', subtitle: 'Non solo foto', desc: 'Il valore vero basato su feedback reali. Più sei autentico, più il tuo score sale. Niente algoritmi truccati.', color: '#ff3b30' },
  { id: 2, icon: '#️⃣', title: 'Vibe Tags', subtitle: 'Trova la tua tribu', desc: 'Filtra per #Chef #Yoga #Arty #Vinile. Tap su un vibe nella card e scopri tutti con quella vibe. Niente swipe a caso.', color: '#ffcc00' },
  { id: 3, icon: '💬', title: 'Prompts Swipeabili', subtitle: 'Parla di te', desc: '3 prompts con icona per mostrare personalità. Swipe il carousel per vedere chi è davvero. Ice-breaker perfetti.', color: '#2e8cff' },
];

const PROFILES_DATA = [
  { id: 1, name: 'Sofia, 24', city: 'Milano', distance: '1.2km', vibe: ['Avventurosa','Buongustaia','Viaggi'], bio: 'Marketing, aperitivi e viaggi spontanei', longBio: 'Vivo a Milano, lavoro nel marketing moda. Viaggi last-minute e vino naturale.', prompts: [{ q: 'Weekend ideale', a: 'Lago di Como + aperitivo + nessun telefono', icon: '🏔️' }, { q: 'Sono brava a', a: 'Organizzare viaggi impossibili in 24h', icon: '✈️' }, { q: 'Green flag', a: 'Porta sempre snack in borsa', icon: '💚' }], reviews: [{ author: 'Marco 27', text: 'Solare e conversazione top!', rating: 5.0 }, { author: 'Luca 29', text: 'Super divertente', rating: 4.7 }, { author: 'Andrea 26', text: 'Vibe incredibile', rating: 4.8 }], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&auto=format&fit=crop', online: true, verified: true, activity: 92, voice: { duration: 12, transcript: 'Ciao! Sono Sofia, amo viaggi last-minute e vino naturale. Se sai organizzare un weekend in 2 ore, swipe a destra!' } },
  { id: 2, name: 'Giulia, 22', city: 'Bergamo', distance: '3.4km', vibe: ['Intensa','Natura','Palestra'], bio: 'Psicologia, palestra e tramonti', longBio: 'Studio psicologia a Bergamo. Cerco persone vere.', prompts: [{ q: 'Unpopular opinion', a: 'Palestra e meditazione', icon: '🤫' }, { q: 'Superpower', a: 'Capisco se menti in 3 secondi', icon: '👁️' }, { q: 'Happy place', a: 'Palestra alle 6AM con tramonto', icon: '🌅' }], reviews: [{ author: 'Davide 24', text: 'Dolce e intelligente.', rating: 4.6 }, { author: 'Fede 25', text: 'Profonda', rating: 4.5 }], photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop', online: true, verified: false, activity: 78, voice: { duration: 9, transcript: 'Studio psicologia, ma la mia vera terapia è la palestra alle 6 del mattino. Se reggi il mio ritmo, parliamo.' } },
  { id: 3, name: 'Martina, 26', city: 'Brescia', distance: '6.1km', vibe: ['Chef','Passionale','Buongustaia'], bio: 'Chef privato, cucino io', longBio: 'Chef Lago di Garda. Porti il vino, preparo io.', prompts: [{ q: 'Cucino meglio di', a: 'Tua nonna - sfida accettata?', icon: '👨‍🍳' }, { q: 'Love language', a: 'Cibo e vino buono', icon: '🍷' }, { q: 'Sabato sera', a: 'Cucino per te, tu porti storie', icon: '✨' }], reviews: [{ author: 'Carlo 28', text: 'Serata 10 e lode.', rating: 5.0 }, { author: 'Ste 27', text: 'Chef pazzesca', rating: 5.0 }, { author: 'Gio 26', text: 'Top', rating: 4.8 }], photo: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=800&q=80&auto=format&fit=crop', online: false, verified: true, activity: 95, voice: { duration: 15, transcript: 'Chef per passione. Se porti il vino giusto, ti preparo la cena della vita. Ma solo se sai apprezzare davvero.' } },
  { id: 4, name: 'Alice, 23', city: 'Milano', distance: '2.8km', vibe: ['Creativa','Arty','Design'], bio: 'Designer in Brera', longBio: 'Designer a Milano, Brera, arte e aperitivi.', prompts: [{ q: 'Museo preferito', a: 'Fondazione Prada a mezzanotte', icon: '🎨' }, { q: 'Design e', a: 'Rendere semplice il complicato', icon: '💡' }, { q: 'Sono famosa per', a: 'Perdere chiavi ma trovare idee', icon: '🔑' }], reviews: [{ author: 'Marta 25', text: 'Stile pazzesco!', rating: 4.7 }, { author: 'Chiara 24', text: 'Creativa', rating: 4.6 }], photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80&auto=format&fit=crop', online: true, verified: true, activity: 88, voice: { duration: 11, transcript: 'Designer in Brera. Rendo semplice il complicato. Cerco qualcuno che capisca che il design è ovunque.' } },
  { id: 5, name: 'Elena, 25', city: 'Pavia', distance: '8.3km', vibe: ['Zen','Curiosa','Yoga'], bio: 'Yoga e caffe specialty', longBio: 'Istruttrice yoga a Pavia.', prompts: [{ q: 'Mattina ideale', a: 'Yoga 6am + libro + caffe', icon: '🧘' }, { q: 'Non vivo senza', a: 'Tappetino e vinili', icon: '🎶' }, { q: 'Life motto', a: 'Respira, poi decidi', icon: '🌿' }], reviews: [{ author: 'Luca 26', text: 'Energia calma.', rating: 4.9 }, { author: 'Sara 24', text: 'Dolce', rating: 4.7 }], photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&auto=format&fit=crop', online: true, verified: true, activity: 90, voice: { duration: 13, transcript: 'Yoga, caffè specialty e vinili. Se sai stare in silenzio con me senza imbarazzo, hai già vinto.' } },
  { id: 6, name: 'Chiara, 24', city: 'Milano', distance: '0.9km', vibe: ['Analogica','Vinile','Creativa'], bio: 'Fotografa analogica', longBio: 'Fotografa analogica, camera oscura e vinili.', prompts: [{ q: 'Scatto migliore', a: 'Quello che non ho ancora fatto - con te?', icon: '📸' }, { q: 'Nota per', a: 'Perdere rullini ma trovare momenti', icon: '🎞️' }, { q: 'Sviluppo a', a: 'Lento, come le cose belle', icon: '⏳' }], reviews: [{ author: 'Fede 27', text: 'Creativa da paura.', rating: 4.7 }, { author: 'Tom 28', text: 'Stile unico', rating: 4.3 }], photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80&auto=format&fit=crop', online: false, verified: false, activity: 65, voice: { duration: 14, transcript: 'Fotografa analogica. Sviluppo lento, come le cose belle. Cerco qualcuno che abbia pazienza di aspettare lo scatto perfetto.' } },
];

const CITIES = ['Tutti', 'Milano', 'Bergamo', 'Brescia', 'Pavia'];

// Premium plans
const PREMIUM_PLANS = [
  { id: 'week', name: 'Settimanale', price: '€4,99', sub: 'a settimana', popular: false, features: ['Vedi chi ti ha messo like', 'Super Like illimitati'] },
  { id: 'month', name: 'Mensile', price: '€14,99', sub: 'al mese', popular: true, features: ['Tutto Settimanale +', '1 Boost gratis a settimana', 'Verifica prioritaria', 'Timer esteso 48h'] },
  { id: 'year', name: 'Annuale', price: '€59,99', sub: 'all\'anno - 60% off', popular: false, features: ['Tutto Mensile +', '3 Boost al mese', 'Badge Premium'] },
];

// Nearby encounters - Happn style
const NEARBY_ENCOUNTERS = [
  { profileId: 1, location: 'Via Brera, Milano', timeAgo: '2h fa', distance: '300m', count: 2 },
  { profileId: 4, location: 'Navigli, Milano', timeAgo: '5h fa', distance: '450m', count: 1 },
  { profileId: 6, location: 'Parco Sempione', timeAgo: 'Oggi, 9:12', distance: '1.1km', count: 3 },
  { profileId: 2, location: 'Stazione Centrale', timeAgo: 'Ieri, 18:30', distance: '800m', count: 1 },
];

const ALL_VIBES = ['Tutti', 'Avventurosa','Buongustaia','Viaggi','Intensa','Natura','Palestra','Chef','Passionale','Creativa','Arty','Design','Zen','Curiosa','Yoga','Analogica','Vinile'];

const DEFAULT_MY_PROFILE = { name: 'Carl', age: 28, city: 'Bascape - Lombardia', bio: 'Fondatore di FireHearts.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop', baseReviews: [{ rating: 4.7 }, { rating: 4.8 }, { rating: 4.6 }], myVibes: ['Founder','Avventuroso','Business'], myPrompts: [{ q: 'Sto costruendo', a: 'FireHearts - dating con Fire Score', icon: '🔥' }, { q: 'Weekend perfetto', a: 'Code + aperitivo + brainstorming', icon: '💻' }, { q: 'Cerco', a: 'Persone che sognano in grande', icon: '🚀' }] };

// ----------------------------------------------------------------------------
// UTILS LAYER - /utils/fireScore.js + /utils/storage.js
// ----------------------------------------------------------------------------
const STORAGE_KEYS = {
  SENT: 'fh_sent',
  MATCHES: 'fh_matches',
  SWIPE_INDEX: 'fh_swipeIndex',
  CHATS: 'fh_chats',
  HISTORY: 'fh_history',
  SUPER_LIKED: 'fh_superLiked',
  SUPER_COUNT: 'fh_superCount',
  UNDO_COUNT: 'fh_undoCount',
  LAST_RESET: 'fh_lastResetDate',
  MY_PROFILE: 'fh_myProfile',
  FILTER_VIBE: 'fh_filterVibe',
  ONBOARDING_DONE: 'fh_onboardingDone',
  LIKES_COUNT: 'fh_likesCount',
  MATCHES_EXPIRY: 'fh_matchesExpiry',
  NEARBY_SEEN: 'fh_nearbySeen',
  BOOST_ACTIVE: 'fh_boostActive',
  BOOST_EXPIRY: 'fh_boostExpiry',
  BOOST_COUNT: 'fh_boostCount',
  IS_VERIFIED: 'fh_isVerified',
  PREMIUM_ACTIVE: 'fh_premiumActive',


};

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

function getScoreColor(score) {
  const s = parseFloat(score);
  if (s >= 4.8) return '#00d084';
  if (s >= 4.5) return '#ffcc00';
  return '#ff7a7a';
}

function checkDailyReset(lastReset) {
  const today = new Date().toDateString();
  return lastReset !== today;
}

function getExpiryText(expiryTimestamp) {
  const now = Date.now();
  const diff = expiryTimestamp - now;
  if (diff <= 0) return 'Scaduto';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Scade tra ${hours}h ${mins}m`;
  return `Scade tra ${mins}m`;
}

function isExpiringSoon(expiryTimestamp) {
  const diff = expiryTimestamp - Date.now();
  return diff < 6 * 60 * 60 * 1000;
}

function calculateCompatibility(myProfile, otherProfile) {
  // Vibe overlap
  const myVibes = myProfile.myVibes || [];
  const otherVibes = otherProfile.vibe || [];
  const overlap = myVibes.filter(v => otherVibes.some(ov => ov.toLowerCase().includes(v.toLowerCase()) || v.toLowerCase().includes(ov.toLowerCase()))).length;
  const vibeScore = Math.min(40, overlap * 15 + Math.random() * 10);
  // Fire Score proximity
  const myScore = parseFloat(calculateFireScore({ ...myProfile, verified: true, online: true, activity: 90, reviews: myProfile.baseReviews }, 0));
  const otherScore = parseFloat(calculateFireScore(otherProfile));
  const scoreDiff = Math.abs(myScore - otherScore);
  const fireScoreBonus = Math.max(0, 20 - scoreDiff * 10);
  // Activity bonus
  const activityBonus = (otherProfile.activity || 70) * 0.15;
  // Base + random
  let total = 30 + vibeScore + fireScoreBonus + activityBonus + Math.random() * 10;
  total = Math.min(98, Math.max(62, Math.round(total)));
  return total;
}

function getCompatibilityColor(score) {
  if (score >= 85) return '#00d084';
  if (score >= 75) return '#ffcc00';
  return '#ff7a7a';
}

function getIceBreakers(profile) {
  const prompts = profile.prompts || [];
  const name = profile.name.split(',')[0];
  if (prompts.length === 0) return [`Ciao ${name}! Come va?`, `Ehi ${name}! Visto il tuo profilo 🔥`, `Ciao ${name}! Che vibe!`];
  const breakers = [];
  prompts.forEach((pr) => {
    breakers.push(`Ho visto che ${pr.q.toLowerCase()}... "${pr.a}" - raccontami di più?`);
    breakers.push(`Il tuo prompt su "${pr.q}" mi ha colpito! ${pr.icon} ${pr.a}`);
  });
  // Add vibe based
  if (profile.vibe && profile.vibe.length > 0) {
    breakers.push(`Vedo che sei #${profile.vibe[0]} - anch'io! Come hai iniziato?`);
  }
  // Shuffle and take 3 unique
  const shuffled = breakers.sort(() => 0.5 - Math.random());
  return [...new Set(shuffled)].slice(0, 3);
}

function getIceBreaker(profile) { return getIceBreakers(profile)[0]; }



// ----------------------------------------------------------------------------
// COMPONENTS LAYER - /components/*
// ----------------------------------------------------------------------------
function OnboardingSlide({ slide, isActive }) {
  return (
    <View style={styles.onboardingSlide}>
      <View style={[styles.onboardingIconCircle, { backgroundColor: slide.color + '20', borderColor: slide.color + '40' }]}>
        <Text style={styles.onboardingIcon}>{slide.icon}</Text>
      </View>
      <Text style={styles.onboardingTitle}>{slide.title}</Text>
      <Text style={[styles.onboardingSubtitle, { color: slide.color }]}>{slide.subtitle}</Text>
      <Text style={styles.onboardingDesc}>{slide.desc}</Text>
    </View>
  );
}

function Onboarding({ step, setStep, onComplete }) {
  const slide = ONBOARDING_SLIDES[step];
  return (
    <View style={styles.onboardingContainer}>
      <View style={styles.onboardingGlow} />
      <View style={styles.onboardingHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><FireHeartsLogo size="small" /><Text style={styles.onboardingLogo}>FireHearts</Text></View>
        <TouchableOpacity onPress={onComplete}><Text style={styles.onboardingSkip}>Salta</Text></TouchableOpacity>
      </View>
      <OnboardingSlide slide={slide} isActive />
      <View style={styles.onboardingDots}>{ONBOARDING_SLIDES.map((_, idx) => (<View key={idx} style={[styles.onboardingDot, step === idx && [styles.onboardingDotActive, { backgroundColor: slide.color }]]} />))}</View>
      <View style={styles.onboardingButtons}>
        {step > 0 && (<TouchableOpacity style={styles.onboardingSecondary} onPress={() => setStep(step - 1)}><Text style={styles.onboardingSecondaryText}>Indietro</Text></TouchableOpacity>)}
        <TouchableOpacity style={[styles.onboardingPrimary, { backgroundColor: slide.color }]} onPress={() => { if (step < 2) setStep(step + 1); else onComplete(); }}><Text style={styles.onboardingPrimaryText}>{step < 2 ? 'Avanti' : 'Inizia 🔥'}</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function SocialProofBanner({ count = 3, onPress }) {
  return (
    <TouchableOpacity style={styles.socialProofBanner} onPress={onPress}>
      <View style={styles.socialProofAvatars}>
        {PROFILES_DATA.slice(0,3).map((p, idx) => (
          <View key={p.id} style={[styles.socialProofAvatarWrapper, { marginLeft: idx === 0 ? 0 : -12, zIndex: 3 - idx }]}>
            <Image source={{ uri: p.photo }} style={styles.socialProofAvatar} blurRadius={8} />
            <View style={styles.socialProofLock}><Text style={styles.socialProofLockText}>🔒</Text></View>
          </View>
        ))}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.socialProofTitle}>{count} persone ti hanno messo like</Text>
        <Text style={styles.socialProofSub}>Sblocca per vedere chi</Text>
      </View>
      <View style={styles.socialProofCta}><Text style={styles.socialProofCtaText}>Sblocca</Text></View>
    </TouchableOpacity>
  );
}

function BoostOverlay({ expiry, onClose }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = expiry - Date.now();
      if (diff <= 0) { setTimeLeft('Finito'); onClose(); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiry]);
  return (
    <View style={styles.boostOverlay}>
      <View style={styles.boostGlow} />
      <Text style={styles.boostEmoji}>🚀</Text>
      <Text style={styles.boostTitle}>BOOST ATTIVO!</Text>
      <Text style={styles.boostSub}>Sei in cima a Milano</Text>
      <View style={styles.boostTimerBox}><Text style={styles.boostTimer}>{timeLeft}</Text><Text style={styles.boostTimerSub}>rimanenti</Text></View>
      <Text style={styles.boostDesc}>Il tuo profilo è in evidenza • 10x più visualizzazioni</Text>
      <TouchableOpacity style={styles.boostClose} onPress={onClose}><Text style={styles.boostCloseText}>Continua a swipare</Text></TouchableOpacity>
    </View>
  );
}

function VerificationModal({ onVerify, onClose }) {
  const [step, setStep] = useState(1);
  return (
    <View style={styles.verifyOverlay}>
      <View style={styles.verifyContainer}>
        <View style={styles.verifyHeader}><Text style={styles.verifyTitle}>Verifica profilo ✓</Text><TouchableOpacity onPress={onClose} style={styles.verifyClose}><Text style={styles.verifyCloseText}>✕</Text></TouchableOpacity></View>
        {step === 1 ? (
          <>
            <View style={styles.verifyIconBox}><Text style={styles.verifyIcon}>🤳</Text></View>
            <Text style={styles.verifyDesc}>Scatta un selfie per verificare che sei davvero tu. Ottieni badge blu e +30% match.</Text>
            <View style={styles.verifySteps}><Text style={styles.verifyStep}>• Foto non pubblicata</Text><Text style={styles.verifyStep}>• Verifica in 2 minuti</Text><Text style={styles.verifyStep}>• Badge Verificato blu</Text></View>
            <TouchableOpacity style={styles.verifyPrimary} onPress={() => setStep(2)}><Text style={styles.verifyPrimaryText}>Inizia verifica</Text></TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.verifyCameraMock}><Text style={styles.verifyCameraText}>📸</Text><Text style={styles.verifyCameraSub}>Posiziona il viso nell'ovale</Text></View>
            <TouchableOpacity style={styles.verifyPrimary} onPress={() => { onVerify(); onClose(); }}><Text style={styles.verifyPrimaryText}>Scatta e verifica</Text></TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function PremiumPaywall({ onClose, initialPlan = 'month' }) {
  const [selected, setSelected] = useState(initialPlan);
  return (
    <View style={styles.premiumPaywallOverlay}>
      <View style={styles.premiumPaywallContainer}>
        <View style={styles.paywallHeader}><Text style={styles.paywallTitle}>FireHearts Premium 💎</Text><TouchableOpacity onPress={onClose} style={styles.paywallClose}><Text style={styles.paywallCloseText}>✕</Text></TouchableOpacity></View>
        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          <View style={styles.premiumPlans}>{PREMIUM_PLANS.map((plan) => (<TouchableOpacity key={plan.id} style={[styles.premiumPlanCard, selected === plan.id && styles.premiumPlanActive, plan.popular && styles.premiumPlanPopular]} onPress={() => setSelected(plan.id)}>{plan.popular && (<View style={styles.popularBadge}><Text style={styles.popularText}>PIÙ POPOLARE</Text></View>)}<Text style={styles.planName}>{plan.name}</Text><Text style={styles.planPrice}>{plan.price}</Text><Text style={styles.planSub}>{plan.sub}</Text><View style={styles.planFeatures}>{plan.features.map((f,i)=>(<Text key={i} style={styles.planFeature}>✓ {f}</Text>))}</View></TouchableOpacity>))}</View>
        </ScrollView>
        <TouchableOpacity style={styles.paywallPrimary}><Text style={styles.paywallPrimaryText}>Continua con {PREMIUM_PLANS.find(p=>p.id===selected)?.name} - {PREMIUM_PLANS.find(p=>p.id===selected)?.price}</Text></TouchableOpacity>
        <Text style={styles.paywallLegal}>Rinnovabile, disdici quando vuoi. Pagamento sicuro.</Text>
      </View>
    </View>
  );
}

function VoicePlayer({ voice, isPlaying, onPlayPause, small = false }) {
  if (!voice) return null;
  return (
    <TouchableOpacity style={small ? styles.voiceSmall : styles.voiceCard} onPress={onPlayPause}>
      <View style={small ? styles.voicePlaySmall : styles.voicePlayButton}><Text style={small ? styles.voicePlayTextSmall : styles.voicePlayText}>{isPlaying ? '❚❚' : '▶'}</Text></View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={styles.voiceWaveRow}>
          {[...Array(small ? 12 : 20)].map((_, i) => (<View key={i} style={[styles.voiceBar, { height: 4 + Math.random() * (small ? 10 : 16), backgroundColor: isPlaying ? '#ff3b30' : 'rgba(255,255,255,0.3)', opacity: isPlaying ? 0.6 + Math.random() * 0.4 : 0.4 }]} />))}
        </View>
        {!small && (<Text style={styles.voiceTranscript} numberOfLines={2}>{voice.transcript}</Text>)}
      </View>
      <View style={styles.voiceDuration}><Text style={styles.voiceDurationText}>{voice.duration}s</Text></View>
    </TouchableOpacity>
  );
}

function IceBreakerSuggestions({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <View style={styles.iceBreakerContainer}>
      <View style={styles.iceBreakerHeader}><Text style={styles.iceBreakerTitle}>💡 Suggerimenti AI per te</Text><View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View></View>
      {suggestions.map((text, idx) => (
        <TouchableOpacity key={idx} style={styles.iceBreakerChip} onPress={() => onSelect(text)}>
          <Text style={styles.iceBreakerText} numberOfLines={2}>{text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CompatibilityBadge({ score }) {
  const color = getCompatibilityColor(score);
  return (
    <View style={[styles.compatBadge, { borderColor: color, backgroundColor: color + '15' }]}>
      <Text style={[styles.compatText, { color }]}>{score}% match</Text>
    </View>
  );
}

function FireHeartsLogo({ size = 'normal' }) {
  const flame1 = useRef(new Animated.Value(0)).current;
  const flame2 = useRef(new Animated.Value(0)).current;
  const flame3 = useRef(new Animated.Value(0)).current;
  const heartPulse = useRef(new Animated.Value(1)).current;
  const textGlow = useRef(new Animated.Value(0)).current;
  const winkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const flameLoop = (anim, delay, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();
    };
    flameLoop(flame1, 0, 600);
    flameLoop(flame2, 200, 700);
    flameLoop(flame3, 400, 650);
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(heartPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(textGlow, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(textGlow, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(winkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(winkAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const flame1Y = flame1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const flame2Y = flame2.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const flame3Y = flame3.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const flame1Scale = flame1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const flame2Scale = flame2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const flame3Scale = flame3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });

  if (size === 'small') {
    return (
      <View style={styles.logoSmallContainer}>
        <Animated.View style={[styles.heart3DWrapperSmall, { transform: [{ scale: heartPulse }] }]}>
          <View style={styles.heart3DShadowSmall} />
          <View style={styles.heart3DBaseSmall}><Text style={styles.heartEmojiSmall}>❤️</Text><View style={styles.winkFaceSmall}><Animated.View style={[styles.eyeSmall, winkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) && { transform: [{ scaleY: winkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }] }]}><Text style={styles.eyeTextSmall}>•</Text></Animated.View><View style={styles.eyeSmall}><Text style={styles.eyeTextSmall}>•</Text></View><Text style={styles.smileSmall}>‿</Text></View></View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.logoEpicContainer}>
      <View style={styles.logoIconRow}>
        <View style={styles.flameContainer}>
          <Animated.View style={[styles.flame, styles.flame1, { transform: [{ translateY: flame1Y }, { scale: flame1Scale }] }]}><Text style={styles.flameText}>🔥</Text></Animated.View>
          <Animated.View style={[styles.flame, styles.flame2, { transform: [{ translateY: flame2Y }, { scale: flame2Scale }] }]}><Text style={styles.flameTextSmall}>🔥</Text></Animated.View>
          <Animated.View style={[styles.flame, styles.flame3, { transform: [{ translateY: flame3Y }, { scale: flame3Scale }] }]}><Text style={styles.flameTextSmall}>🔥</Text></Animated.View>
          <Animated.View style={[styles.heart3DWrapper, { transform: [{ scale: heartPulse }] }]}>
            <View style={styles.heart3DShadow} />
            <View style={styles.heart3DShadow2} />
            <View style={styles.heart3DBase}>
              <Text style={styles.heartEmoji}>❤️</Text>
              <View style={styles.winkFace}>
                <Animated.View style={[styles.eye, { transform: [{ scaleY: winkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }] }]}><Text style={styles.eyeText}>•</Text></Animated.View>
                <View style={styles.eye}><Text style={styles.eyeText}>•</Text></View>
                <Text style={styles.smile}>‿</Text>
              </View>
            </View>
            <View style={styles.heartHighlight} />
          </Animated.View>
        </View>
        <View style={styles.logoTextColumn}>
          <Animated.Text style={[styles.logoEpicText, { textShadowColor: textGlow.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,59,48,0.3)', 'rgba(255,122,46,0.8)'] }), textShadowRadius: textGlow.interpolate({ inputRange: [0, 1], outputRange: [8, 20] }) }]}>FIREHEARTS</Animated.Text>
          <View style={styles.logoTaglineRow}><View style={styles.taglineDot} /><Animated.Text style={[styles.logoTagline, { opacity: textGlow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }]}>Trova la tua scintilla</Animated.Text></View>
        </View>
      </View>
    </View>
  );
}

function NearbyCard({ encounter, profile, onLike, onSuperLike }) {
  if (!profile) return null;
  return (
    <View style={styles.nearbyCard}>
      <Image source={{ uri: profile.photo }} style={styles.nearbyAvatar} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.nearbyName}>{profile.name}</Text>
          {encounter.count > 1 && (<View style={styles.nearbyCountBadge}><Text style={styles.nearbyCountText}>x{encounter.count}</Text></View>)}
        </View>
        <Text style={styles.nearbyLocation}>📍 {encounter.location} • {encounter.distance}</Text>
        <Text style={styles.nearbyTime}>{encounter.timeAgo} • Incrociata vicino a te</Text>
        <View style={styles.nearbyActions}>
          <TouchableOpacity style={styles.nearbyActionNo} onPress={() => onLike(profile, false)}><Text style={styles.nearbyActionNoText}>✕</Text></TouchableOpacity>
          <TouchableOpacity style={styles.nearbyActionSuper} onPress={() => onSuperLike(profile)}><Text style={styles.nearbyActionSuperText}>💙</Text></TouchableOpacity>
          <TouchableOpacity style={styles.nearbyActionYes} onPress={() => onLike(profile, true)}><Text style={styles.nearbyActionYesText}>❤️</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function LikesPaywall({ onClose }) {
  return (
    <View style={styles.paywallOverlay}>
      <View style={styles.paywallContainer}>
        <View style={styles.paywallHeader}><Text style={styles.paywallTitle}>Sblocca i tuoi like 💖</Text><TouchableOpacity onPress={onClose} style={styles.paywallClose}><Text style={styles.paywallCloseText}>✕</Text></TouchableOpacity></View>
        <View style={styles.paywallGrid}>{PROFILES_DATA.slice(0,6).map((p) => (<View key={p.id} style={styles.paywallCard}><Image source={{ uri: p.photo }} style={styles.paywallImage} blurRadius={12} /><View style={styles.paywallBlurOverlay}><Text style={styles.paywallBlurText}>🔒</Text></View></View>))}</View>
        <View style={styles.paywallBenefits}><Text style={styles.paywallBenefit}>✓ Vedi chi ti ha messo like</Text><Text style={styles.paywallBenefit}>✓ Super Like illimitati</Text><Text style={styles.paywallBenefit}>✓ Boost gratuito 1x/mese</Text></View>
        <TouchableOpacity style={styles.paywallPrimary}><Text style={styles.paywallPrimaryText}>Sblocca per €4,99 / mese</Text></TouchableOpacity>
        <TouchableOpacity style={styles.paywallSecondary} onPress={onClose}><Text style={styles.paywallSecondaryText}>Magari dopo</Text></TouchableOpacity>
      </View>
    </View>
  );
}


function VibeTags({ vibes, activeVibe, onPress, small = false }) {
  return (
    <View style={small ? styles.vibeRowSmall : styles.vibeRow}>
      {vibes.map((v,i) => (
        <TouchableOpacity key={i} style={[small ? styles.vibeTagSmall : styles.vibeTag, activeVibe === v && (small ? styles.vibeTagSmallActive : styles.vibeTagActive)]} onPress={() => onPress(v)}>
          <Text style={[small ? styles.vibeTagSmallText : styles.vibeTagText, activeVibe === v && (small ? styles.vibeTagSmallTextActive : styles.vibeTagTextActive)]}>#{v}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PromptCarousel({ prompts, promptIndex, setPromptIndex }) {
  return (
    <View style={styles.promptCarouselContainer}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.x / 280); setPromptIndex(idx); }} style={styles.promptCarousel} contentContainerStyle={{ gap: 8 }}>
        {prompts.map((pr, idx) => (
          <View key={idx} style={styles.promptPreviewCard}>
            <Text style={styles.promptQ}>{pr.icon} {pr.q}</Text>
            <Text style={styles.promptA} numberOfLines={2}>{pr.a}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.promptDots}>{prompts.map((_, idx) => (<View key={idx} style={[styles.promptDot, promptIndex === idx && styles.promptDotActive]} />))}</View>
    </View>
  );
}

function FilterChips({ items, active, onSelect, vibeStyle = false }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContentPremium}>
      {items.map((item) => (
        <TouchableOpacity key={item} style={[styles.filterChipPremium, vibeStyle && styles.vibeFilterChip, active === item && (vibeStyle ? styles.filterChipVibeActive : styles.filterChipActivePremium)]} onPress={() => onSelect(item)}>
          <Text style={[styles.filterTextPremium, active === item && styles.filterTextActivePremium]}>{vibeStyle ? (item === 'Tutti' ? 'Tutti Vibe' : `#${item}`) : item}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ----------------------------------------------------------------------------
// MAIN APP - /App.js
// ----------------------------------------------------------------------------
export default function App() {
  // State - Core
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
  const [myProfile, setMyProfile] = useState(DEFAULT_MY_PROFILE);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showLikesPaywall, setShowLikesPaywall] = useState(false);
  const [matchesExpiry, setMatchesExpiry] = useState({});
  const [nearbySeen, setNearbySeen] = useState([]);
  const [nowTick, setNowTick] = useState(Date.now());
  const [boostActive, setBoostActive] = useState(false);
  const [boostExpiry, setBoostExpiry] = useState(null);
  const [boostCount, setBoostCount] = useState(1);
  const [isVerified, setIsVerified] = useState(false);
  const [showBoostOverlay, setShowBoostOverlay] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPremiumPaywall, setShowPremiumPaywall] = useState(false);
  const [premiumActive, setPremiumActive] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [iceBreakers, setIceBreakers] = useState([]);




  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBio, setEditBio] = useState('');

  // Timer tick for expiry countdown + boost
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());
      if (boostActive && boostExpiry && Date.now() > boostExpiry) {
        setBoostActive(false);
        setBoostExpiry(null);
        setShowBoostOverlay(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [boostActive, boostExpiry]);

  // Animations
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swipePosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const matchScale = useRef(new Animated.Value(0)).current;
  const topProfileIdRef = useRef(null);
  const scorePulse = useRef(new Animated.Value(1)).current;
  const [chats, setChats] = useState({ 1: [{ id: 1, text: 'Ehi! Grazie per la scintilla!', from: 'them' }] });

  // Effects - Load
  useEffect(() => {
    (async () => {
      try {
        const keys = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SENT),
          AsyncStorage.getItem(STORAGE_KEYS.MATCHES),
          AsyncStorage.getItem(STORAGE_KEYS.SWIPE_INDEX),
          AsyncStorage.getItem(STORAGE_KEYS.CHATS),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.SUPER_LIKED),
          AsyncStorage.getItem(STORAGE_KEYS.SUPER_COUNT),
          AsyncStorage.getItem(STORAGE_KEYS.UNDO_COUNT),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET),
          AsyncStorage.getItem(STORAGE_KEYS.MY_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.FILTER_VIBE),
        ]);
        const [s,m,idx,c,h,sup,supCount,uCount,lastReset,prof,fVibe] = keys.map(v => v ? JSON.parse(v) : null);
        // Handle lastReset is string not JSON
        const lastResetRaw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET);
        const onboardingRaw = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
        const expiryRaw = await AsyncStorage.getItem(STORAGE_KEYS.MATCHES_EXPIRY);
        const nearbyRaw = await AsyncStorage.getItem(STORAGE_KEYS.NEARBY_SEEN);
        const boostActiveRaw = await AsyncStorage.getItem(STORAGE_KEYS.BOOST_ACTIVE);
        const boostExpiryRaw = await AsyncStorage.getItem(STORAGE_KEYS.BOOST_EXPIRY);
        const boostCountRaw = await AsyncStorage.getItem(STORAGE_KEYS.BOOST_COUNT);
        const verifiedRaw = await AsyncStorage.getItem(STORAGE_KEYS.IS_VERIFIED);
        const premiumRaw = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_ACTIVE);
        if (keys[0]) setSent(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.SENT)));
        if (keys[1]) setMatches(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.MATCHES)));
        if (keys[2]) setSwipeIndex(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.SWIPE_INDEX)));
        if (keys[3]) setChats(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.CHATS)));
        if (keys[4]) setHistory(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.HISTORY)));
        if (keys[5]) setSuperLiked(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.SUPER_LIKED)));
        if (keys[6]) setSuperCount(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.SUPER_COUNT)));
        if (keys[7]) setUndoCount(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.UNDO_COUNT)));
        if (lastResetRaw) setLastResetDate(lastResetRaw);
        if (onboardingRaw) setOnboardingDone(JSON.parse(onboardingRaw));
        if (expiryRaw) setMatchesExpiry(JSON.parse(expiryRaw));
        if (nearbyRaw) setNearbySeen(JSON.parse(nearbyRaw));
        if (boostActiveRaw) setBoostActive(JSON.parse(boostActiveRaw));
        if (boostExpiryRaw) { const exp = JSON.parse(boostExpiryRaw); setBoostExpiry(exp); if (Date.now() < exp) setBoostActive(true); }
        if (boostCountRaw) setBoostCount(JSON.parse(boostCountRaw));
        if (verifiedRaw) setIsVerified(JSON.parse(verifiedRaw));
        if (premiumRaw) setPremiumActive(JSON.parse(premiumRaw));
        if (keys[9]) setMyProfile(JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.MY_PROFILE)));
        if (keys[10]) setFilterVibe(await AsyncStorage.getItem(STORAGE_KEYS.FILTER_VIBE));
        if (checkDailyReset(lastResetRaw)) {
          setSuperCount(3); setUndoCount(3); const today = new Date().toDateString(); setLastResetDate(today);
          await AsyncStorage.setItem(STORAGE_KEYS.SUPER_COUNT, JSON.stringify(3));
          await AsyncStorage.setItem(STORAGE_KEYS.UNDO_COUNT, JSON.stringify(3));
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET, today);
        }
      } catch {} setLoaded(true);
    })();
  }, []);

  // Effects - Save
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.SENT, JSON.stringify(sent)); }, [sent, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches)); }, [matches, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.SWIPE_INDEX, JSON.stringify(swipeIndex)); }, [swipeIndex, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats)); }, [chats, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)); }, [history, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.SUPER_LIKED, JSON.stringify(superLiked)); }, [superLiked, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.SUPER_COUNT, JSON.stringify(superCount)); }, [superCount, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.UNDO_COUNT, JSON.stringify(undoCount)); }, [undoCount, loaded]);
  useEffect(() => { if (loaded && lastResetDate) AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET, lastResetDate); }, [lastResetDate, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.MY_PROFILE, JSON.stringify(myProfile)); }, [myProfile, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.FILTER_VIBE, filterVibe); }, [filterVibe, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, JSON.stringify(onboardingDone)); }, [onboardingDone, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.MATCHES_EXPIRY, JSON.stringify(matchesExpiry)); }, [matchesExpiry, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.NEARBY_SEEN, JSON.stringify(nearbySeen)); }, [nearbySeen, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.BOOST_ACTIVE, JSON.stringify(boostActive)); }, [boostActive, loaded]);
  useEffect(() => { if (loaded && boostExpiry) AsyncStorage.setItem(STORAGE_KEYS.BOOST_EXPIRY, JSON.stringify(boostExpiry)); }, [boostExpiry, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.BOOST_COUNT, JSON.stringify(boostCount)); }, [boostCount, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.IS_VERIFIED, JSON.stringify(isVerified)); }, [isVerified, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_ACTIVE, JSON.stringify(premiumActive)); }, [premiumActive, loaded]);

  // Derived
  let filteredProfiles = filterCity === 'Tutti' ? PROFILES_DATA : PROFILES_DATA.filter((p) => p.city === filterCity);
  if (filterVibe !== 'Tutti') filteredProfiles = filteredProfiles.filter((p) => p.vibe.includes(filterVibe));
  const topProfile = filteredProfiles[swipeIndex % (filteredProfiles.length || 1)];
  const nextProfile = filteredProfiles[(swipeIndex + 1) % (filteredProfiles.length || 1)];
  const nextNextProfile = filteredProfiles[(swipeIndex + 2) % (filteredProfiles.length || 1)];
  useEffect(() => { topProfileIdRef.current = topProfile?.id || null; setPromptIndex(0); }, [topProfile]);
  const myDynamicScore = calculateFireScore({ ...myProfile, verified: true, online: true, activity: 90, reviews: myProfile.baseReviews }, matches.length);
  useEffect(() => { Animated.sequence([Animated.timing(scorePulse, { toValue: 1.2, duration: 150, useNativeDriver: true }), Animated.timing(scorePulse, { toValue: 1, duration: 150, useNativeDriver: true })]).start(); }, [matches.length]);

  // Handlers
  const startEditing = () => { setEditName(myProfile.name); setEditAge(String(myProfile.age || 28)); setEditCity(myProfile.city); setEditBio(myProfile.bio); setIsEditing(true); };
  const saveEditing = () => { setMyProfile({ ...myProfile, name: editName || myProfile.name, age: parseInt(editAge) || myProfile.age, city: editCity || myProfile.city, bio: editBio || myProfile.bio }); setIsEditing(false); };
  const handleFlip = (id) => { if (activeFlipId) return; if (flippedId === id) { setActiveFlipId(id); Animated.timing(flipAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => { setFlippedId(null); setActiveFlipId(null); }); } else { setActiveFlipId(id); flipAnim.setValue(0); Animated.timing(flipAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => { setFlippedId(id); setActiveFlipId(null); }); } };
  const triggerMatchPopup = (p, superLike = false) => { setIsSuperMatch(superLike); setShowMatch(p); matchScale.setValue(0); Animated.spring(matchScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start(); };
  const sendScintilla = (p) => { if (!sent.includes(p.id)) { setSent([...sent, p.id]); setTimeout(() => { if (Math.random() > 0.25) { setMatches((prev) => { const isNew = !prev.includes(p.id); if (isNew) { const expiry = Date.now() + 24 * 60 * 60 * 1000; setMatchesExpiry((prevExp) => ({ ...prevExp, [p.id]: expiry })); } return prev.includes(p.id) ? prev : [...prev, p.id]; }); triggerMatchPopup(p, false); } }, 800); } };
  const goNextCard = () => { swipePosition.setValue({ x: 0, y: 0 }); setFlippedId(null); flipAnim.setValue(0); setSwipeIndex((s) => s + 1); };
  const handleSwipeRight = () => { if (!topProfile) return; setHistory((prev) => [...prev, { id: topProfile.id, action: 'like' }]); Animated.timing(swipePosition, { toValue: { x: 550, y: -60 }, duration: 230, useNativeDriver: true }).start(() => { sendScintilla(topProfile); goNextCard(); }); };
  const handleSwipeLeft = () => { if (!topProfile) return; setHistory((prev) => [...prev, { id: topProfile.id, action: 'nope' }]); Animated.timing(swipePosition, { toValue: { x: -550, y: -60 }, duration: 230, useNativeDriver: true }).start(() => goNextCard()); };
  const handleSuperLike = () => { if (!topProfile || superCount <= 0) return; setSuperCount((s) => s - 1); setSuperLiked((prev) => [...prev, topProfile.id]); setHistory((prev) => [...prev, { id: topProfile.id, action: 'super' }]); Animated.timing(swipePosition, { toValue: { x: 0, y: -500 }, duration: 280, useNativeDriver: true }).start(() => { setSent((prev) => prev.includes(topProfile.id) ? prev : [...prev, topProfile.id]); setMatches((prev) => { const isNew = !prev.includes(topProfile.id); if (isNew) { const expiry = Date.now() + 24 * 60 * 60 * 1000; setMatchesExpiry((prevExp) => ({ ...prevExp, [topProfile.id]: expiry })); } return prev.includes(topProfile.id) ? prev : [...prev, topProfile.id]; }); triggerMatchPopup(topProfile, true); goNextCard(); }); };
  const handleUndo = () => { if (history.length === 0) return; if (undoCount <= 0) return; setUndoCount((c) => c - 1); const last = history[history.length - 1]; setHistory((prev) => prev.slice(0, -1)); setSwipeIndex((s) => Math.max(0, s - 1)); if (last.action === 'like') { setSent((prev) => prev.filter((x) => x !== last.id)); setMatches((prev) => prev.filter((x) => x !== last.id)); } if (last.action === 'super') { setSent((prev) => prev.filter((x) => x !== last.id)); setMatches((prev) => prev.filter((x) => x !== last.id)); setSuperLiked((prev) => prev.filter((x) => x !== last.id)); setSuperCount((s) => s + 1); } swipePosition.setValue({ x: 0, y: 0 }); setFlippedId(null); flipAnim.setValue(0); };
  const handleReset = async () => { setSent([]); setMatches([]); setSwipeIndex(0); setHistory([]); setSuperLiked([]); setSuperCount(3); setUndoCount(3); setFilterVibe('Tutti'); setLastResetDate(new Date().toDateString()); setMyProfile(DEFAULT_MY_PROFILE); setChats({ 1: [{ id: 1, text: 'Ehi!', from: 'them' }] }); await AsyncStorage.clear(); };
  const handleVibePress = (vibe) => { setFilterVibe(vibe); setSwipeIndex(0); setFlippedId(null); flipAnim.setValue(0); };
  const handleNearbyLike = (profile, isLike) => { setNearbySeen((prev) => prev.includes(profile.id) ? prev : [...prev, profile.id]); if (isLike) { sendScintilla(profile); } };
  const handleNearbySuperLike = (profile) => { if (superCount <= 0) return; setSuperCount((s) => s - 1); setSuperLiked((prev) => [...prev, profile.id]); setNearbySeen((prev) => prev.includes(profile.id) ? prev : [...prev, profile.id]); setSent((prev) => prev.includes(profile.id) ? prev : [...prev, profile.id]); setMatches((prev) => { const isNew = !prev.includes(profile.id); if (isNew) { const expiry = Date.now() + 24 * 60 * 60 * 1000; setMatchesExpiry((prevExp) => ({ ...prevExp, [profile.id]: expiry })); } return prev.includes(profile.id) ? prev : [...prev, profile.id]; }); triggerMatchPopup(profile, true); };
  const handleBoost = () => { if (boostCount <= 0 && !premiumActive) { setShowPremiumPaywall(true); return; } const expiry = Date.now() + 30 * 60 * 1000; setBoostActive(true); setBoostExpiry(expiry); setShowBoostOverlay(true); if (!premiumActive) setBoostCount((c) => Math.max(0, c - 1)); };
  const handleVerify = () => { setIsVerified(true); setMyProfile((prev) => ({ ...prev, verified: true })); };
  const handleVoicePlay = (profileId) => { if (playingVoiceId === profileId) { setPlayingVoiceId(null); } else { setPlayingVoiceId(profileId); setTimeout(() => setPlayingVoiceId(null), 4000); } };




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
  useEffect(() => {
    if (activeChat) {
      const msgs = chats[activeChat.id] || [];
      if (msgs.length <= 1) {
        setIceBreakers(getIceBreakers(activeChat));
      } else {
        setIceBreakers([]);
      }
    }
  }, [activeChat, chats]);

  const handleSendMessage = (customText) => { 
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !activeChat) return; 
    const newMsg = { id: Date.now(), text: textToSend, from: 'me' }; 
    setChats((prev) => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), newMsg] })); 
    setInputText(''); 
    setIceBreakers([]);
    // Simulate reply after 1-2s
    setTimeout(() => {
      const replies = ['Haha bellissimo! 😍', 'Davvero? Raccontami di più!', 'Anche io la penso così! 🔥', 'Ci sta! Quando ci vediamo?'];
      const reply = { id: Date.now() + 1, text: replies[Math.floor(Math.random() * replies.length)], from: 'them' };
      setChats((prev) => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), reply] }));
    }, 1200 + Math.random() * 1000);
  };
  const handleIceBreakerSelect = (text) => { handleSendMessage(text); };
  const inviateProfiles = PROFILES_DATA.filter((p) => sent.includes(p.id) && !matches.includes(p.id));
  const matchProfiles = PROFILES_DATA.filter((p) => matches.includes(p.id));
  const isFlipped = topProfile && flippedId === topProfile.id; const isFlipping = topProfile && activeFlipId === topProfile.id;

  if (!loaded) { return (<View style={styles.container}><View style={styles.loadingLogoWrapper}><FireHeartsLogo /><Text style={styles.subtitlePremium}>Caricamento...</Text></View></View>); }
  if (!onboardingDone) { return (<View style={styles.container}><Onboarding step={onboardingStep} setStep={setOnboardingStep} onComplete={() => setOnboardingDone(true)} /></View>); }

  if (activeChat) {
    const messages = chats[activeChat.id] || [];
    return (<View style={styles.container}><View style={styles.glowTop} /><View style={styles.chatHeaderPremium}><TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backButtonPremium}><Text style={styles.backText}>Indietro</Text></TouchableOpacity><Image source={{ uri: activeChat.photo }} style={styles.chatAvatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.chatNamePremium}>{activeChat.name}</Text><Text style={styles.chatStatusPremium}>{calculateFireScore(activeChat)} ★ • {calculateCompatibility(myProfile, activeChat)}% match</Text></View></View><ScrollView style={styles.chatMessages} contentContainerStyle={{ padding: 16 }}>{messages.map((msg) => (<View key={msg.id} style={[styles.bubblePremium, msg.from === 'me' ? styles.myBubblePremium : styles.theirBubblePremium]}><Text style={styles.bubbleTextPremium}>{msg.text}</Text></View>))}{iceBreakers.length > 0 && (<IceBreakerSuggestions suggestions={iceBreakers} onSelect={handleIceBreakerSelect} />)}</ScrollView><View style={styles.chatInputBarPremium}><TextInput style={styles.textInputPremium} placeholder="Scrivi un messaggio..." placeholderTextColor="#666" value={inputText} onChangeText={setInputText} onSubmitEditing={() => handleSendMessage()} /><TouchableOpacity style={styles.sendButtonPremium} onPress={() => handleSendMessage()}><Text style={styles.sendButtonTextPremium}>Invia</Text></TouchableOpacity></View></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} /><View style={styles.glowBottom} />
      <FireHeartsLogo />
      <Text style={styles.subtitlePremium}>Voice • AI Ice-breaker • 4 incroci oggi • Persone autentiche</Text>
      <View style={styles.counterPill}><View style={styles.counterDot} /><Text style={styles.counterTextPremium}>{filteredProfiles.length > 0 ? `${swipeIndex % filteredProfiles.length +1} / ${filteredProfiles.length}` : `0 / 0`} - {matches.length} Match - 💙{superCount} ↩️{undoCount}{filterVibe !== 'Tutti' ? ` - #${filterVibe}` : ''}</Text><TouchableOpacity onPress={handleReset} style={styles.resetPill}><Text style={styles.resetTextPremium}>Reset</Text></TouchableOpacity></View>
      {tab === 'scopri' && (<><SocialProofBanner count={3} onPress={() => setShowLikesPaywall(true)} /><View style={styles.filterWrapperPremium}><FilterChips items={CITIES} active={filterCity} onSelect={(c) => { setFilterCity(c); setSwipeIndex(0); setFlippedId(null); flipAnim.setValue(0); }} /></View><View style={styles.filterWrapperPremium}><FilterChips items={ALL_VIBES} active={filterVibe} onSelect={handleVibePress} vibeStyle /></View>{filterVibe !== 'Tutti' && (<TouchableOpacity style={styles.activeVibePill} onPress={() => setFilterVibe('Tutti')}><Text style={styles.activeVibeText}>Filtro: {filterVibe} ✕</Text></TouchableOpacity>)}</>)}
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ padding: 16, paddingBottom: 300 }} showsVerticalScrollIndicator={false}>
        {tab === 'scopri' && filteredProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyTextPremium}>Nessuno con vibe {filterVibe} a {filterCity}</Text><TouchableOpacity style={styles.clearFilterBtn} onPress={() => { setFilterCity('Tutti'); setFilterVibe('Tutti'); }}><Text style={styles.clearFilterText}>Azzera filtri</Text></TouchableOpacity></View>)}
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
                    <VibeTags vibes={topProfile.vibe} activeVibe={filterVibe} onPress={handleVibePress} />
                    <View style={styles.fireScoreBreakdown}><Text style={styles.breakdownTitle}>Fire Score {calculateFireScore(topProfile)} ★ • {calculateCompatibility(myProfile, topProfile)}% compatibili</Text><Text style={styles.breakdownLabel}>Media {topProfile.reviews.length} recensioni: {(topProfile.reviews.reduce((s,r)=>s+r.rating,0)/topProfile.reviews.length).toFixed(1)}</Text></View>
                    {topProfile.voice && (<VoicePlayer voice={topProfile.voice} isPlaying={playingVoiceId === topProfile.id} onPlayPause={() => handleVoicePlay(topProfile.id)} />)}
                    <Text style={styles.cardBackBioTitle}>Prompts</Text>{topProfile.prompts.map((pr,idx)=>(<View key={idx} style={styles.promptCard}><Text style={styles.promptCardQ}>{pr.icon} {pr.q}</Text><Text style={styles.promptCardA}>{pr.a}</Text></View>))}
                    <View style={styles.backButtonFlip}><Text style={styles.backButtonFlipText}>Tocca per tornare</Text></View>
                  </ScrollView>
                </Animated.View>
              </Pressable>
            ) : (
              <Pressable onPress={() => handleFlip(topProfile.id)} style={{ width: '100%', alignItems: 'center' }}>
                <Animated.View {...panResponder.panHandlers} style={[styles.premiumCard, styles.cardTop, { transform: [{ translateX: swipePosition.x }, { translateY: swipePosition.y }, { rotate: rotate }] }]}>
                  <Image source={{ uri: topProfile.photo }} style={styles.premiumImage} /><View style={styles.cardGradientBottom} />
                  <View style={styles.topBarClean}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><View style={[styles.scoreBadgePremium, { borderColor: getScoreColor(calculateFireScore(topProfile)), borderWidth: 1.5 }]}><Text style={[styles.scoreTextPremium, { color: getScoreColor(calculateFireScore(topProfile)) }]}>{calculateFireScore(topProfile)} ★</Text></View><CompatibilityBadge score={calculateCompatibility(myProfile, topProfile)} /></View>{topProfile.verified && (<View style={styles.verifiedBadgeClean}><Text style={styles.verifiedTextClean}>Verificato</Text></View>)}</View>
                  <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}><Text style={styles.likeText}>LIKE</Text></Animated.View>
                  <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}><Text style={styles.nopeText}>NOPE</Text></Animated.View>
                  <Animated.View style={[styles.superBadge, { opacity: superOpacity }]}><Text style={styles.superText}>SUPER</Text></Animated.View>
                  <View style={styles.premiumCardContent}>
                    <Text style={styles.premiumName}>{topProfile.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}><Text style={styles.premiumCity}>📍 {topProfile.city}</Text><View style={styles.distancePill}><Text style={styles.distanceText}>{topProfile.distance}</Text></View></View>
                    <VibeTags vibes={topProfile.vibe} activeVibe={filterVibe} onPress={handleVibePress} small />
                    {topProfile.voice && (<VoicePlayer voice={topProfile.voice} isPlaying={playingVoiceId === topProfile.id} onPlayPause={() => handleVoicePlay(topProfile.id)} small />)}
                    <PromptCarousel prompts={topProfile.prompts} promptIndex={promptIndex} setPromptIndex={setPromptIndex} />
                  </View>
                </Animated.View>
              </Pressable>
            )}
            <View style={styles.swipeButtonsRowFixed}><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnNo]} onPress={handleSwipeLeft}><Text style={styles.swipeBtnText}>✕</Text></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnUndo, undoCount === 0 && styles.swipeBtnUndoDisabled]} onPress={handleUndo}><Text style={styles.swipeBtnUndoText}>↩️</Text><View style={styles.superCountBadge}><Text style={styles.superCountText}>{undoCount}</Text></View></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnBoost, boostActive && styles.swipeBtnBoostActive]} onPress={handleBoost}><Text style={styles.swipeBtnBoostText}>🚀</Text>{boostCount > 0 && !boostActive && (<View style={[styles.superCountBadge, { backgroundColor: '#ff7a2e' }]}><Text style={styles.superCountText}>{boostCount}</Text></View>)}{boostActive && (<View style={[styles.superCountBadge, { backgroundColor: '#00d084' }]}><Text style={styles.superCountText}>●</Text></View>)}</TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnSuper, superCount === 0 && styles.swipeBtnUndoDisabled]} onPress={handleSuperLike}><Text style={styles.swipeBtnSuperText}>💙</Text><View style={styles.superCountBadge}><Text style={styles.superCountText}>{superCount}</Text></View></TouchableOpacity><TouchableOpacity style={[styles.swipeBtn, styles.swipeBtnYes]} onPress={handleSwipeRight}><Text style={styles.swipeBtnTextYes}>❤️</Text></TouchableOpacity></View>
          </View>
        )}
        {tab === 'vicino' && (
          <View style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }}>
            <View style={styles.nearbyMapMock}>
              <Text style={styles.nearbyMapTitle}>📍 Milano • 4 persone incrociate oggi</Text>
              <View style={styles.nearbyMapDots}>
                {NEARBY_ENCOUNTERS.map((enc, idx) => (
                  <View key={idx} style={[styles.nearbyMapDot, { left: `${20 + idx * 20}%`, top: `${30 + (idx % 2) * 20}%` }]}>
                    <Text style={styles.nearbyMapDotText}>•</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.nearbyMapSub}>Hai incrociato queste persone nella vita reale</Text>
            </View>
            {NEARBY_ENCOUNTERS.filter(enc => !nearbySeen.includes(enc.profileId)).map((enc) => {
              const profile = PROFILES_DATA.find(p => p.id === enc.profileId);
              return <NearbyCard key={enc.profileId} encounter={enc} profile={profile} onLike={handleNearbyLike} onSuperLike={handleNearbySuperLike} />;
            })}
            {NEARBY_ENCOUNTERS.filter(enc => !nearbySeen.includes(enc.profileId)).length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyTextPremium}>Hai visto tutti vicino a te oggi 🔍</Text><Text style={styles.emptySubPremium}>Torna più tardi, incrocerai nuove persone</Text></View>)}
          </View>
        )}
        {tab === 'inviate' && inviateProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyTextPremium}>Nessuna scintilla</Text></View>)}
        {tab === 'inviate' && inviateProfiles.map((p) => (<View key={p.id} style={styles.premiumCardSmall}><Image source={{ uri: p.photo }} style={styles.avatarPremium} /><View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.namePremium}>{p.name} - {calculateFireScore(p)} ★</Text><Text style={styles.cityPremium}>#{p.vibe[0]}</Text></View></View>))}
        {tab === 'match' && matchProfiles.length === 0 && (<View style={styles.emptyBoxPremium}><Text style={styles.emptyTextPremium}>Nessun Match</Text></View>)}
        {tab === 'match' && matchProfiles.map((p) => { const expiry = matchesExpiry[p.id]; const expiryText = expiry ? getExpiryText(expiry) : null; const expiringSoon = expiry ? isExpiringSoon(expiry) : false; return (<View key={p.id} style={[styles.matchCardPremium, superLiked.includes(p.id) && styles.matchCardSuper, expiringSoon && styles.matchCardExpiring]}><Image source={{ uri: p.photo }} style={styles.matchAvatarPremium} /><View style={{ flex: 1, marginLeft: 14 }}><Text style={styles.matchNamePremium}>{p.name} - {calculateFireScore(p)} ★</Text><Text style={styles.matchSubText}>#{p.vibe.join(' #')}</Text>{expiryText && (<View style={[styles.expiryPill, expiringSoon && styles.expiryPillUrgent]}><Text style={[styles.expiryText, expiringSoon && styles.expiryTextUrgent]}>⏰ {expiryText}</Text></View>)}<TouchableOpacity style={styles.chatButtonPremium} onPress={() => setActiveChat(p)}><Text style={styles.chatButtonTextPremium}>Chat 💬</Text></TouchableOpacity></View></View>); })}
        {tab === 'profilo' && (<View style={styles.profileContainerPremium}>{isEditing ? (<View style={styles.editContainer}><Text style={styles.editTitle}>Modifica</Text><Text style={styles.editLabel}>Nome</Text><TextInput style={styles.editInput} value={editName} onChangeText={setEditName} /><Text style={styles.editLabel}>Citta</Text><TextInput style={styles.editInput} value={editCity} onChangeText={setEditCity} /><Text style={styles.editLabel}>Bio</Text><TextInput style={[styles.editInput, styles.editInputBio]} value={editBio} onChangeText={setEditBio} multiline /><View style={styles.editButtonsRow}><TouchableOpacity style={styles.editCancel} onPress={() => setIsEditing(false)}><Text style={styles.editCancelText}>Annulla</Text></TouchableOpacity><TouchableOpacity style={styles.editSave} onPress={saveEditing}><Text style={styles.editSaveText}>Salva</Text></TouchableOpacity></View></View>) : (<><View style={styles.profileAvatarWrapper}><View style={styles.profileAvatarRing} /><Image source={{ uri: myProfile.photo }} style={styles.profileAvatarPremium} /><Animated.View style={[styles.profileScoreFloat, { transform: [{ scale: scorePulse }], borderColor: getScoreColor(myDynamicScore) }]}><Text style={[styles.profileScoreFloatText, { color: getScoreColor(myDynamicScore) }]}>{myDynamicScore} ★</Text></Animated.View></View><Text style={styles.profileNamePremium}>{myProfile.name}</Text><TouchableOpacity style={styles.editProfileButton} onPress={startEditing}><Text style={styles.editProfileButtonText}>Modifica profilo</Text></TouchableOpacity><View style={[styles.bigScoreBoxPremium, { borderColor: getScoreColor(myDynamicScore) + '40' }]}><Text style={[styles.bigScorePremium, { color: getScoreColor(myDynamicScore) }]}>{myDynamicScore}</Text><Text style={styles.bigScoreLabelPremium}>Fire Score Dinamico</Text><Text style={styles.bigScoreSubPremium}>💙 {superCount} Super Like disponibili oggi • Verificato • Milano</Text></View><View style={styles.bioCardPremium}><Text style={styles.bioTitlePremium}>Come funziona FireHearts 🔥</Text><Text style={styles.bioTextPremium}>Fire Score basato su feedback reali, Vibe Tags per trovare la tua tribù, Prompts per mostrare chi sei davvero. Niente swipe a caso, solo connessioni autentiche.</Text></View>
                <TouchableOpacity style={[styles.boostCard, boostActive && styles.boostCardActive]} onPress={handleBoost}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={styles.boostCardIcon}><Text style={{ fontSize: 20 }}>🚀</Text></View>
                      <View><Text style={styles.boostCardTitle}>{boostActive ? 'BOOST ATTIVO' : 'BOOST'}</Text><Text style={styles.boostCardSub}>{boostActive && boostExpiry ? `Scade tra ${Math.max(0, Math.floor((boostExpiry - nowTick)/60000))}m` : `${boostCount} disponibili • 10x visibilità`}</Text></View>
                    </View>
                    <View style={[styles.boostCardCta, boostActive && styles.boostCardCtaActive]}><Text style={styles.boostCardCtaText}>{boostActive ? 'Attivo' : 'Attiva'}</Text></View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.verifyCard, isVerified && styles.verifyCardDone]} onPress={() => !isVerified && setShowVerification(true)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.verifyCardIcon, isVerified && styles.verifyCardIconDone]}><Text style={{ fontSize: 18 }}>{isVerified ? '✓' : '🤳'}</Text></View>
                      <View><Text style={styles.verifyCardTitle}>{isVerified ? 'Verificato ✓' : 'Verifica profilo'}</Text><Text style={styles.verifyCardSub}>{isVerified ? 'Badge blu attivo • +30% match' : 'Ottieni badge blu • Più fiducia'}</Text></View>
                    </View>
                    {!isVerified && (<View style={styles.verifyCardCta}><Text style={styles.verifyCardCtaText}>Verifica</Text></View>)}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.premiumCardBanner} onPress={() => setShowPremiumPaywall(true)}><Text style={styles.premiumBannerTitle}>💎 FireHearts Premium</Text><Text style={styles.premiumBannerSub}>Super Like illimitati • Vedi chi ti ha messo like • 1 Boost a settimana</Text></TouchableOpacity>
</>)}</View>)}
      </ScrollView>
      {showMatch && (<View style={styles.matchOverlay}><Animated.View style={[styles.matchPopup, isSuperMatch && styles.matchPopupSuper, { transform: [{ scale: matchScale }] }]}><Text style={styles.matchPopupTitle}>{isSuperMatch ? 'Super Match! 💙' : 'Match!'}</Text><Text style={styles.matchPopupSub}>{calculateFireScore(showMatch)} ★ - #{showMatch.vibe[0]}</Text><View style={styles.matchAvatarsRow}><Image source={{ uri: myProfile.photo }} style={styles.matchPopupAvatar} /><Image source={{ uri: showMatch.photo }} style={styles.matchPopupAvatar} /></View><TouchableOpacity style={[styles.matchPopupPrimary, isSuperMatch && styles.matchPopupPrimarySuper]} onPress={() => { setActiveChat(showMatch); setShowMatch(null); }}><Text style={styles.matchPopupPrimaryText}>Messaggio</Text></TouchableOpacity><TouchableOpacity style={styles.matchPopupSecondary} onPress={() => setShowMatch(null)}><Text style={styles.matchPopupSecondaryText}>Continua</Text></TouchableOpacity></Animated.View></View>)}
      {showLikesPaywall && (<LikesPaywall onClose={() => setShowLikesPaywall(false)} />)}
      {showBoostOverlay && boostExpiry && (<BoostOverlay expiry={boostExpiry} onClose={() => setShowBoostOverlay(false)} />)}
      {showVerification && (<VerificationModal onVerify={handleVerify} onClose={() => setShowVerification(false)} />)}
      {showPremiumPaywall && (<PremiumPaywall onClose={() => setShowPremiumPaywall(false)} />)}

      <View style={styles.bottomBarPremium}><TouchableOpacity style={[styles.tabPremium, tab === 'scopri' && styles.tabActivePremium]} onPress={() => setTab('scopri')}><Text style={styles.tabIconPremium}>🔍</Text><Text style={[styles.tabTextPremium, tab === 'scopri' && styles.tabTextActivePremium]}>Scopri</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'vicino' && styles.tabActivePremium]} onPress={() => setTab('vicino')}><Text style={styles.tabIconPremium}>📍</Text><Text style={[styles.tabTextPremium, tab === 'vicino' && styles.tabTextActivePremium]}>Vicino</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'match' && styles.tabActivePremium]} onPress={() => setTab('match')}><Text style={styles.tabIconPremium}>❤️</Text><Text style={[styles.tabTextPremium, tab === 'match' && styles.tabTextActivePremium]}>Match</Text></TouchableOpacity><TouchableOpacity style={[styles.tabPremium, tab === 'profilo' && styles.tabActivePremium]} onPress={() => setTab('profilo')}><Text style={styles.tabIconPremium}>👤</Text><Text style={[styles.tabTextPremium, tab === 'profilo' && styles.tabTextActivePremium]}>Profilo</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080a', alignItems: 'center', paddingTop: 50 },
  glowTop: { position: 'absolute', top: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff3b30', opacity: 0.12, borderRadius: 200 },
  glowBottom: { position: 'absolute', bottom: -100, left: -50, right: -50, height: 300, backgroundColor: '#ff7a2e', opacity: 0.08, borderRadius: 200 },
  logoPremium: { fontSize: 34, fontWeight: '900', color: '#fff' },
  subtitlePremium: { color: '#888', fontSize: 10, marginTop: 8, marginBottom: 14, fontWeight: '600', textAlign: 'center', letterSpacing: 0.5 },
  logoEpicContainer: { width: '100%', alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  logoIconRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flameContainer: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  flame: { position: 'absolute' },
  flame1: { top: -6, left: 8 },
  flame2: { top: -2, right: 2 },
  flame3: { top: 2, left: -2 },
  flameText: { fontSize: 16 },
  flameTextSmall: { fontSize: 12 },
  heart3DWrapper: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heart3DShadow: { position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: '#8a1a1a', top: 4, left: 3, opacity: 0.6 },
  heart3DShadow2: { position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: '#cc2a2a', top: 2, left: 1.5, opacity: 0.8 },
  heart3DBase: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ff3b30', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', shadowColor: '#ff3b30', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  heartEmoji: { fontSize: 28, marginTop: -2 },
  heartHighlight: { position: 'absolute', top: 6, left: 10, width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.35)' },
  winkFace: { position: 'absolute', width: 32, height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, top: 14 },
  eye: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  eyeText: { color: 'white', fontSize: 4, fontWeight: '900', marginTop: -1 },
  smile: { position: 'absolute', bottom: -4, fontSize: 10, color: 'rgba(0,0,0,0.7)', fontWeight: '900' },
  logoTextColumn: { alignItems: 'flex-start' },
  logoEpicText: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5, textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 12 },
  logoTaglineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  taglineDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#00d084' },
  logoTagline: { color: '#aaa', fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  logoSmallContainer: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  heart3DWrapperSmall: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heart3DShadowSmall: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: '#8a1a1a', top: 2, left: 2, opacity: 0.6 },
  heart3DBaseSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ff3b30', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  heartEmojiSmall: { fontSize: 18, marginTop: -1 },
  winkFaceSmall: { position: 'absolute', width: 20, height: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, top: 8 },
  eyeSmall: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  eyeTextSmall: { color: 'white', fontSize: 3, fontWeight: '900' },
  smileSmall: { position: 'absolute', bottom: -3, fontSize: 6, color: 'rgba(0,0,0,0.7)', fontWeight: '900' },
  loadingLogoWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },

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
  onboardingContainer: { flex: 1, width: '100%', backgroundColor: '#08080a', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  onboardingGlow: { position: 'absolute', top: -100, left: -50, right: -50, height: 400, backgroundColor: '#ff3b30', opacity: 0.15, borderRadius: 200 },
  onboardingHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  onboardingLogo: { color: 'white', fontSize: 20, fontWeight: '900', marginLeft: 4 },
  onboardingSkip: { color: '#666', fontSize: 13, fontWeight: '700' },
  onboardingSlide: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  onboardingIconCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  onboardingIcon: { fontSize: 48 },
  onboardingTitle: { color: 'white', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  onboardingSubtitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  onboardingDesc: { color: '#999', fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 20 },
  onboardingDots: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  onboardingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  onboardingDotActive: { width: 24 },
  onboardingButtons: { flexDirection: 'row', gap: 12, width: '100%', paddingBottom: 40 },
  onboardingPrimary: { flex: 1, backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  onboardingPrimaryText: { color: 'white', fontWeight: '800', fontSize: 15 },
  onboardingSecondary: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  onboardingSecondaryText: { color: '#888', fontWeight: '700', fontSize: 14 },
  socialProofBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)', borderRadius: 20, padding: 14, width: '100%', maxWidth: 380, alignSelf: 'center', marginBottom: 12 },
  socialProofAvatars: { flexDirection: 'row' },
  socialProofAvatarWrapper: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#151515' },
  socialProofAvatar: { width: 40, height: 40 },
  socialProofLock: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  socialProofLockText: { fontSize: 12 },
  socialProofTitle: { color: 'white', fontSize: 13, fontWeight: '800' },
  socialProofSub: { color: '#ff8a7a', fontSize: 11, marginTop: 2, fontWeight: '600' },
  socialProofCta: { backgroundColor: '#ff3b30', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  socialProofCtaText: { color: 'white', fontSize: 11, fontWeight: '800' },
  paywallOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 200, alignItems: 'center', justifyContent: 'center', padding: 20 },
  paywallContainer: { width: '100%', maxWidth: 360, backgroundColor: '#151515', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  paywallHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  paywallTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  paywallClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  paywallCloseText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  paywallGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  paywallCard: { width: '30%', aspectRatio: 0.8, borderRadius: 16, overflow: 'hidden', backgroundColor: '#222' },
  paywallImage: { width: '100%', height: '100%' },
  paywallBlurOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  paywallBlurText: { fontSize: 20 },
  paywallBenefits: { gap: 8, marginBottom: 20 },
  paywallBenefit: { color: '#aaa', fontSize: 13 },
  paywallPrimary: { backgroundColor: '#ff3b30', borderRadius: 100, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  paywallPrimaryText: { color: 'white', fontWeight: '800', fontSize: 14 },
  paywallSecondary: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, paddingVertical: 14, alignItems: 'center' },
  paywallSecondaryText: { color: '#888', fontWeight: '700', fontSize: 13 },
  nearbyMapMock: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 20, width: '100%', marginBottom: 16, height: 140, position: 'relative', overflow: 'hidden' },
  nearbyMapTitle: { color: 'white', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  nearbyMapDots: { flex: 1, position: 'relative' },
  nearbyMapDot: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,59,48,0.3)', borderWidth: 2, borderColor: '#ff3b30', alignItems: 'center', justifyContent: 'center' },
  nearbyMapDotText: { color: '#ff3b30', fontSize: 16, fontWeight: '900' },
  nearbyMapSub: { color: '#666', fontSize: 11, marginTop: 8 },
  nearbyCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 16, marginBottom: 10, width: '100%' },
  nearbyAvatar: { width: 60, height: 60, borderRadius: 30 },
  nearbyName: { color: 'white', fontSize: 15, fontWeight: '800' },
  nearbyCountBadge: { backgroundColor: '#ff3b30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  nearbyCountText: { color: 'white', fontSize: 10, fontWeight: '800' },
  nearbyLocation: { color: '#aaa', fontSize: 12, marginTop: 4 },
  nearbyTime: { color: '#666', fontSize: 11, marginTop: 2 },
  nearbyActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  nearbyActionNo: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  nearbyActionNoText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  nearbyActionYes: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ff3b30', alignItems: 'center', justifyContent: 'center' },
  nearbyActionYesText: { color: 'white', fontSize: 14 },
  nearbyActionSuper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(46,140,255,0.2)', borderWidth: 1, borderColor: 'rgba(46,140,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  nearbyActionSuperText: { fontSize: 14 },
  matchCardExpiring: { borderColor: '#ffcc00', backgroundColor: 'rgba(255,204,0,0.08)' },
  expiryPill: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginTop: 6, alignSelf: 'flex-start' },
  expiryPillUrgent: { backgroundColor: 'rgba(255,204,0,0.15)', borderWidth: 1, borderColor: '#ffcc00' },
  expiryText: { color: '#888', fontSize: 11, fontWeight: '600' },
  expiryTextUrgent: { color: '#ffcc00', fontWeight: '800' },
  emptySubPremium: { color: '#666', fontSize: 11, marginTop: 6, textAlign: 'center' },
  swipeBtnBoost: { backgroundColor: 'rgba(255,122,46,0.15)', borderColor: 'rgba(255,122,46,0.3)', width: 48, height: 48, borderRadius: 24 },
  swipeBtnBoostActive: { backgroundColor: 'rgba(0,208,132,0.2)', borderColor: '#00d084' },
  swipeBtnBoostText: { fontSize: 18 },
  boostCard: { backgroundColor: 'rgba(255,122,46,0.1)', borderWidth: 1, borderColor: 'rgba(255,122,46,0.2)', borderRadius: 20, padding: 16, width: '100%', marginBottom: 12 },
  boostCardActive: { backgroundColor: 'rgba(0,208,132,0.12)', borderColor: '#00d084' },
  boostCardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,122,46,0.2)', alignItems: 'center', justifyContent: 'center' },
  boostCardTitle: { color: 'white', fontSize: 14, fontWeight: '800' },
  boostCardSub: { color: '#aaa', fontSize: 11, marginTop: 2 },
  boostCardCta: { backgroundColor: '#ff7a2e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  boostCardCtaActive: { backgroundColor: '#00d084' },
  boostCardCtaText: { color: 'white', fontSize: 11, fontWeight: '800' },
  verifyCard: { backgroundColor: 'rgba(46,140,255,0.08)', borderWidth: 1, borderColor: 'rgba(46,140,255,0.2)', borderRadius: 20, padding: 16, width: '100%', marginBottom: 12 },
  verifyCardDone: { backgroundColor: 'rgba(0,208,132,0.08)', borderColor: 'rgba(0,208,132,0.2)' },
  verifyCardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(46,140,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  verifyCardIconDone: { backgroundColor: 'rgba(0,208,132,0.15)' },
  verifyCardTitle: { color: 'white', fontSize: 14, fontWeight: '800' },
  verifyCardSub: { color: '#aaa', fontSize: 11, marginTop: 2 },
  verifyCardCta: { backgroundColor: '#2e8cff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  verifyCardCtaText: { color: 'white', fontSize: 11, fontWeight: '800' },
  premiumCardBanner: { backgroundColor: 'rgba(255,204,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,204,0,0.2)', borderRadius: 20, padding: 16, width: '100%', marginBottom: 12 },
  premiumBannerTitle: { color: '#ffcc00', fontSize: 14, fontWeight: '800' },
  premiumBannerSub: { color: '#aaa', fontSize: 11, marginTop: 4, lineHeight: 16 },
  boostOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,8,10,0.96)', zIndex: 300, alignItems: 'center', justifyContent: 'center', padding: 24 },
  boostGlow: { position: 'absolute', top: '30%', left: -50, right: -50, height: 300, backgroundColor: '#ff7a2e', opacity: 0.2, borderRadius: 200 },
  boostEmoji: { fontSize: 64, marginBottom: 16 },
  boostTitle: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  boostSub: { color: '#ff7a2e', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 },
  boostTimerBox: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, paddingVertical: 20, paddingHorizontal: 32, alignItems: 'center', marginBottom: 20 },
  boostTimer: { color: 'white', fontSize: 36, fontWeight: '900' },
  boostTimerSub: { color: '#888', fontSize: 12, marginTop: 4, textTransform: 'uppercase' },
  boostDesc: { color: '#999', fontSize: 13, textAlign: 'center', marginBottom: 32 },
  boostClose: { backgroundColor: '#ff7a2e', borderRadius: 100, paddingVertical: 16, paddingHorizontal: 32, width: '100%', maxWidth: 320, alignItems: 'center' },
  boostCloseText: { color: 'white', fontWeight: '800', fontSize: 14 },
  verifyOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 300, alignItems: 'center', justifyContent: 'center', padding: 20 },
  verifyContainer: { width: '100%', maxWidth: 360, backgroundColor: '#151515', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  verifyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  verifyTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  verifyClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  verifyCloseText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  verifyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(46,140,255,0.15)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  verifyIcon: { fontSize: 36 },
  verifyDesc: { color: '#aaa', fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 20 },
  verifySteps: { gap: 8, marginBottom: 24 },
  verifyStep: { color: '#888', fontSize: 13 },
  verifyPrimary: { backgroundColor: '#2e8cff', borderRadius: 100, paddingVertical: 16, alignItems: 'center' },
  verifyPrimaryText: { color: 'white', fontWeight: '800', fontSize: 14 },
  verifyCameraMock: { height: 200, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 2, borderColor: 'rgba(46,140,255,0.3)', borderStyle: 'dashed', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  verifyCameraText: { fontSize: 48, marginBottom: 12 },
  verifyCameraSub: { color: '#666', fontSize: 12 },
  premiumPaywallOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.94)', zIndex: 300, alignItems: 'center', justifyContent: 'flex-end' },
  premiumPaywallContainer: { width: '100%', maxWidth: 400, backgroundColor: '#111113', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: '90%' },
  premiumPlans: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  premiumPlanCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 14, position: 'relative' },
  premiumPlanActive: { borderColor: '#ff3b30', backgroundColor: 'rgba(255,59,48,0.08)' },
  premiumPlanPopular: { borderColor: '#ffcc00' },
  popularBadge: { position: 'absolute', top: -8, alignSelf: 'center', backgroundColor: '#ffcc00', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  popularText: { color: 'black', fontSize: 8, fontWeight: '900' },
  planName: { color: 'white', fontSize: 13, fontWeight: '800', marginTop: 8 },
  planPrice: { color: 'white', fontSize: 18, fontWeight: '900', marginTop: 4 },
  planSub: { color: '#666', fontSize: 10, marginTop: 2 },
  planFeatures: { marginTop: 12, gap: 4 },
  planFeature: { color: '#888', fontSize: 10 },
  paywallLegal: { color: '#555', fontSize: 10, textAlign: 'center', marginTop: 12 },
  voiceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, marginBottom: 12, width: '100%' },
  voiceSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginTop: 8, width: '100%' },
  voicePlayButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ff3b30', alignItems: 'center', justifyContent: 'center' },
  voicePlaySmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  voicePlayText: { color: 'white', fontSize: 12, fontWeight: '900', marginLeft: 2 },
  voicePlayTextSmall: { color: 'white', fontSize: 10, fontWeight: '900', marginLeft: 1 },
  voiceWaveRow: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 20 },
  voiceBar: { width: 3, borderRadius: 2 },
  voiceTranscript: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6, lineHeight: 14 },
  voiceDuration: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginLeft: 8 },
  voiceDurationText: { color: '#aaa', fontSize: 10, fontWeight: '700' },
  compatBadge: { borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.4)' },
  compatText: { fontSize: 11, fontWeight: '800' },
  iceBreakerContainer: { backgroundColor: 'rgba(46,140,255,0.08)', borderWidth: 1, borderColor: 'rgba(46,140,255,0.15)', borderRadius: 20, padding: 14, marginTop: 12, width: '100%' },
  iceBreakerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iceBreakerTitle: { color: '#8ab4ff', fontSize: 12, fontWeight: '800' },
  aiBadge: { backgroundColor: '#2e8cff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  aiBadgeText: { color: 'white', fontSize: 9, fontWeight: '900' },
  iceBreakerChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  iceBreakerText: { color: 'white', fontSize: 13, lineHeight: 18 },
});
