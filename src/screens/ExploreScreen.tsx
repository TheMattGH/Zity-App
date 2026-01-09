import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedCard } from '../components/AnimatedCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { CustomHeader } from '../components/CustomHeader';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../services/supabase';
import { exploreStyles as styles } from '../styles/screens/exploreStyles';
import { LocationModel, RootStackParamList } from '../types';


export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDarkMode } = useTheme();

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

  const renderItem = ({ item, index }: { item: LocationModel; index: number }) => (
    <AnimatedCard
      item={item}
      index={index}
      onPress={() => navigation.navigate('Detail', { place: item })}
    />
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: isDarkMode ? '#1C1C1E' : '#f8f9fa' }]}
      edges={['top']}
    >
      <CustomHeader
        title="Descubre Cuenca"
        subtitle={`${filteredLocations.length} lugares encontrados`}
      />
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
              <View>
                {/* BARRA DE BÚSQUEDA */}
                <View style={[
                  styles.searchBarContainer,
                  {
                    backgroundColor: isDarkMode ? '#2C2C2E' : 'white',
                    borderColor: isDarkMode ? '#3A3A3C' : '#eee'
                  }
                ]}>
                  <Ionicons name="search" size={20} color={isDarkMode ? '#8E8E93' : '#888'} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Buscar lugares, cafés, parques..."
                    style={[styles.searchInput, { color: isDarkMode ? '#FFF' : '#333' }]}
                    placeholderTextColor={isDarkMode ? '#8E8E93' : '#999'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    clearButtonMode="while-editing"
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
                <Ionicons name="search-outline" size={50} color={isDarkMode ? '#666' : '#ccc'} />
                <Text style={[styles.emptyText, { color: isDarkMode ? '#B0B0B0' : '#999' }]}>
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