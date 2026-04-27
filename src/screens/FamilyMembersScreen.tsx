import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import PatientSelector from '../components/PatientSelector';
import BottomModal from '../components/BottomModal';
import AppInput from '../components/AppInput';
import AppDropdown from '../components/AppDropdown';
import AppDatePicker from '../components/AppDatePicker';
import PrimaryButton from '../components/PrimaryButton';
import { addPatient, getPatients, Patient } from '../services/api';

export default function FamilyMembersScreen() {
  const navigation = useNavigation();
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberGender, setMemberGender] = useState('');
  const [memberDob, setMemberDob] = useState<Date | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    getPatients().then(res => setPatients(res.data.filter(p => !!p.name))).catch(() => { }).finally(() => setLoading(false));
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(24)} height={SIZE(24)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>Family Members</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonInfo}>
                  <View style={styles.skeletonLine} />
                  <View style={styles.skeletonLineSm} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <PatientSelector
            patients={patients.map(p => ({
              id: p.id,
              name: p.name,
              phone: p.phoneNumber,
              age: p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 0,
              gender: p.gender ?? '',
            }))}
            showRadio={false}
            onAddMember={() => setShowAddMember(true)}
          />
        )}
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
  },
  backBtn: { width: SIZE(32) },
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
  row: { flexDirection: 'row', gap: SIZE(12) },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  skeletonContainer: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  skeletonAvatar: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(20),
    backgroundColor: colors.backgroundMuted,
  },
  skeletonInfo: {
    flex: 1,
    gap: SIZE(6),
  },
  skeletonLine: {
    height: SIZE(16),
    width: '60%',
    backgroundColor: colors.backgroundMuted,
    borderRadius: SIZE(4),
  },
  skeletonLineSm: {
    height: SIZE(12),
    width: '40%',
    backgroundColor: colors.backgroundMuted,
    borderRadius: SIZE(4),
  },
});
