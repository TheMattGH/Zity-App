import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

import AuthScreen from '../screens/AuthScreen';
import DetailScreen from '../screens/DetailScreen';
import { RootStackParamList } from '../types';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Contexto global para la sesión del usuario
type AuthContextType = {
  session: Session | null;
  isGuest: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, isGuest: true });

export const useAuth = () => useContext(AuthContext);

export default function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión actual al iniciar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Escuchar cambios (Login, Logout) en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isGuest = !session?.user;

  if (isLoading) {
    return null; // O un splash screen
  }

  return (
    <AuthContext.Provider value={{ session, isGuest }}>
      <NavigationContainer>
        <Stack.Navigator>
          {/* Siempre mostramos la app principal - modo invitado permitido */}
          <Stack.Screen 
            name="MainTabs" 
            component={BottomTabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Detail" 
            component={DetailScreen} 
            options={{ title: 'Detalle', headerShown: false }} 
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false, presentation: 'modal' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}