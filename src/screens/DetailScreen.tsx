import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { place } = route.params; // Recibimos el lugar
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
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
    };

    fetchReviews();
  }, [place.id]);

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  // ESTA ES LA FUNCIÓN CLAVE
  const handleNavigation = () => {
    // Volvemos al Home, pero le pasamos el objeto 'place' como objetivo
    navigation.reset({
    index: 0,
    routes: [
      {
        name: 'Home',
        params: { targetLocation: place }, // Pasamos el destino
      },
    ],
  });
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: place.image_url }} style={styles.image} resizeMode="cover"/>

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
  image: { width: '100%', height: 250 },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4, marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, color: '#444' },
  
  // Estilo nuevo para el botón grande y bonito
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