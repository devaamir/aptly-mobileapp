import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  StatusBar,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  useWindowDimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOtp } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocation } from '../context/LocationContext';
import PrimaryButton from '../components/PrimaryButton';
import ArrowRight from '../assets/icons/arrow-right-grey.svg';
import ArrowRightWhite from '../assets/icons/arrow-right-white.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type RootStackParamList = {
  PhoneNumber: undefined;
  Otp: { phone: string; code: number };
  Main: undefined;
};

export default function PhoneNumberScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  // On wide web screens this screen is shown as a centred modal card
  const isModal = Platform.OS === 'web' && screenWidth >= 768;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Opened from another screen: show that screen dimmed behind the card
  const overBackground = isModal && navigation.canGoBack();
  const isFocused = useIsFocused();
  const { initLocation } = useLocation();

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContinue = async () => {
    try {
      setLoading(true);
      const res = await sendOtp(`${phone}`);
      navigation.navigate('Otp', { phone, code: res.data.code });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // The OTP modal opens on top of this one; hide this card so only one shows
  if (isModal && !isFocused) return <View />;

  return (
    <TouchableWithoutFeedback onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined} accessible={false}>
      <View style={[isModal ? styles.backdrop : styles.fill, overBackground && styles.backdropOver]}>
      {overBackground && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close"
        />
      )}
      <SafeAreaView
        style={[
          styles.container,
          isModal ? styles.modalCard : { height: screenHeight - keyboardHeight },
        ]}>
        <StatusBar
          backgroundColor={colors.textPrimary}
          barStyle="dark-content"
        />
        <TouchableOpacity
          style={[styles.skipButton, isModal && styles.skipButtonModal]}
          onPress={async () => {
            await AsyncStorage.setItem('skipped', 'true');
            initLocation();
            navigation.navigate('Main');
          }}
        >
          <Text allowFontScaling={false} style={styles.skipText}>
            Skip
          </Text>
        </TouchableOpacity>
        <View style={[styles.content, isModal && styles.contentModal]}>
          <Image
            source={require('../assets/images/aptly-logo2.png')}
            style={[
              styles.logo,
              keyboardHeight > 0 && styles.logoCompact,
              isModal && styles.logoModal,
            ]}
          />
          <Text allowFontScaling={false} style={[styles.title, isModal && styles.titleModal]}>
            Welcome Back!
          </Text>
          <Text allowFontScaling={false} style={[styles.subtitle, isModal && styles.subtitleModal]}>
            Access your account your phone number
          </Text>

          <View style={[styles.inputRow, isModal && styles.inputRowModal, focused && styles.inputRowFocused]}>
            <View style={styles.countryCode}>
              <Text allowFontScaling={false} style={styles.flag}>
                +91
              </Text>
            </View>
            <TextInput
              allowFontScaling={false}
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              value={phone}
              onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
              maxLength={10}
            />
          </View>

          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={!phone || loading}
            icon={
              loading ? undefined : !phone ? (
                <ArrowRight width={18} height={18} />
              ) : (
                <ArrowRightWhite width={18} height={18} />
              )
            }
            loading={loading}
          />
        </View>
      </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#EEF2F7',
  },
  backdropOver: { backgroundColor: 'rgba(17,24,39,0.45)' },
  modalCard: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
    maxWidth: 460,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
  },
  skipButtonModal: { paddingHorizontal: 0, paddingVertical: 12 },
  contentModal: { flex: 0, flexGrow: 0, paddingHorizontal: 0 },
  logoModal: { width: 96, height: 56, marginTop: 4, marginBottom: 28 },
  titleModal: { fontSize: 26, marginBottom: 8 },
  subtitleModal: { fontSize: 14, marginBottom: 32 },
  inputRowFocused: { borderColor: colors.primary },
  inputRowModal: { height: 54, borderWidth: 1, borderRadius: 12, marginBottom: 18 },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: SIZE(8),
    paddingHorizontal: SIZE(25),
  },
  content: {
    width: '100%',
    maxWidth: 1240,
    paddingHorizontal: SIZE(25),
    flex: 1,
  },
  skipText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textSecondary,
  },
  logo: {
    width: SIZE(100),
    height: SIZE(58),
    resizeMode: 'contain',
    marginTop: SIZE(100),
    marginBottom: SIZE(44),
    alignSelf: 'center',
  },
  logoCompact: {
    marginTop: SIZE(24),
    marginBottom: SIZE(24),
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
