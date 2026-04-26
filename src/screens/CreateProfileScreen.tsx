import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppDropdown from '../components/AppDropdown';
import AppDatePicker from '../components/AppDatePicker';
import PrimaryButton from '../components/PrimaryButton';
import BottomModal from '../components/BottomModal';
import BackArrow from '../assets/icons/back-arrows.svg';
import { useLocation } from '../context/LocationContext';
import ArrowRightWhite from '../assets/icons/arrow-right-white.svg';
import ArrowRight from '../assets/icons/arrow-right-grey.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import AppInput from '../components/AppInput';
import { createPatient, updatePatient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isEdit = (route.name as string) === 'EditProfile';
  const { user, updateUser } = useAuth();
  const { initLocation } = useLocation();
  const [name, setName] = useState(isEdit ? (user?.name ?? '') : '');
  const [gender, setGender] = useState(isEdit ? (user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '') : '');
  const [dob, setDob] = useState<Date | null>(isEdit && user?.dateOfBirth ? new Date(user.dateOfBirth) : null);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<'name' | 'gender' | 'dob' | null>(null);
  const [cancelVisible, setCancelVisible] = useState(false);

  const handleBack = () => {
    if (isEdit) { navigation.goBack(); return; }
    setCancelVisible(true);
  };

  const isValid = !!name && !!gender && !!dob;

  const handleContinue = async () => {
    try {
      setLoading(true);
      const dateOfBirth = dob!.toISOString().split('T')[0];
      const genderLower = gender.toLowerCase();
      let patientId: string;
      if (isEdit && user?.patientId) {
        const res = await updatePatient(user.patientId, name, genderLower, dateOfBirth);
        patientId = res.data.id;
      } else {
        const res = await createPatient(name, genderLower, dateOfBirth);
        patientId = res.data.id;
      }
      await AsyncStorage.multiSet([['name', name], ['patientId', patientId], ['gender', genderLower], ['dateOfBirth', dateOfBirth]]);
      updateUser({ name, patientId, gender: genderLower, dateOfBirth });
      if (isEdit) navigation.goBack();
      else { initLocation(); navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] }); }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.textPrimary} barStyle="dark-content" />
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <BackArrow width={SIZE(24)} height={SIZE(24)} />
      </TouchableOpacity>

      <Text allowFontScaling={false} style={styles.title}>{isEdit ? 'Edit Profile' : 'Welcome to APTLY'}</Text>
      <Text allowFontScaling={false} style={styles.subtitle}>{isEdit ? 'Update your name, gender and date of birth.' : 'Create your profile to book appointments, track tokens, and manage your clinic visits easily.'}</Text>

      <AppInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        onFocus={() => setActiveField('name')}
        onBlur={() => setActiveField(null)}
      />
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <AppDropdown
            options={['Male', 'Female']}
            value={gender}
            onSelect={setGender}
            placeholder="Gender"
            focused={activeField === 'gender'}
            onFocus={() => setActiveField('gender')}
            onBlur={() => setActiveField(null)}
          />
        </View>
        <View style={styles.rowItem}>
          <AppDatePicker
            value={dob}
            onChange={setDob}
            placeholder="Date of birth"
            focused={activeField === 'dob'}
            onOpen={() => setActiveField('dob')}
            onClose={() => setActiveField(null)}
          />
        </View>
      </View>
      <PrimaryButton
        label="Continue"
        onPress={handleContinue}
        disabled={!isValid || loading}
        loading={loading}
        icon={!isValid ? <ArrowRight width={SIZE(18)} height={SIZE(18)} /> : <ArrowRightWhite width={SIZE(18)} height={SIZE(18)} />}
      />

      <BottomModal visible={cancelVisible} onClose={() => setCancelVisible(false)} variant="center">
        <Text allowFontScaling={false} style={styles.modalTitle}>Cancel Setup?</Text>
        <Text allowFontScaling={false} style={styles.modalDesc}>Are you sure you want to go back? You'll need to start again with a new number.</Text>
        <View style={styles.modalBtns}>
          <TouchableOpacity style={[styles.modalBtn, styles.keepBtn]} onPress={() => setCancelVisible(false)} activeOpacity={0.8}>
            <Text allowFontScaling={false} style={styles.keepText}>Stay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalBtn, styles.yesBtn]} onPress={async () => {
            setCancelVisible(false);
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'phoneNumber', 'email', 'name', 'patientId', 'gender', 'dateOfBirth']);
            navigation.reset({ index: 0, routes: [{ name: 'PhoneNumber' as never }] });
          }} activeOpacity={0.8}>
            <Text allowFontScaling={false} style={styles.yesText}>Yes, Go Back</Text>
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
    paddingHorizontal: SIZE(25),
  },
  backButton: {
    marginTop: SIZE(17),
    marginBottom: SIZE(33),
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: SIZE(24),
    color: colors.textPrimary,
    marginBottom: SIZE(8),
    marginLeft: SIZE(4),
  },
  subtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textSecondary,
    marginBottom: SIZE(49),
    marginLeft: SIZE(4),
    width: '90%',
  },
  row: {
    flexDirection: 'row',
    gap: SIZE(12),
  },
  rowItem: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(18),
    color: colors.textPrimary,
    marginBottom: SIZE(8),
  },
  modalDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: SIZE(20),
    marginBottom: SIZE(4),
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SIZE(12),
    marginTop: SIZE(8),
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    alignItems: 'center',
  },
  keepBtn: { backgroundColor: colors.primaryLight },
  yesBtn: { backgroundColor: colors.danger },
  keepText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.primaryAccent,
  },
  yesText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.white,
  },
});
