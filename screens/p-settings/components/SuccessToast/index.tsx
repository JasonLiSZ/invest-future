

import React, { useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { FontAwesome6 } from '@expo/vector-icons';
import styles from './styles';

interface SuccessToastProps {
  visible: boolean;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ visible }) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.toastContainer, animatedStyle]}>
          <FontAwesome6 name="circle-check" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>保存成功</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SuccessToast;

