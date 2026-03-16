import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PrimaryButton from '../components/PrimaryButton';
import ArrowRight from '../assets/icons/arrow-right-grey.svg';
import ArrowRightWhite from '../assets/icons/arrow-right-white.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type RootStackParamList = { PhoneNumber: undefined; Otp: undefined };

export default function PhoneNumberScreen() {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.textPrimary} barStyle="dark-content" />
      <Image source={require('../assets/images/aptly-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Access your account your phone number</Text>

      <View style={styles.inputRow}>
        <View style={styles.countryCode}>
          <Text style={styles.flag}>+91</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#7E8695"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />
      </View>

      <PrimaryButton
        label="Continue"
        onPress={() => navigation.navigate('Otp')}
        disabled={!phone}
        icon={!phone ? <ArrowRight width={18} height={18} /> : <ArrowRightWhite width={18} height={18} />}
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
