import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';

const formatAge = (dob: string): string => {
  const birth = new Date(dob);
  const now = new Date();
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (totalMonths < 12) return `${Math.max(totalMonths, 0)} months`;
  return `${Math.floor(totalMonths / 12)} years`;
};
import PatientSelector from '../components/PatientSelector';
import BottomModal from '../components/BottomModal';
import AppInput from '../components/AppInput';
import AppDropdown from '../components/AppDropdown';
import AppDatePicker from '../components/AppDatePicker';
import PrimaryButton from '../components/PrimaryButton';
import { addPatient, updatePatient, deletePatient, getPatients, Patient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

export default function FamilyMembersScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberPhoneTouched, setMemberPhoneTouched] = useState(false);
  const [memberGender, setMemberGender] = useState('');
  const [memberDob, setMemberDob] = useState<Date | null>(null);
  const [addingMember, setAddingMember] = useState(false);

  const [showEditMember, setShowEditMember] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editDob, setEditDob] = useState<Date | null>(null);
  const [savingMember, setSavingMember] = useState(false);

  const openEdit = (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;
    setEditingPatient(patient);
    setEditName(patient.name);
    setEditGender(patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '');
    setEditDob(patient.dateOfBirth ? new Date(patient.dateOfBirth) : null);
    setShowEditMember(true);
  };

  const handleDeleteMember = (id: string) => {
    Alert.alert('Remove Member', 'Are you sure you want to remove this member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await deletePatient(id);
            setPatients(prev => prev.filter(p => p.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to remove member');
          }
        },
      },
    ]);
  };

  const handleEditMember = async () => {
    if (!editingPatient || !editName || !editGender || !editDob) return;
    try {
      setSavingMember(true);
      await updatePatient(editingPatient.id, editName, editGender.toLowerCase(), dayjs(editDob).format('YYYY-MM-DD'));
      const res = await getPatients();
      setPatients(res.data.filter(p => !!p.name));
      setShowEditMember(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update member');
    } finally {
      setSavingMember(false);
    }
  };

  const phoneError =
    memberPhoneTouched && memberPhone.length > 0 && memberPhone.length < 10
      ? 'Phone number must be 10 digits'
      : null;
  const isPhoneValid = memberPhone.length === 10;
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
      await addPatient(memberName, memberPhone, memberGender.toLowerCase(), dayjs(memberDob).format('YYYY-MM-DD'));
      const res = await getPatients();
      setPatients(res.data.filter(p => !!p.name));
      setShowAddMember(false);
      setMemberName(''); setMemberPhone(''); setMemberPhoneTouched(false); setMemberGender(''); setMemberDob(null);
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
              age: p.dateOfBirth ? formatAge(p.dateOfBirth) : '—',
              gender: p.gender ?? '',
            }))}
            showRadio={false}
            onEdit={openEdit}
            onDelete={handleDeleteMember}
            ownPatientId={user?.patientId}
            onAddMember={() => setShowAddMember(true)}
          />
        )}
      </ScrollView>

      <BottomModal visible={showAddMember} onClose={() => { setShowAddMember(false); setMemberPhoneTouched(false); }} variant="bottom">
        <Text allowFontScaling={false} style={styles.modalTitle}>Add Member</Text>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', flex: 1 }}>
          <View style={{ gap: SIZE(12), flex: 1 }}>
            <AppInput value={memberName} onChangeText={setMemberName} placeholder="Full name" />
            <View>
              <AppInput
                value={memberPhone}
                onChangeText={text => { setMemberPhone(text); }}
                onBlur={() => setMemberPhoneTouched(true)}
                placeholder="Phone number"
                keyboardType="phone-pad"
                prefix="+91"
                maxLength={10}
              />
              {phoneError ? (
                <Text allowFontScaling={false} style={styles.errorText}>{phoneError}</Text>
              ) : null}
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppDropdown options={['Male', 'Female']} value={memberGender} onSelect={setMemberGender} placeholder="Gender" />
              </View>
              <View style={{ flex: 1 }}>
                <AppDatePicker value={memberDob} onChange={setMemberDob} placeholder="Date of birth" disableFuture />
              </View>
            </View>
          </View>
          <PrimaryButton
            label="Continue"
            onPress={handleAddMember}
            disabled={!memberName || !isPhoneValid || !memberGender || !memberDob || addingMember}
            loading={addingMember}
          />
        </KeyboardAvoidingView>
      </BottomModal>
      <BottomModal visible={showEditMember} onClose={() => setShowEditMember(false)} variant="bottom">
        <Text allowFontScaling={false} style={styles.modalTitle}>Edit Member</Text>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', flex: 1 }}>
          <View style={{ gap: SIZE(12), flex: 1 }}>
            <AppInput value={editName} onChangeText={setEditName} placeholder="Full name" />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppDropdown options={['Male', 'Female']} value={editGender} onSelect={setEditGender} placeholder="Gender" />
              </View>
              <View style={{ flex: 1 }}>
                <AppDatePicker value={editDob} onChange={setEditDob} placeholder="Date of birth" disableFuture />
              </View>
            </View>
          </View>
          <PrimaryButton
            label="Save"
            onPress={handleEditMember}
            disabled={!editName || !editGender || !editDob || savingMember}
            loading={savingMember}
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
  errorText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.error,
    marginTop: SIZE(-10),
    marginBottom: SIZE(4),
    paddingHorizontal: SIZE(4),
  },
  skeletonContainer: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorderLight,
    overflow: 'hidden',
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderLight,
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
