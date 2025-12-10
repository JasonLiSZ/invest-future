

import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  // 顶部导航栏
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  
  saveButtonDisabled: {
    opacity: 0.6,
  },
  
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  loadingIcon: {
    marginLeft: 8,
  },
  
  // 滚动视图
  scrollView: {
    flex: 1,
  },
  
  // 股票信息卡片
  stockInfoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
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
  
  stockInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  stockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  
  stockDetails: {
    flex: 1,
  },
  
  stockName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  
  stockCode: {
    fontSize: 14,
    color: '#86868B',
  },
  
  stockPriceInfo: {
    alignItems: 'flex-end',
  },
  
  stockPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  
  stockChange: {
    fontSize: 14,
  },
  
  priceUp: {
    color: '#34C759',
  },
  
  priceDown: {
    color: '#FF3B30',
  },
  
  // 表单区域
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  
  formGroup: {
    marginBottom: 24,
  },
  
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  
  textInputError: {
    borderColor: '#FF3B30',
  },
  
  inputWithSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
  },
  
  currencySymbol: {
    paddingLeft: 16,
    fontSize: 16,
    color: '#86868B',
  },
  
  textInputWithSymbol: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  
  errorMessage: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  
  // 合约类型选择
  contractTypeContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  
  contractTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  
  radioButtonSelected: {
    backgroundColor: '#007AFF',
  },
  
  contractTypeText: {
    fontSize: 14,
    color: '#1D1D1F',
  },
  
  // 提示信息
  tipContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 16,
  },
  
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  tipIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  
  tipTextContainer: {
    flex: 1,
  },
  
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  
  tipList: {
    gap: 4,
  },
  
  tipItem: {
    fontSize: 14,
    color: '#86868B',
    lineHeight: 20,
  },
  
  // 模态框
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  
  modalMessage: {
    fontSize: 14,
    color: '#86868B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

