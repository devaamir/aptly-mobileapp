import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import DeleteIcon from '../assets/icons/delete-icon.svg';

export default function AccountSettingsScreen() {
  const navigation = useNavigation();

  const handleDeleteAccount = () => {
    // Handle delete account logic
    console.log('Delete account pressed');
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
});