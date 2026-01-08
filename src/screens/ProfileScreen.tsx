import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../services/supabase';
import { LocationModel, RootStackParamList } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type UserProfile = {
  id: string;
  email: string;
  display_name: string | null;
};

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [favorites, setFavorites] = useState<LocationModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  
  // Estados para el modal de edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Cargar datos cada vez que la pantalla tenga foco
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadFavorites();
    }, [])
  );

  const loadUserProfile = async () => {
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
  };

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('location_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      const locationIds = favData.map(f => f.location_id);

      if (locationIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data: placesData, error: placesError } = await supabase
        .from('locations')
        .select('*')
        .in('id', locationIds);

      if (placesError) throw placesError;
      if (placesData) setFavorites(placesData as LocationModel[]);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
      setEditModalVisible(false);
      Alert.alert('✓ Guardado', 'Tu perfil ha sido actualizado');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            setUserProfile(null);
            setIsGuest(true);
            setFavorites([]);
          }
        }
      ]
    );
  };

  const handleLogin = () => {
    navigation.navigate('Auth', { isRegister: false });
  };

  const handleRegister = () => {
    navigation.navigate('Auth', { isRegister: true });
  };

  const handlePlacePress = (place: LocationModel) => {
    navigation.navigate('Detail', { place });
  };

  const renderFavoriteItem = ({ item }: { item: LocationModel }) => (
    <TouchableOpacity style={styles.favoriteItem} onPress={() => handlePlacePress(item)}>
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/80' }} 
        style={styles.favoriteImage} 
      />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoriteCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  // Vista para invitados (no logueados)
  if (isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.guestContainer}>
          <Text style={styles.guestEmoji}>👤</Text>
          <Text style={styles.guestTitle}>Modo Invitado</Text>
          <Text style={styles.guestSubtitle}>
            Inicia sesión para guardar tus lugares favoritos y personalizar tu experiencia
          </Text>
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Con una cuenta podrás:</Text>
            <Text style={styles.featureItem}>❤️ Guardar lugares favoritos</Text>
            <Text style={styles.featureItem}>⭐ Escribir reseñas</Text>
            <Text style={styles.featureItem}>📍 Sincronizar en todos tus dispositivos</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header del perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </View>
        <Text style={styles.userName}>
          {userProfile?.display_name || 'Usuario'}
        </Text>
        <Text style={styles.userEmail}>{userProfile?.email}</Text>
        
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>❤️ Mis Favoritos</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyText}>Aún no tienes favoritos</Text>
          <Text style={styles.emptySubtext}>Explora lugares y agrégalos a tu lista</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Botón cerrar sesión al final */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Modal de edición de perfil */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Tu nombre"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalSaveButton, saving && styles.buttonDisabled]} 
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Estilos para vista de invitado
  guestContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guestEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  registerButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },

  // Header del perfil logueado
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Sección de favoritos
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtext: {
    color: 'gray',
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  favoriteInfo: {
    marginLeft: 12,
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Botón cerrar sesión
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 100,
    padding: 14,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal de edición
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  modalSaveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});