

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styles from './styles';

interface DeleteModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const handleBackdropPress = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleConfirmPress = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancelPress = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Text style={styles.title}>确认删除</Text>
            <Text style={styles.message}>
              确定要删除这笔交易记录吗？删除后无法恢复。
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPress}>
                <Text style={styles.confirmButtonText}>删除</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default DeleteModal;

