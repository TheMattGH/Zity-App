import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MapToolbarProps {
    onCenterLocation: () => void;
    onToggleMapType: () => void;
    mapType?: 'standard' | 'satellite' | 'hybrid';
}

export const MapToolbar = ({
    onCenterLocation,
    onToggleMapType,
    mapType = 'standard',
}: MapToolbarProps) => {
    const { isDarkMode } = useTheme();
    return (
        <View style={styles.container}>
            {/* Botón de centrar ubicación */}
            <TouchableOpacity
                style={[styles.toolButton, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={onCenterLocation}
                activeOpacity={0.7}
            >
                <Ionicons name="locate" size={22} color={isDarkMode ? '#0A84FF' : '#007AFF'} />
            </TouchableOpacity>

            {/* Botón de cambiar tipo de mapa */}
            <TouchableOpacity
                style={[styles.toolButton, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={onToggleMapType}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={mapType === 'satellite' ? 'map' : 'layers'}
                    size={22}
                    color={isDarkMode ? '#0A84FF' : '#007AFF'}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        right: 16,
        flexDirection: 'column',
        gap: 12,
    },
    toolButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
});
