

import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, Linking, Alert } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  const handlePrivacyPolicyPress = () => {
    // 在实际应用中，这里会打开隐私政策页面
    Alert.alert('隐私政策', '将打开隐私政策页面');
  };

  const handleUserAgreementPress = () => {
    // 在实际应用中，这里会打开用户协议页面
    Alert.alert('用户协议', '将打开用户协议页面');
  };

  const handleContactUsPress = async () => {
    const email = 'contact@investfuture.com';
    const subject = 'Invest Future 反馈';
    const body = '请在此输入您的反馈内容...';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('错误', '无法打开邮件应用');
      }
    } catch (error) {
      Alert.alert('错误', '无法打开邮件应用');
    }
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* 应用信息头部 */}
              <View style={styles.headerSection}>
                <View style={styles.appIconContainer}>
                  <FontAwesome6 name="chart-line" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.appName}>Invest Future</Text>
                <Text style={styles.appDescription}>专业的美股期权交易管理工具</Text>
              </View>

              {/* 版本信息 */}
              <View style={styles.versionSection}>
                <Text style={styles.versionLabel}>当前版本</Text>
                <Text style={styles.versionNumber}>v1.0.0</Text>
              </View>

              {/* 功能链接 */}
              <View style={styles.linksSection}>
                <TouchableOpacity
                  style={styles.linkItem}
                  onPress={handlePrivacyPolicyPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>隐私政策</Text>
                  <FontAwesome6 name="external-link" size={14} color="#86868B" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkItem}
                  onPress={handleUserAgreementPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>用户协议</Text>
                  <FontAwesome6 name="external-link" size={14} color="#86868B" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkItem}
                  onPress={handleContactUsPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>联系我们</Text>
                  <FontAwesome6 name="envelope" size={14} color="#86868B" />
                </TouchableOpacity>
              </View>

              {/* 关闭按钮 */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AboutModal;

