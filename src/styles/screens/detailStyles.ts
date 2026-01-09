import { StyleSheet } from 'react-native';

export const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 280 },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4, marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, color: '#444' },
  
  // Botón de volver flotante
  backButton: {
    position: 'absolute',
    left: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  // Botón de favorito flotante sobre la imagen
  favButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },

  // Estilo para el botón grande y bonito
  navButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  noReviews: { fontStyle: 'italic', color: '#888' },
  reviewCard: { 
    backgroundColor: '#f9f9f9', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  userName: { fontWeight: 'bold', fontSize: 14 },
  stars: { color: '#FFD700', fontSize: 16 },
  comment: { fontSize: 14, color: '#555' },
});
