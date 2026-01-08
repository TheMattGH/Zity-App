import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

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
    <ScrollView style={styles.container}>
      <Image source={{ uri: place.image_url }} style={styles.image} resizeMode="cover"/>

      {/* Botón de volver flotante */}
      <TouchableOpacity 
        style={[styles.backButton, { top: favButtonTop }]} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Botón de favorito flotante */}
      <TouchableOpacity 
        style={[styles.favButton, { top: favButtonTop }]} 
        onPress={handleToggleFavorite}
      >
        <Text style={styles.favIcon}>{isFav ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{place.name}</Text>
        <Text style={styles.subtitle}>Cuenca, Ecuador</Text>
        <Text style={styles.description}>{place.description}</Text>

        {/* BOTÓN DE ACCIÓN PRINCIPAL */}
        <TouchableOpacity style={styles.navButton} onPress={handleNavigation}>
          <Text style={styles.navButtonText}>🚶 Ver ruta a pie</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Reseñas</Text>
        
        {loading ? (
          <ActivityIndicator color="#007AFF" />
        ) : reviews.length === 0 ? (
          <Text style={styles.noReviews}>Sé el primero en opinar.</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.userName}>{review.user_name}</Text>
                <Text style={styles.stars}>{renderStars(review.rating)}</Text>
              </View>
              <Text style={styles.comment}>{review.comment}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 280 },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4, marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, color: '#444' },
  
  // Botón de volver flotante
  backButton: {
    position: 'absolute',
    left: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  backIcon: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
  },

  // Botón de favorito flotante sobre la imagen
  favButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  favIcon: {
    fontSize: 22,
  },

  // Estilo para el botón grande y bonito
  navButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  noReviews: { fontStyle: 'italic', color: '#888' },
  reviewCard: { 
    backgroundColor: '#f9f9f9', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  userName: { fontWeight: 'bold', fontSize: 14 },
  stars: { color: '#FFD700', fontSize: 16 },
  comment: { fontSize: 14, color: '#555' },
});