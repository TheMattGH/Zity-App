import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LocationModel } from '../types';

interface AnimatedCardProps {
    item: LocationModel;
    index: number;
    onPress: () => void;
}

export const AnimatedCard = ({ item, index, onPress }: AnimatedCardProps) => {
    const { isDarkMode } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, { backgroundColor: isDarkMode ? '#2C2C2E' : 'white' }]}
                onPress={onPress}
            >
                <Image
                    source={{ uri: item.image_url }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>{item.name}</Text>
                        <View style={[styles.badgeContainer, { backgroundColor: isDarkMode ? 'rgba(0,122,255,0.2)' : '#EBF5FF' }]}>
                            <Text style={styles.badgeText}>{item.category || 'General'}</Text>
                        </View>
                    </View>
                    <Text numberOfLines={2} style={[styles.cardDescription, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>{item.description}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
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
});
