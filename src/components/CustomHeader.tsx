import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface CustomHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightPress?: () => void;
    variant?: 'default' | 'transparent';
}

export const CustomHeader = ({
    title,
    subtitle,
    showBackButton = false,
    onBackPress,
    rightIcon,
    onRightPress,
    variant = 'default',
}: CustomHeaderProps) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode } = useTheme();

    const isTransparent = variant === 'transparent';

    return (
        <View style={[
            styles.container,
            {
                // Eliminamos paddingTop dinámico porque SafeAreaView ya lo maneja
                paddingTop: 0,
                backgroundColor: isTransparent ? 'transparent' : (isDarkMode ? '#1C1C1E' : '#FFFFFF'),
                borderBottomColor: isDarkMode ? '#2C2C2E' : '#F0F0F0'
            },
            isTransparent && styles.containerTransparent
        ]}>
            <View style={styles.content}>
                {/* Botón izquierdo */}
                <View style={styles.leftSection}>
                    {showBackButton && onBackPress && (
                        <TouchableOpacity
                            onPress={onBackPress}
                            style={styles.iconButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={isTransparent || isDarkMode ? '#FFF' : '#1C1C1E'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Título y subtítulo */}
                <View style={styles.centerSection}>
                    <Text
                        style={[
                            styles.title,
                            { color: isTransparent || isDarkMode ? '#FFF' : '#1C1C1E' },
                            isTransparent && styles.titleTransparent
                        ]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text
                            style={[
                                styles.subtitle,
                                { color: isTransparent ? 'rgba(255, 255, 255, 0.9)' : (isDarkMode ? '#B0B0B0' : '#8E8E93') },
                                isTransparent && styles.subtitleTransparent
                            ]}
                            numberOfLines={1}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Botón derecho */}
                <View style={styles.rightSection}>
                    {rightIcon && onRightPress && (
                        <TouchableOpacity
                            onPress={onRightPress}
                            style={[
                                styles.iconButton,
                                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            ]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={rightIcon}
                                size={24}
                                color={isTransparent || isDarkMode ? '#FFF' : '#1C1C1E'}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    containerTransparent: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 4,
        minHeight: 44,
    },
    leftSection: {
        width: 40,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    rightSection: {
        width: 40,
        alignItems: 'flex-end',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        textAlign: 'center',
    },
    titleTransparent: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#8E8E93',
        marginTop: 2,
        textAlign: 'center',
    },
    subtitleTransparent: {
        color: 'rgba(255, 255, 255, 0.9)',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});
