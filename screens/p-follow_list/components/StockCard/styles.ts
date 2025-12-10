

import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
  stockHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stockIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  stockDetails: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  stockSymbol: {
    fontSize: 14,
    color: '#86868B',
  },
  priceInfo: {
    alignItems: 'flex-end',
    marginRight: 16,
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
  priceUp: {
    color: '#34C759',
  },
  priceDown: {
    color: '#FF3B30',
  },
  expandButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIcon: {
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '30%',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  contractsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contractsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contractsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  addContractButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addContractIcon: {
    marginRight: 4,
  },
  addContractText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  contractsList: {
    gap: 8,
  },
  contractItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contractInfo: {
    flex: 1,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contractSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginRight: 8,
  },
  contractTypeTag: {
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
  contractTypeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contractDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  contractDetailText: {
    fontSize: 12,
    color: '#86868B',
  },
  contractActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  bookkeepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editContractButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteContractButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshIconRotating: {
    // 这里可以添加旋转动画
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deleteIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

