import { Ionicons } from '@expo/vector-icons';
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <View style={styles.guestIconContainer}>
            <Ionicons name="person-outline" size={60} color="#007AFF" />
          </View>
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
            <View style={styles.featureRow}>
              <Ionicons name="heart" size={18} color="#FF3B30" />
              <Text style={styles.featureItem}>Guardar lugares favoritos</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.featureItem}>Escribir reseñas</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="sync" size={18} color="#007AFF" />
              <Text style={styles.featureItem}>Sincronizar en todos tus dispositivos</Text>
            </View>
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
          <Ionicons name="person-circle" size={60} color="#007AFF" />
        </View>
        <Text style={styles.userName}>
          {userProfile?.display_name || 'Usuario'}
        </Text>
        <Text style={styles.userEmail}>{userProfile?.email}</Text>

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
        <Ionicons name="heart" size={20} color="#FF3B30" />
        <Text style={styles.sectionTitle}>Mis Favoritos</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={50} color="#999" />
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
      <TouchableOpacity onPress={handleLogoutWithConfirm} style={styles.logoutButton}>
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