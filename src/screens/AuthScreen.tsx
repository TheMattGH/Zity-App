import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { authStyles as styles } from '../styles/screens/authStyles';
import { RootStackParamList } from '../types';

// Imagen del logo
const splashImage = require('../../assets/images/splash-icon.png');

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;
type AuthScreenRouteProp = RouteProp<RootStackParamList, 'Auth'>;

export default function AuthScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const route = useRoute<AuthScreenRouteProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Leer parámetro para saber si mostrar registro o login
  useEffect(() => {
    if (route.params?.isRegister) {
      setIsLogin(false);
    }
  }, [route.params]);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // INICIAR SESIÓN
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;

        // Volver a la pantalla anterior después del login
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } else {
        // REGISTRARSE
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              display_name: name.trim(),
            }
          }
        });
        if (error) throw error;

        Alert.alert(
          '¡Bienvenido!',
          'Tu cuenta ha sido creada exitosamente.',
          [{ text: 'OK', onPress: () => navigation.canGoBack() && navigation.goBack() }]
        );
      }
    } catch (error: any) {
      let message = error.message;
      if (message.includes('Invalid login credentials')) {
        message = 'Correo o contraseña incorrectos';
      } else if (message.includes('Email not confirmed')) {
        message = 'Por favor confirma tu correo electrónico';
      } else if (message.includes('User already registered')) {
        message = 'Este correo ya está registrado';
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  const handleSkip = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header con botón cerrar */}
          <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Image source={splashImage} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.title}>Bienvenido a Zity</Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Inicia sesión para guardar tus lugares favoritos'
                : 'Crea tu cuenta para personalizar tu experiencia'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <Text style={styles.switchTextBold}>
                {isLogin ? 'Regístrate' : 'Inicia Sesión'}
              </Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Continuar sin cuenta</Text>
          </TouchableOpacity>

          <Text style={styles.guestNote}>
            Podrás explorar la app, pero no guardarás favoritos
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}