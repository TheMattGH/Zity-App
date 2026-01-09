import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    LocationModel,
    RouteInfo,
    TRANSPORT_MODES,
    TransportMode,
} from "../types";

interface Props {
  destination: LocationModel;
  routeInfo: RouteInfo;
  onCancel: () => void;
  onModeChange: (mode: TransportMode) => void;
  isLoading?: boolean;
}

export const RouteCard = ({
  destination,
  routeInfo,
  onCancel,
  onModeChange,
  isLoading = false,
}: Props) => {
  const currentMode = TRANSPORT_MODES.find((m) => m.key === routeInfo.mode);
  
  // Animaciones
  const slideAnim = useRef(new Animated.Value(200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.ceil(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.ceil(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const handleCancel = () => {
    // Animación de salida
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onCancel());
  };

  return (
    <Animated.View style={[
      styles.routeCard, 
      { 
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ],
        opacity: fadeAnim 
      }
    ]}>
      {/* Header compacto con destino y botón cancelar */}
      <View style={styles.header}>
        <Ionicons name="navigate" size={16} color="#007AFF" />
        <Text style={styles.destinationName} numberOfLines={1}>
          {destination.name}
        </Text>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={18} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Fila: Selector de modo + Stats */}
      <View style={styles.mainRow}>
        {/* Selector de modo compacto */}
        <View style={styles.modeSelector}>
          {TRANSPORT_MODES.map((mode) => {
            const isActive = routeInfo.mode === mode.key;
            return (
              <TouchableOpacity
                key={mode.key}
                style={[styles.modeButton, isActive && styles.modeButtonActive]}
                onPress={() => onModeChange(mode.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={mode.icon}
                  size={18}
                  color={isActive ? "#fff" : "#666"}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stats inline */}
        <View style={styles.statsRow}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <View style={styles.stat}>
                <Ionicons name="resize-outline" size={14} color="#007AFF" />
                <Text style={styles.statValue}>
                  {formatDistance(routeInfo.distance)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons
                  name={currentMode?.icon || "walk"}
                  size={14}
                  color="#34C759"
                />
                <Text style={styles.statValue}>{formatTime(routeInfo.time)}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  routeCard: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  destinationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  closeButton: {
    padding: 4,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: "#007AFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },
});