import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
// Pantallas
import ExploreScreen from '../screens/ExploreScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDarkMode ? '#8E8E93' : '#8E8E93',
        tabBarShowLabel: true,

        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
          borderTopWidth: 0,

          // Altura dinámica con más espacio
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          paddingHorizontal: 20,

          // Bordes redondeados en la parte superior
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,

          // Sombras más pronunciadas para efecto flotante
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },

        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconSize = focused ? 26 : 24;

          if (route.name === 'Mapa') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Explorar') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else {
            iconName = 'alert';
          }

          return (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Ionicons name={iconName} size={iconSize} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Mapa"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Mapa',
        }}
      />
      <Tab.Screen
        name="Explorar"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explorar',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconContainerActive: {
    transform: [{ scale: 1.05 }],
  },
});