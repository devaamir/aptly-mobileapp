import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import ArrowRight from '../assets/icons/arrow-right.svg';
import PatientSelector from '../components/PatientSelector';
import BottomModal from '../components/BottomModal';

const MENU_ITEMS: { section: string; items: string[] }[] = [];

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'patientId', 'name', 'phoneNumber', 'email']);
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'PhoneNumber' as never }] });
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text allowFontScaling={false} style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar & name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text allowFontScaling={false} style={styles.name}>{user?.name}</Text>
            <Text allowFontScaling={false} style={styles.phone}>{user?.phoneNumber}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
            <Text allowFontScaling={false} style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Patients */}
        <Text allowFontScaling={false} style={styles.sectionLabel}>My Patients</Text>
        {user && <PatientSelector patients={[{ id: user.patientId, name: user.name, phone: user.phoneNumber, age: 0, gender: '' }]} showRadio={false} onAddMember={() => { }} />}

        {/* Menu sections */}
        {MENU_ITEMS.map(section => (
          <View key={section.section}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <View key={item}>
                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <Text allowFontScaling={false} style={styles.menuText}>{item}</Text>
                    <ArrowRight width={SIZE(16)} height={SIZE(16)} />
                  </TouchableOpacity>
                  {i < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={() => setShowLogoutModal(true)}>
          <Text allowFontScaling={false} style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomModal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <Text allowFontScaling={false} style={styles.modalTitle}>Log Out</Text>
        <Text allowFontScaling={false} style={styles.modalDesc}>Are you sure you want to log out?</Text>
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={() => setShowLogoutModal(false)}>
            <Text allowFontScaling={false} style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.7} onPress={handleLogout}>
            <Text allowFontScaling={false} style={styles.confirmText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    paddingHorizontal: SIZE(20),
    paddingVertical: SIZE(12),
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
  },
  content: {
    padding: SIZE(20),
    gap: SIZE(16),
    paddingBottom: SIZE(32),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(16),
    borderRadius: SIZE(14),
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatar: {
    width: SIZE(56),
    height: SIZE(56),
    borderRadius: SIZE(28),
    backgroundColor: colors.backgroundSubtle,
  },
  profileInfo: { flex: 1 },
  name: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  phone: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  editBtn: {
    paddingHorizontal: SIZE(14),
    paddingVertical: SIZE(6),
    borderRadius: SIZE(8),
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  editText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(12),
    color: colors.primaryAccent,
  },
  sectionLabel: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textMuted,
    marginBottom: SIZE(8),
  },
  menuCard: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(14),
  },
  menuText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: SIZE(16),
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBg,
  },
  logoutText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.danger,
  },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  modalDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    marginBottom: SIZE(8),
  },
  modalActions: {
    flexDirection: 'row',
    gap: SIZE(12),
    marginTop: SIZE(4),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SIZE(12),
    borderRadius: SIZE(10),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: SIZE(12),
    borderRadius: SIZE(10),
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.white,
  },
});
