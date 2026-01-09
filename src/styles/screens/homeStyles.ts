import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
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
  // Estilos del panel de selección
  selectionPanel: {
    position: 'absolute',
    bottom: 100, // Subido para no tapar el navbar
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  selectionContent: {
    flexDirection: 'row',
  },
  selectionImage: {
    width: 100,
    height: '100%',
    minHeight: 120,
  },
  selectionDetails: {
    flex: 1,
    padding: 12,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  selectionInfo: {
    flex: 1,
    marginRight: 8,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectionCategory: {
    fontSize: 13,
    color: '#8E8E93',
  },
  closeButton: {
    padding: 2,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
