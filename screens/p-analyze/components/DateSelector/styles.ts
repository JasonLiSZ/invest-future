

import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  scrollContent: {
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateButtonActive: {
    backgroundColor: '#007AFF',
  },
  dateButtonInactive: {
    backgroundColor: '#F2F2F7',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  dateButtonTextInactive: {
    color: '#86868B',
  },
});

