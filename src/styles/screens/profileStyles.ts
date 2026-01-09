import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Estilos para vista de invitado
  guestContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guestEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  registerButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  featureItem: {
    fontSize: 15,
    color: '#555',
  },
  guestIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  // Header del perfil logueado
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Sección de favoritos
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtext: {
    color: 'gray',
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  favoriteInfo: {
    marginLeft: 12,
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Botón de modo oscuro
  darkModeButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  darkModeText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },

  // Botón cerrar sesión
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 100,
    padding: 14,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal de edición
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  modalSaveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
