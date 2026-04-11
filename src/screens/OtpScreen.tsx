import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from '../components/PrimaryButton';
import ArrowRightWhite from '../assets/icons/arrow-right-white.svg';
import ArrowRight from '../assets/icons/arrow-right-grey.svg';
import BackArrow from '../assets/icons/back-arrows.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import { RootStackParamList } from '../navigations/Navigation';
import { verifyOtp } from '../services/api';

import { useAuth } from '../context/AuthContext';

const OTP_LENGTH = 4;

export default function OtpScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Otp'>>();
  const { phone, code } = route.params;
  const { setUser } = useAuth();

  const prefilled = String(code).padStart(OTP_LENGTH, '0').split('').slice(0, OTP_LENGTH);
  const [otp, setOtp] = useState<string[]>(prefilled);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const navigation = useNavigation();

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await verifyOtp(phone, otp.join(''));
      const { accessToken, refreshToken, user, patient } = res.data;
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['userId', user.id],
        ['phoneNumber', user.phoneNumber],
        ['email', user.emailAddress ?? ''],
        ['name', user.name ?? ''],
        ['patientId', patient?.id ?? ''],
        ['gender', patient?.gender ?? ''],
        ['dateOfBirth', patient?.dateOfBirth ?? ''],
      ]);
      setUser({ userId: user.id, patientId: patient?.id ?? '', name: user.name ?? '', phoneNumber: user.phoneNumber, email: user.emailAddress ?? '', accessToken, refreshToken, gender: patient?.gender ?? '', dateOfBirth: patient?.dateOfBirth ?? '' });
      navigation.reset({ index: 0, routes: [{ name: (patient || user.name) ? ('Main' as never) : ('CreateProfile' as never) }] });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const isFilled = otp.every(d => d !== '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.textPrimary} barStyle="dark-content" />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <BackArrow width={SIZE(24)} height={SIZE(24)} />
      </TouchableOpacity>
      <Text allowFontScaling={false} style={styles.title}>Verification Code</Text>
      <Text allowFontScaling={false} style={styles.subtitle}>{"We've sent an sms with a verification code to "}<Text allowFontScaling={false} style={styles.phone}>+91 {phone}</Text>{" to proceed"}</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput allowFontScaling={false}
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
            value={digit}
            onChangeText={text => handleChange(text.slice(-1), index)}
            onKeyPress={e => handleKeyPress(e, index)}
            placeholder="0"
            placeholderTextColor={colors.border}
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>

      <PrimaryButton
        label="Verify"
        onPress={handleVerify}
        disabled={!isFilled || loading}
        loading={loading}
        icon={!isFilled ? <ArrowRight width={SIZE(18)} height={SIZE(18)} /> : <ArrowRightWhite width={SIZE(18)} height={SIZE(18)} />}
      />
      <Text allowFontScaling={false} style={styles.resend}>Didn't receive code? <Text allowFontScaling={false} style={styles.resendLink}>Resend</Text></Text>
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
    marginBottom: SIZE(38),
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: SIZE(24),
    color: colors.textPrimary,
    marginBottom: SIZE(8),
    marginRight: SIZE(29),
  },
  subtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textSecondary,
    marginBottom: SIZE(43),
    marginRight: SIZE(29),
    width: '80%',
    lineHeight: SIZE(22),
  },
  resend: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: SIZE(25),
  },
  resendLink: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.primary,
  },
  phone: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZE(28),

  },
  otpBox: {
    width: SIZE(66),
    height: SIZE(53),
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    borderRadius: 0,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(24),
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderBottomColor: colors.primary,
  },
});
