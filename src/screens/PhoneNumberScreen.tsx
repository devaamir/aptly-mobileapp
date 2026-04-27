import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { auth } from '../config/firebase';
// import { sendOtp } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PrimaryButton from '../components/PrimaryButton';
import ArrowRight from '../assets/icons/arrow-right-grey.svg';
import ArrowRightWhite from '../assets/icons/arrow-right-white.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type RootStackParamList = { PhoneNumber: undefined; Otp: { phone: string; confirmation: any } };

export default function PhoneNumberScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleContinue = async () => {
    try {
      setLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      navigation.navigate('Otp', { phone, confirmation });
      // const res = await sendOtp(phone);
      // navigation.navigate('Otp', { phone, code: res.data.code });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.textPrimary} barStyle="dark-content" />
      <Image source={require('../assets/images/aptly-logo.png')} style={styles.logo} />
      <Text allowFontScaling={false} style={styles.title}>Welcome Back!</Text>
      <Text allowFontScaling={false} style={styles.subtitle}>Access your account your phone number</Text>

      <View style={styles.inputRow}>
        <View style={styles.countryCode}>
          <Text allowFontScaling={false} style={styles.flag}>+91</Text>
        </View>
        <TextInput allowFontScaling={false}
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />
      </View>

      <PrimaryButton
        label="Continue"
        onPress={handleContinue}
        disabled={!phone || loading}
        icon={loading ? undefined : (!phone ? <ArrowRight width={18} height={18} /> : <ArrowRightWhite width={18} height={18} />)}
        loading={loading}
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
  logo: {
    width: 100,
    resizeMode: 'contain',
    marginTop: SIZE(127),
    marginBottom: SIZE(83),
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: SIZE(24),
    color: colors.textPrimary,
    marginBottom: SIZE(8),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: colors.textSecondary,
    marginBottom: SIZE(52),
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: SIZE(1),
    borderColor: colors.border,
    borderRadius: SIZE(12),
    height: SIZE(52),
    marginBottom: SIZE(18),
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: colors.backgroundLight,
    height: '100%',
    paddingHorizontal: SIZE(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZE(11),
    marginRight: SIZE(10),
  },
  flag: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textDark,
    marginRight: SIZE(10),
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(16),
    color: colors.textDark,
    paddingHorizontal: SIZE(10),
  },
});
