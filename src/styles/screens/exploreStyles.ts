import { Platform, StatusBar, StyleSheet } from 'react-native';

export const exploreStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  
  headerContainer: { paddingTop: 10, paddingBottom: 5 },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  
  // ESTILOS DE LA BARRA DE BÚSQUEDA
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15, // Separación con los filtros
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    // Sombras suaves
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee'
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },

  filtersWrapper: { marginBottom: 10 },

  // Tarjetas
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

  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
  emptyText: { color: '#999', fontSize: 16, textAlign: 'center', marginTop: 10 }
});
