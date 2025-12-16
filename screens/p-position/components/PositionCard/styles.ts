

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
  closedContainer: {
    opacity: 0.7,
    backgroundColor: '#F9F9F9',
  },
  closedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#86868B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  closedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: '#FF3B30',
  },
  negativeValue: {
    color: '#34C759',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  greeksSection: {
    marginTop: 4,
  },
  greeksSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  greeksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  greekItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '18%',
    alignItems: 'center',
  },
  greekLabel: {
    fontSize: 11,
    color: '#86868B',
    marginBottom: 2,
  },
  greekValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
  },
});

