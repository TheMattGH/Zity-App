import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Mantener el splash screen visible mientras cargamos
SplashScreen.preventAutoHideAsync();

// Imagen del splash
const splashImage = require('./assets/images/splash-icon.png');

export default function App(): React.JSX.Element {
    const [appIsReady, setAppIsReady] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const fadeAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        async function prepare() {
            try {
                // Aquí puedes añadir tareas de precarga (fonts, assets, etc.)
                // Delay para mostrar el branding
                await new Promise(resolve => setTimeout(resolve, 2500));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            // Ocultar el splash screen nativo
            await SplashScreen.hideAsync();

            // Animar la transición
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 2500,
                useNativeDriver: true,
            }).start(() => {
                setShowSplash(false);
            });
        }
    }, [appIsReady, fadeAnim]);

    useEffect(() => {
        if (appIsReady) {
            onLayoutRootView();
        }
    }, [appIsReady, onLayoutRootView]);

    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <View style={styles.container}>
                    <AppNavigator />

                    {/* Splash screen personalizado con animación */}
                    {showSplash && (
                        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
                            <Image source={splashImage} style={styles.splashImage} resizeMode="contain" />
                        </Animated.View>
                    )}
                </View>
            </SafeAreaProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    splashContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    splashTitle: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 2,
    },
    splashSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 10,
    },
});
