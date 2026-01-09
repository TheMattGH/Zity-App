import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { detailStyles as styles } from '../styles/screens/detailStyles';
import { RootStackParamList } from '../types';

// Tipado correcto para las props de navegación
type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

type Review = {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function DetailScreen({ route, navigation }: Props) {
  const { place } = route.params;
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de entrada del contenido
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateFavorite = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('location_id', place.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReviews(data);
    } catch (error) {
      console.log('Error reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [place.id]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsFav(false);
        return;
      }

      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('location_id', place.id)
        .single();

      setIsFav(!!data);
    } catch {
      setIsFav(false);
    }
  }, [place.id]);

  useEffect(() => {
    fetchReviews();
    checkFavoriteStatus();
  }, [fetchReviews, checkFavoriteStatus]);

  // Guardar/Borrar en SUPABASE
  const handleToggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Si no hay usuario, pedimos que inicie sesión
      if (!user) {
        Alert.alert(
          '❤️ Guardar Favorito',
          'Para guardar lugares favoritos necesitas una cuenta. ¿Deseas iniciar sesión?',
          [
            { text: 'Ahora no', style: 'cancel' },
            {
              text: 'Iniciar Sesión',
              onPress: () => navigation.navigate('Auth')
            }
          ]
        );
        return;
      }

      if (isFav) {
        // SI YA ES FAVORITO -> BORRAMOS
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('location_id', place.id);

        if (!error) setIsFav(false);
      } else {
        // SI NO ES FAVORITO -> INSERTAMOS
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, location_id: place.id });

        if (!error) setIsFav(true);
      }
      animateFavorite();
    } catch (e) { console.log(e); }
  };

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  // ESTA ES LA FUNCIÓN CLAVE
  const handleNavigation = () => {
    navigation.navigate('MainTabs', {
      screen: 'Mapa',
      params: { targetLocation: place },
    } as any);
  };

  // Calcular el top dinámico para el botón de favorito
  const favButtonTop = Platform.OS === 'ios' ? insets.top + 10 : insets.top + 15;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }]}>

      <Image source={{ uri: place.image_url }} style={styles.image} resizeMode="cover" />

      {/* Botón de volver flotante */}
      <TouchableOpacity
        style={[
          styles.backButton,
          {
            top: favButtonTop,
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'
          }
        ]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#FFF' : '#333'} />
      </TouchableOpacity>

      {/* Botón de favorito flotante */}
      <TouchableOpacity
        style={[
          styles.favButton,
          {
            top: favButtonTop,
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'
          }
        ]}
        onPress={handleToggleFavorite}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={22}
            color={isFav ? '#FF3B30' : (isDarkMode ? '#FFF' : '#333')}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#333' }]}>{place.name}</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>Cuenca, Ecuador</Text>
        <Text style={[styles.description, { color: isDarkMode ? '#E0E0E0' : '#444' }]}>{place.description}</Text>

        {/* BOTÓN DE ACCIÓN PRINCIPAL */}
        <TouchableOpacity style={styles.navButton} onPress={handleNavigation}>
          <Ionicons name="navigate" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.navButtonText}>Ver ruta</Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333' : '#eee' }]} />

        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>Reseñas</Text>

        {loading ? (
          <ActivityIndicator color="#007AFF" />
        ) : reviews.length === 0 ? (
          <Text style={[styles.noReviews, { color: isDarkMode ? '#aaa' : '#888' }]}>Sé el primero en opinar.</Text>
        ) : (
          reviews.map((review) => (
            <View
              key={review.id}
              style={[
                styles.reviewCard,
                {
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#f9f9f9',
                  borderColor: isDarkMode ? '#3A3A3C' : '#eee'
                }
              ]}
            >
              <View style={styles.reviewHeader}>
                <Text style={[styles.userName, { color: isDarkMode ? '#FFF' : '#000' }]}>{review.user_name}</Text>
                <Text style={styles.stars}>{renderStars(review.rating)}</Text>
              </View>
              <Text style={[styles.comment, { color: isDarkMode ? '#D0D0D0' : '#555' }]}>{review.comment}</Text>
            </View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}