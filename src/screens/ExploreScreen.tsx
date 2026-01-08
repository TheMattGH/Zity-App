import { Ionicons } from '@expo/vector-icons'; // <--- Importamos iconos
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryFilter } from '../components/CategoryFilter';
import { supabase } from '../services/supabase';
import { LocationModel, RootStackParamList } from '../types';

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [locations, setLocations] = useState<LocationModel[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationModel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtros
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState(''); // <--- Nuevo estado para el texto

  useEffect(() => {
    fetchLocations();
  }, []);

  // Lógica Maestra de Filtrado: Se ejecuta cuando cambia la categoría O el texto
  useEffect(() => {
    let result = locations;

    // 1. Primero filtramos por Categoría
    if (selectedCategory !== 'Todos') {
      result = result.filter(
        place => place.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Luego filtramos por Texto (Buscamos en Nombre o Descripción)
    if (searchQuery.trim().length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(place => 
        place.name.toLowerCase().includes(lowerQuery) || 
        (place.description && place.description.toLowerCase().includes(lowerQuery))
      );
    }

    setFilteredLocations(result);
  }, [selectedCategory, searchQuery, locations]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw error;
      if (data) {
        setLocations(data as LocationModel[]);
        setFilteredLocations(data as LocationModel[]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: LocationModel }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.card} 
      onPress={() => navigation.navigate('Detail', { place: item })}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.cardImage} 
        resizeMode="cover" 
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.category || 'General'}</Text>
            </View>
        </View>
        <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 100 }} size="large" color="#007AFF" />
            ) : (
                <FlatList
                    data={filteredLocations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    
                    // --- ENCABEZADO CON BARRA DE BÚSQUEDA ---
                    ListHeaderComponent={
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerTitle}>Descubre Cuenca</Text>
                            
                            {/* BARRA DE BÚSQUEDA */}
                            <View style={styles.searchBarContainer}>
                                <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
                                <TextInput 
                                    placeholder="Buscar lugares, cafés, parques..." 
                                    style={styles.searchInput}
                                    placeholderTextColor="#999"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery} // Actualiza estado al escribir
                                    clearButtonMode="while-editing" // Botón 'X' en iOS
                                />
                            </View>

                            <View style={styles.filtersWrapper}>
                                <CategoryFilter 
                                    selectedCategory={selectedCategory} 
                                    onSelectCategory={setSelectedCategory} 
                                />
                            </View>
                        </View>
                    }
                    
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🔍</Text>
                            <Text style={styles.emptyText}>
                                No encontramos nada con &quot;{searchQuery}&quot;
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  
  headerContainer: { paddingTop: 10, paddingBottom: 5 },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  
  // ESTILOS DE LA BARRA DE BÚSQUEDA
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15, // Separación con los filtros
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    // Sombras suaves
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee'
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },

  filtersWrapper: { marginBottom: 10 },

  // Tarjetas
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: { padding: 20 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  badgeContainer: {
    backgroundColor: '#EBF5FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cardDescription: { color: '#666', fontSize: 15, lineHeight: 22 },

  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyText: { color: '#999', fontSize: 16, textAlign: 'center' }
});