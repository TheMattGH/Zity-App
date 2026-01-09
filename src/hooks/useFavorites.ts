import { useCallback, useState } from 'react';
import { supabase } from '../services/supabase';
import { LocationModel } from '../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<LocationModel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('location_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      const locationIds = favData.map(f => f.location_id);

      if (locationIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data: placesData, error: placesError } = await supabase
        .from('locations')
        .select('*')
        .in('id', locationIds);

      if (placesError) throw placesError;
      if (placesData) setFavorites(placesData as LocationModel[]);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    loading,
    loadFavorites,
    clearFavorites,
  };
};
