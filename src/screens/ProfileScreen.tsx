import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomHeader } from '../components/CustomHeader';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../hooks/useFavorites';
import { useUserProfile } from '../hooks/useUserProfile';
import { profileStyles as styles } from '../styles/screens/profileStyles';
import { LocationModel, RootStackParamList } from '../types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Estados para el modal de edición
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Hooks personalizados
  const {
    userProfile,
    isGuest,
    editName,
    setEditName,
    saving,
    loadUserProfile,
    handleSaveProfile,
    handleLogout,
  } = useUserProfile();

  const { favorites, loading, loadFavorites, clearFavorites } = useFavorites();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Cargar datos cada vez que la pantalla tenga foco
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadFavorites();
    }, [loadUserProfile, loadFavorites])
  );

  const handleSaveProfileAndClose = async () => {
    const success = await handleSaveProfile();
    if (success) {
      setEditModalVisible(false);
    }
  };

  const handleLogoutWithConfirm = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            handleLogout();
            clearFavorites();
          }
        }
      ]
    );
  };

  const handlePlacePress = (place: LocationModel) => {
    navigation.navigate('Detail', { place });
  };

  const handleLogin = () => {
    navigation.navigate('Auth', { isRegister: false });
  };

  const handleRegister = () => {
    navigation.navigate('Auth', { isRegister: true });
  };

  const renderFavoriteItem = ({ item }: { item: LocationModel }) => (
    <TouchableOpacity
      style={[
        styles.favoriteItem,
        { backgroundColor: isDarkMode ? '#2C2C2E' : '#f9f9f9' }
      ]}
      onPress={() => handlePlacePress(item)}
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
        style={styles.favoriteImage}
      />
      <View style={styles.favoriteInfo}>
        <Text style={[styles.favoriteName, { color: isDarkMode ? '#FFF' : '#333' }]}>{item.name}</Text>
        <Text style={[styles.favoriteCategory, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  // Vista para invitados (no logueados)
  if (isGuest) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }]}
        edges={['top']}
      >
        <CustomHeader
          title="Perfil"
          subtitle="Inicia sesión para continuar"
        />
        <ScrollView contentContainerStyle={[styles.guestContainer, { paddingBottom: 120 }]}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="person-outline" size={50} color="#007AFF" />
          </View>
          <Text style={[styles.guestTitle, { color: isDarkMode ? '#FFF' : '#333', fontSize: 24 }]}>
            Modo Invitado
          </Text>
          <Text style={[styles.guestSubtitle, { color: isDarkMode ? '#B0B0B0' : '#666', marginBottom: 20 }]}>
            Inicia sesión para guardar tus lugares favoritos y personalizar tu experiencia
          </Text>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          <View style={[styles.featuresContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}>
            <Text style={[styles.featuresTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>Con una cuenta podrás:</Text>
            <View style={styles.featureRow}>
              <Ionicons name="heart" size={18} color="#FF3B30" />
              <Text style={[styles.featureItem, { color: isDarkMode ? '#CCC' : '#555' }]}>Guardar lugares favoritos</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={[styles.featureItem, { color: isDarkMode ? '#CCC' : '#555' }]}>Escribir reseñas</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="sync" size={18} color="#007AFF" />
              <Text style={[styles.featureItem, { color: isDarkMode ? '#CCC' : '#555' }]}>Sincronizar en todos tus dispositivos</Text>
            </View>
          </View>

          {/* Botón de modo oscuro para invitados */}
          <TouchableOpacity
            onPress={toggleDarkMode}
            style={[
              styles.darkModeButton,
              {
                backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                marginTop: 20,
                marginBottom: 40
              }
            ]}
          >
            <Ionicons
              name={isDarkMode ? 'sunny' : 'moon'}
              size={20}
              color={isDarkMode ? '#FFA500' : '#007AFF'}
            />
            <Text style={[styles.darkModeText, { color: isDarkMode ? '#FFF' : '#333' }]}>
              {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }]}
      edges={['top']}
    >
      <CustomHeader
        title="Mi Perfil"
        subtitle={userProfile?.email || ''}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header del perfil */}
        <View style={[styles.header, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#eee' }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={[styles.userName, { color: isDarkMode ? '#FFF' : '#333' }]}>
            {userProfile?.display_name || 'Usuario'}
          </Text>
          <Text style={[styles.userEmail, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>
            {userProfile?.email}
          </Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <View style={styles.editButtonContent}>
              <Ionicons name="pencil" size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Ionicons name="library" size={20} color="#FF3B30" />
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>Mis Favoritos</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={50} color={isDarkMode ? '#666' : '#999'} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>Aún no tienes favoritos</Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#8E8E93' : '#999' }]}>Explora lugares y agrégalos a tu lista</Text>
          </View>
        ) : (
          <View style={styles.listContent}>
            {favorites.map((item) => (
              <View key={item.id}>
                {renderFavoriteItem({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Botón de modo oscuro */}
        <TouchableOpacity
          onPress={toggleDarkMode}
          style={[
            styles.darkModeButton,
            { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }
          ]}
        >
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon'}
            size={20}
            color={isDarkMode ? '#FFA500' : '#007AFF'}
          />
          <Text style={[styles.darkModeText, { color: isDarkMode ? '#FFF' : '#333' }]}>
            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </Text>
        </TouchableOpacity>

        {/* Botón cerrar sesión al final */}
        <TouchableOpacity onPress={handleLogoutWithConfirm} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

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
                onPress={handleSaveProfileAndClose}
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