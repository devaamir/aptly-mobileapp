import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import ArrowRight from '../assets/icons/arrow-right.svg';
import ProfileIcon from '../assets/icons/profile-icon.svg';
import GroupIcon from '../assets/icons/group-icon.svg';
import LockIcon from '../assets/icons/lock-icon.svg';
import IIcon from '../assets/icons/i-icon.svg';
import SettingsIcon from '../assets/icons/settings-icon.svg';
import LogoutIcon from '../assets/icons/logout-icon.svg';
import PatientSelector from '../components/PatientSelector';
import BottomModal from '../components/BottomModal';
import AppInput from '../components/AppInput';
import AppDropdown from '../components/AppDropdown';
import AppDatePicker from '../components/AppDatePicker';
import PrimaryButton from '../components/PrimaryButton';
import { createPatient, addPatient, getPatients, Patient } from '../services/api';

const MENU_ITEMS: { section: string; items: string[] }[] = [];

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberGender, setMemberGender] = useState('');
  const [memberDob, setMemberDob] = useState<Date | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useFocusEffect(useCallback(() => {
    getPatients().then(res => setPatients(res.data.filter(p => !!p.name))).catch(() => { });
  }, []));

  const handleAddMember = async () => {
    if (!memberName || !memberPhone || !memberGender || !memberDob) return;
    try {
      setAddingMember(true);
      await addPatient(memberName, memberPhone, memberGender.toLowerCase(), memberDob.toISOString().split('T')[0]);
      const res = await getPatients();
      setPatients(res.data.filter(p => !!p.name));
      setShowAddMember(false);
      setMemberName(''); setMemberPhone(''); setMemberGender(''); setMemberDob(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

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
        {/* Menu Cards Group 1 */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuCard} activeOpacity={0.7} onPress={() => navigation.navigate('EditProfile' as never)}>
            <View style={styles.menuLeft}>
              <ProfileIcon width={SIZE(38)} height={SIZE(38)} />
              <Text allowFontScaling={false} style={styles.menuText}>Your Profile</Text>
            </View>
            <ArrowRight width={SIZE(24)} height={SIZE(24)} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuCard} activeOpacity={0.7} onPress={() => navigation.navigate('FamilyMembers' as never)}>
            <View style={styles.menuLeft}>
              <GroupIcon width={SIZE(38)} height={SIZE(38)} />
              <Text allowFontScaling={false} style={styles.menuText}>Family Members</Text>
            </View>
            <ArrowRight width={SIZE(24)} height={SIZE(24)} />
          </TouchableOpacity>
        </View>

        {/* Menu Cards Group 2 */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuCard} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <LockIcon width={SIZE(38)} height={SIZE(38)} />
              <Text allowFontScaling={false} style={styles.menuText}>Privacy Policy</Text>
            </View>
            <ArrowRight width={SIZE(24)} height={SIZE(24)} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuCard} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <IIcon width={SIZE(38)} height={SIZE(38)} />
              <Text allowFontScaling={false} style={styles.menuText}>Terms and Conditions</Text>
            </View>
            <ArrowRight width={SIZE(24)} height={SIZE(24)} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuCard} activeOpacity={0.7} onPress={() => navigation.navigate('AccountSettings' as never)}>
            <View style={styles.menuLeft}>
              <SettingsIcon width={SIZE(38)} height={SIZE(38)} />
              <Text allowFontScaling={false} style={styles.menuText}>Account Settings</Text>
            </View>
            <ArrowRight width={SIZE(24)} height={SIZE(24)} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={() => setShowLogoutModal(true)}>
          <LogoutIcon width={SIZE(20)} height={SIZE(20)} />
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

      <BottomModal visible={showAddMember} onClose={() => setShowAddMember(false)} variant="bottom">
        <Text allowFontScaling={false} style={styles.modalTitle}>Add Member</Text>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', flex: 1 }}>
          <View style={{ gap: SIZE(12), flex: 1 }}>
            <AppInput value={memberName} onChangeText={setMemberName} placeholder="Full name" />
            <AppInput value={memberPhone} onChangeText={setMemberPhone} placeholder="Phone number" keyboardType="phone-pad" prefix="+91" />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppDropdown options={['Male', 'Female']} value={memberGender} onSelect={setMemberGender} placeholder="Gender" />
              </View>
              <View style={{ flex: 1 }}>
                <AppDatePicker value={memberDob} onChange={setMemberDob} placeholder="Date of birth" />
              </View>
            </View>
          </View>
          <PrimaryButton
            label="Continue"
            onPress={handleAddMember}
            disabled={!memberName || !memberPhone || !memberGender || !memberDob || addingMember}
            loading={addingMember}
          />
        </KeyboardAvoidingView>
      </BottomModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  row: { flexDirection: 'row', gap: SIZE(12) },
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
    marginBottom: SIZE(16),
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
    marginTop: SIZE(8),
    marginBottom: SIZE(4),
  },
  menuContainer: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: SIZE(16),
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(14),
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
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
    fontSize: SIZE(16),
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: SIZE(16),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(8),
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    // borderWidth: 1,
    // borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBgLogout,
  },
  logoutText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.logoutdanger,
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
