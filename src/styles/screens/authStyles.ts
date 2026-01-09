import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoImage: { 
    width: 100, 
    height: 100, 
    marginBottom: 16 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    textAlign: 'center', 
    color: '#333', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    textAlign: 'center', 
    color: '#666', 
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: { 
    marginBottom: 24 
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 17 
  },
  switchButton: { 
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: { 
    color: '#666', 
    fontSize: 15 
  },
  switchTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  skipButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skipButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  guestNote: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginTop: 12,
  },
});
