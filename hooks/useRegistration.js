// hooks/useRegistration.js - Giorno 8.3 - Logica Registrazione
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_REGISTERED: 'fh_userRegistered',
  USER_DATA: 'fh_userData',
  MY_PROFILE: 'fh_myProfile',
  ONBOARDING_DONE: 'fh_onboardingDone',
};

export function useRegistration() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRegistration();
  }, []);

  const checkRegistration = async () => {
    try {
      const registered = await AsyncStorage.getItem(STORAGE_KEYS.USER_REGISTERED);
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (registered === 'true' && data) {
        setIsRegistered(true);
        setUserData(JSON.parse(data));
      }
    } catch (e) {
      console.log('check reg error', e);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_REGISTERED, 'true');
      // Aggiorna anche myProfile per compatibilità con Giorno 7
      await AsyncStorage.setItem(STORAGE_KEYS.MY_PROFILE, JSON.stringify({
        name: data.name,
        age: data.age,
        city: data.city,
        bio: data.bio,
        longBio: data.bio,
        photo: data.photo,
        myVibes: data.myVibes,
      }));
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
      setIsRegistered(true);
      setUserData(data);
      return true;
    } catch (e) {
      console.log('register error', e);
      return false;
    }
  };

  const skipRegistration = async () => {
    // Usa profilo default ma segna come registrato per non chiedere più
    await AsyncStorage.setItem(STORAGE_KEYS.USER_REGISTERED, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    setIsRegistered(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_REGISTERED);
    setIsRegistered(false);
    setUserData(null);
  };

  return { isRegistered, userData, loading, register, skipRegistration, logout, checkRegistration };
}
