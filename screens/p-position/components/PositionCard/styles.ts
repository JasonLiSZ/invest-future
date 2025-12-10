

import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  contractInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contractName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginRight: 8,
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  callTag: {
    backgroundColor: '#5856D6',
  },
  putTag: {
    backgroundColor: '#FF9500',
  },
  typeTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  companyName: {
    fontSize: 12,
    color: '#86868B',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 14,
  },
  closedLabel: {
    fontSize: 14,
    color: '#86868B',
    marginBottom: 2,
  },
  closeDate: {
    fontSize: 12,
    color: '#86868B',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 16,
  },
  gridRowTwo: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  gridRowThree: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  gridItemTwo: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  gridItemThree: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  profitLossRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitLossLabel: {
    fontSize: 12,
    color: '#86868B',
  },
  profitLossValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positiveValue: {
    color: '#34C759',
  },
  negativeValue: {
    color: '#FF3B30',
  },
});

