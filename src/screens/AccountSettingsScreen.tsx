import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import DeleteIcon from '../assets/icons/delete-icon.svg';
import BottomModal from '../components/BottomModal';
import { deleteAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const { setUser } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await deleteAccount();
      Alert.alert('Success', response.message);
      setShowDeleteModal(false);
      
      // Clear AsyncStorage and context like logout
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'patientId', 'name', 'phoneNumber', 'email']);
      setUser(null);
      navigation.reset({ index: 0, routes: [{ name: 'PhoneNumber' as never }] });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to delete account');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(24)} height={SIZE(24)} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <Text style={styles.deleteTitle}>Delete Account</Text>
        <Text style={styles.description}>
          Are you sure you want to delete your account? This action is permanent and cannot be undone. All of your data will be lost.
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <DeleteIcon width={SIZE(16)} height={SIZE(16)} />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <BottomModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Text style={styles.modalTitle}>Delete Account</Text>
        <Text style={styles.modalDesc}>
          Deleting your account will permanently remove:
          {'\n'}• All your personal information
          {'\n'}• Medical history and records
          {'\n'}• Appointment history
          {'\n'}• Family member profiles
          {'\n'}• All saved preferences
          {'\n\n'}This action cannot be undone.
        </Text>
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => setShowDeleteModal(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.7} onPress={confirmDeleteAccount}>
            <Text style={styles.confirmText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
  },
  backBtn: {
    width: SIZE(32)
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZE(20),
    paddingTop: SIZE(32),
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
  },
  deleteTitle: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    fontWeight: '500',
    color: colors.black,
    marginBottom: SIZE(16),
  },
  description: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: SIZE(24),
    marginBottom: SIZE(32),
  },
  deleteButton: {
    backgroundColor: colors.dangerBgLogout,
    borderRadius: SIZE(12),
    height: SIZE(52),
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(8),
  },
  deleteButtonText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.logoutdanger,
  },
  modalTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
    marginBottom: SIZE(12),
    textAlign: 'center',
  },
  modalDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textMuted,
    lineHeight: SIZE(20),
    marginBottom: SIZE(24),
    textAlign: 'left',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SIZE(12),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: SIZE(12),
    height: SIZE(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.logoutdanger,
    borderRadius: SIZE(12),
    height: SIZE(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.white,
  },
});