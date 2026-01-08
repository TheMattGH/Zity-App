import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route }: Props) {
    // Recibimos los datos del lugar a través de los parámetros de navegación
    const { place } = route.params;

    return (
        <ScrollView style={styles.container}>
            {/* Imagen del lugar */}
            <Image
                source={{ uri: place.image_url }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Text style={styles.title}>{place.name}</Text>

                {/* Aquí luego pondremos las estrellas de reseñas */}
                <Text style={styles.subtitle}>Ubicación Turística</Text>

                <View style={styles.divider} />

                <Text style={styles.description}>{place.description}</Text>

                {/* Botón de acción (ej: Cómo llegar) - Lo programaremos luego */}
                <View style={styles.buttonContainer}>
                    <Button title="Cómo llegar" onPress={() => { }} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: '100%', height: 250 },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    description: { fontSize: 16, lineHeight: 24, color: '#444' },
    buttonContainer: { marginTop: 20 }
});
