import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { Location, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    // Estado para guardar los lugares
    const [locations, setLocations] = useState<Location[]>([]);
    // Estado para saber si está cargando
    const [loading, setLoading] = useState<boolean>(true);

    // useEffect = @PostConstruct. Se ejecuta al iniciar la pantalla.
    useEffect(() => {
        fetchLocations();
    }, []);

    // Función asíncrona para pedir datos a Supabase
    const fetchLocations = async (): Promise<void> => {
        try {
            setLoading(true);
            // SELECT * FROM locations
            const { data, error } = await supabase
                .from('locations')
                .select('*');

            if (error) {
                throw error;
            }

            // Si todo sale bien, guardamos los datos en el estado
            if (data) {
                setLocations(data as Location[]);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            Alert.alert('Error', 'No se pudieron cargar los lugares: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Si está cargando, mostramos un spinner
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Cargando mapa de Cuenca...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: -2.8974, // Coordenadas del Parque Calderón
                    longitude: -79.0045,
                    latitudeDelta: 0.015, // Zoom inicial
                    longitudeDelta: 0.0121,
                }}
            >
                {/* Recorremos la lista de lugares y creamos un Marcador por cada uno */}
                {locations.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{
                            latitude: place.latitude,
                            longitude: place.longitude,
                        }}
                        title={place.name}
                        description={place.description}
                        onCalloutPress={() => navigation.navigate('Detail', { place })}
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
