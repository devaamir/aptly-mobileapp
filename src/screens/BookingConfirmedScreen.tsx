import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Video from 'react-native-video';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmed'>;

export default function BookingConfirmedScreen({ navigation, route }: Props) {
  const { token, doctorName, hospital, date } = route.params;

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {Platform.OS === 'android' && (
        <Video
          source={require('../assets/images/background-video.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat
          muted
          disableFocus
        />
      )}

      <View style={styles.content}>
        <Text allowFontScaling={false} style={styles.tokenLabel}>Your Token Number</Text>
        <Text allowFontScaling={false} style={styles.tokenNumber}>{token}</Text>
      </View>

      <View style={styles.footer}>
        <Text allowFontScaling={false} style={styles.successTitle}>Successfully Booked</Text>
        <Text allowFontScaling={false} style={styles.successDesc}>Track your token status and proceed to the clinic when your number is approaching.</Text>
        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.8}
          onPress={goHome}>
          <Text allowFontScaling={false} style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZE(12),
  },
  tokenLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: 'rgba(255,255,255,0.8)',
  },
  tokenNumber: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(96),
    color: colors.white,
    lineHeight: SIZE(104),
  },
  footer: {
    paddingHorizontal: SIZE(18),
    paddingVertical: SIZE(12),
    gap: SIZE(8),
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(18),
    color: colors.white,
    textAlign: 'center',
  },
  successDesc: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(13),
    color: 'rgba(255,255,255,0.75)',
    lineHeight: SIZE(20),
    marginBottom: SIZE(8),
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: colors.white,
    paddingVertical: SIZE(14),
    borderRadius: SIZE(12),
    alignItems: 'center',
    width: '100%',
  },
  doneBtnText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.primary,
  },
});
