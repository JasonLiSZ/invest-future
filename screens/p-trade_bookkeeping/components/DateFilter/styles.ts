import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: '#E8F4FF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#007AFF',
  },
  customOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1D1D1F',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#86868B',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
