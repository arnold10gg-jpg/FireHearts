// components/RegistrationForm.js - Giorno 8.3 - Form Registrazione Reale
import { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Animated, Alert } from 'react-native';

let ImagePicker = null;
try { ImagePicker = require('expo-image-picker'); } catch(e){}

const ALL_VIBES_SELECT = ['Avventurosa','Buongustaia','Viaggi','Intensa','Natura','Palestra','Chef','Passionale','Creativa','Arty','Design','Zen','Curiosa','Yoga','Analogica','Vinile','Founder','Business'];

export default function RegistrationForm({ onComplete, onSkip }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [photo, setPhoto] = useState('');
  const [step, setStep] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const pickImage = async () => {
    try {
      if (!ImagePicker) {
        Alert.alert('Info', 'Installa expo-image-picker: npx expo install expo-image-picker. Per ora incolla link https://');
        return;
      }
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso negato', 'Serve permesso foto');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Errore galleria');
    }
  };

  const toggleVibe = (vibe) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      if (selectedVibes.length < 5) {
        setSelectedVibes([...selectedVibes, vibe]);
      } else {
        Alert.alert('Max 5 vibe', 'Puoi scegliere max 5 vibe');
      }
    }
  };

  const nextStep = () => {
    if (step === 1 && (!name.trim() || !age.trim() || !city.trim())) {
      Alert.alert('Completa', 'Nome, età e città sono obbligatori');
      return;
    }
    if (step < 3) {
      Animated.timing(slideAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        setStep(step + 1);
        slideAnim.setValue(0);
      });
    } else {
      // Completa registrazione
      const userData = {
        name: name.trim(),
        age: parseInt(age) || 25,
        city: city.trim(),
        bio: bio.trim() || 'Fondatore di FireHearts.',
        myVibes: selectedVibes.length > 0 ? selectedVibes : ['Avventuroso'],
        photo: photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop',
        registeredAt: Date.now(),
      };
      onComplete(userData);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crea il tuo profilo 🔥</Text>
        <Text style={styles.sub}>Giorno 8 - Registrazione vera - {step}/3</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step/3)*100}%` }]} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Chi sei? 👤</Text>
            <Text style={styles.label}>Nome *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Il tuo nome" placeholderTextColor="#555" />
            <Text style={styles.label}>Età *</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="25" placeholderTextColor="#555" keyboardType="numeric" maxLength={2} />
            <Text style={styles.label}>Città - Qualsiasi città al mondo *</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Tokyo, New York, Torino, Londra..." placeholderTextColor="#555" />
            <Text style={styles.hint}>Puoi scrivere qualsiasi città, non solo Milano/Roma</Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Raccontati ✨</Text>
            <Text style={styles.label}>Bio breve</Text>
            <TextInput style={[styles.input, { height: 80 }]} value={bio} onChangeText={setBio} placeholder="Fondatore di FireHearts, amo codice e persone autentiche..." placeholderTextColor="#555" multiline />
            <Text style={styles.label}>Vibe - Scegli max 5 #️⃣</Text>
            <View style={styles.vibeGrid}>
              {ALL_VIBES_SELECT.map(v => (
                <TouchableOpacity key={v} style={[styles.vibeChip, selectedVibes.includes(v) && styles.vibeChipActive]} onPress={() => toggleVibe(v)}>
                  <Text style={[styles.vibeText, selectedVibes.includes(v) && styles.vibeTextActive]}>#{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>{selectedVibes.length}/5 selezionati: {selectedVibes.join(', ') || 'nessuno'}</Text>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Foto profilo 📸</Text>
            <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
              <Text style={styles.pickText}>📸 Scegli dalla galleria</Text>
            </TouchableOpacity>
            <Text style={styles.label}>O incolla link https://</Text>
            <TextInput style={styles.input} value={photo} onChangeText={setPhoto} placeholder="https://images.unsplash.com/..." placeholderTextColor="#555" />
            {photo ? (
              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <Image source={{ uri: photo }} style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#ff3b30' }} />
                <Text style={styles.hint}>Preview - Foto che vedranno gli altri</Text>
              </View>
            ) : (
              <View style={styles.noPhotoBox}>
                <Text style={{ fontSize: 40 }}>👤</Text>
                <Text style={styles.hint}>Nessuna foto - useremo default</Text>
              </View>
            )}
            <View style={styles.photoFixBox}>
              <Text style={styles.photoFixText}>✅ Usa galleria o link https://{"\n"}❌ Non usare C:\Users\... non funziona</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && <TouchableOpacity style={styles.backBtn} onPress={prevStep}><Text style={styles.backText}>← Indietro</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
          <Text style={styles.nextText}>{step === 3 ? 'Completa 🔥' : 'Avanti →'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
        <Text style={styles.skipText}>Salta per ora (usa profilo default)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080a', paddingTop: 50 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  sub: { color: '#888', fontSize: 12, marginTop: 4 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ff3b30' },
  form: { padding: 20, paddingBottom: 30 },
  stepContainer: { gap: 4 },
  stepTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 16 },
  label: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: 'white', fontSize: 14 },
  hint: { color: '#666', fontSize: 11, marginTop: 6 },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  vibeChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100 },
  vibeChipActive: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  vibeText: { color: '#999', fontSize: 12, fontWeight: '600' },
  vibeTextActive: { color: 'white', fontWeight: '800' },
  pickBtn: { backgroundColor: '#2e8cff', borderRadius: 100, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  pickText: { color: 'white', fontWeight: '800', fontSize: 13 },
  noPhotoBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, marginTop: 16 },
  photoFixBox: { backgroundColor: 'rgba(0,208,132,0.08)', borderWidth: 1, borderColor: 'rgba(0,208,132,0.15)', borderRadius: 12, padding: 12, marginTop: 16 },
  photoFixText: { color: '#00d084', fontSize: 11, lineHeight: 16 },
  footer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  backBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 14, borderRadius: 100, alignItems: 'center' },
  backText: { color: '#888', fontWeight: '700' },
  nextBtn: { flex: 2, backgroundColor: '#ff3b30', paddingVertical: 14, borderRadius: 100, alignItems: 'center' },
  nextText: { color: 'white', fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 12, marginBottom: 20 },
  skipText: { color: '#666', fontSize: 11 },
});
