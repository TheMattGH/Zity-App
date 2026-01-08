// Tipos para la aplicación Zity

export interface Location {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    image_url: string;
    created_at?: string;
}

// Tipos para la navegación
export type RootStackParamList = {
    Home: undefined;
    Detail: { place: Location };
};
