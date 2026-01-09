import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: { id: string; icon: IconName }[] = [
  { id: 'Todos', icon: 'globe-outline' },
  { id: 'Parques', icon: 'leaf-outline' },
  { id: 'Museos', icon: 'business-outline' },
  { id: 'Miradores', icon: 'telescope-outline' },
  { id: 'Cafeterías', icon: 'cafe-outline' },
];

interface Props {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: Props) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.contentContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              selectedCategory === cat.id && styles.chipSelected
            ]}
            onPress={() => onSelectCategory(cat.id)}
          >
            <View style={styles.chipContent}>
              <Ionicons 
                name={cat.icon} 
                size={16} 
                color={selectedCategory === cat.id ? 'white' : '#444'} 
              />
              <Text style={[
                styles.text,
                selectedCategory === cat.id && styles.textSelected
              ]}>
                {cat.id}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ELIMINAMOS position: 'absolute' y top/left/right
  wrapper: {
    paddingVertical: 10, // Un poco de aire arriba y abajo del scroll
  },
  contentContainer: {
    paddingHorizontal: 20, // Para que el primer botón no se pegue al borde izquierdo
    paddingRight: 10,
  },
  chip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10, // Botones un poco más gorditos y fáciles de tocar
    borderRadius: 25,    // Más redondeados
    marginRight: 12,     // Más espacio entre botones
    
    // Sombras más sutiles y elegantes
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    // Sombra azulada cuando está activo
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontWeight: '600',
    color: '#444',
    fontSize: 15,
  },
  textSelected: {
    color: 'white',
    fontWeight: 'bold',
  }
});