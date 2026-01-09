import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';

export type UserProfile = {
  id: string;
  email: string;
  display_name: string | null;
};

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsGuest(true);
        setUserProfile(null);
        return;
      }

      setIsGuest(false);
      setUserProfile({
        id: user.id,
        email: user.email || '',
        display_name: user.user_metadata?.display_name || null,
      });
      setEditName(user.user_metadata?.display_name || '');
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: editName.trim() }
      });

      if (error) throw error;

      setUserProfile(prev => prev ? { ...prev, display_name: editName.trim() } : null);
      Alert.alert('✓ Guardado', 'Tu perfil ha sido actualizado');
      return true;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setIsGuest(true);
  };

  return {
    userProfile,
    isGuest,
    editName,
    setEditName,
    saving,
    loadUserProfile,
    handleSaveProfile,
    handleLogout,
  };
};
