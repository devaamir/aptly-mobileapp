import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppDropdown from '../components/AppDropdown';
import AppDatePicker from '../components/AppDatePicker';
import PrimaryButton from '../components/PrimaryButton';
import BackArrow from '../assets/icons/back-arrows.svg';
import ArrowRightWhite from '../assets/icons/arrow-right-white.svg';
import ArrowRight from '../assets/icons/arrow-right-grey.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import AppInput from '../components/AppInput';
import { createPatient } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = !!name && !!gender && !!dob;

  const handleContinue = async () => {
    try {
      setLoading(true);
      const phoneNumber = user?.phoneNumber ?? await AsyncStorage.getItem('phoneNumber') ?? '';
      const dateOfBirth = dob!.toISOString().split('T')[0];
      const res = await createPatient(name, gender.toLowerCase(), dateOfBirth);
      await AsyncStorage.multiSet([['name', name], ['patientId', res.data.id]]);
      updateUser({ name, patientId: res.data.id });
      navigation.navigate('Main' as never);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.textPrimary} barStyle="dark-content" />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <BackArrow width={SIZE(24)} height={SIZE(24)} />
      </TouchableOpacity>

      <Text style={styles.title}>Welcome to APTLY</Text>
      <Text style={styles.subtitle}>Create your profile to book appointments, track tokens, and manage your clinic visits easily.</Text>

      <AppInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <AppDropdown
            options={['Male', 'Female']}
            value={gender}
            onSelect={setGender}
            placeholder="Gender"
          />
        </View>
        <View style={styles.rowItem}>
          <AppDatePicker
            value={dob}
            onChange={setDob}
            placeholder="Date of birth"
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
});
