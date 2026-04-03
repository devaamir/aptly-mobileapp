import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import ArrowRight from '../assets/icons/arrow-right.svg';
import PatientSelector from '../components/PatientSelector';

const PATIENTS = [
  { id: '1', name: 'Alen', phone: '+91 98765 43210', age: 28, gender: 'Male' },
  { id: '2', name: 'Sara', phone: '+91 91234 56789', age: 24, gender: 'Female' },
];

const MENU_ITEMS = [
  { section: 'Account', items: ['Edit Profile', 'Change Password', 'Notifications'] },
];

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    AsyncStorage.multiGet(['name', 'phoneNumber']).then(([nameEntry, phoneEntry]) => {
      setName(nameEntry[1] ?? '');
      setPhone(phoneEntry[1] ?? '');
    });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar & name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.phone}>+91 {phone}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Patients */}
        <Text style={styles.sectionLabel}>My Patients</Text>
        <PatientSelector patients={PATIENTS} showRadio={false} onAddMember={() => {}} />

        {/* Menu sections */}
        {MENU_ITEMS.map(section => (
          <View key={section.section}>
            <Text style={styles.sectionLabel}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <View key={item}>
                  <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                    <Text style={styles.menuText}>{item}</Text>
                    <ArrowRight width={SIZE(16)} height={SIZE(16)} />
                  </TouchableOpacity>
                  {i < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    borderColor: '#FEE4E2',
    backgroundColor: '#FFF9F9',
  },
  logoutText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.danger,
  },
});
