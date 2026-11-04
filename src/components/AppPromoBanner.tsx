import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Platform, useWindowDimensions } from 'react-native';
import colors from '../themes/colors';
import { FadeInUp } from './PromoAnimations';

const APP_STORE_URL = 'https://apps.apple.com/in/app/aptly-care/id6798915670';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.aptly.aptlycareapp';
const SHOW_DELAY_MS = 800;
const REOPEN_AFTER_MS = 10000;

const isStandalone = () => {
  try {
    return (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    );
  } catch {
    return false;
  }
};

/**
 * "Use the app" strip shown at the top of the mobile web view, like store
 * smart-banners. Hidden on desktop and inside the installed PWA. It stays
 * open; if the user closes it, it comes back after 10 seconds.
 */
export default function AppPromoBanner() {
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAfter = (ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(true), ms);
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    setStandalone(isStandalone());
    showAfter(SHOW_DELAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (Platform.OS !== 'web' || width >= 768 || standalone || !visible) return null;

  const close = () => {
    setVisible(false);
    showAfter(REOPEN_AFTER_MS);
  };

  const openStore = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    Linking.openURL(isIOS ? APP_STORE_URL : PLAY_STORE_URL);
  };

  return (
    <FadeInUp style={styles.bar} distance={-16}>
      <TouchableOpacity onPress={close} style={styles.closeBtn} activeOpacity={0.7} accessibilityLabel="Close">
        <Text allowFontScaling={false} style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <Image source={{ uri: '/icon-192.png' }} style={styles.icon} />
      <View style={styles.textWrap}>
        <Text allowFontScaling={false} style={styles.title} numberOfLines={1}>Get the Aptly app</Text>
        <Text allowFontScaling={false} style={styles.sub} numberOfLines={1}>Track your token live</Text>
      </View>
      <TouchableOpacity style={styles.useBtn} activeOpacity={0.8} onPress={openStore}>
        <Text allowFontScaling={false} style={styles.useBtnText}>Use App</Text>
      </TouchableOpacity>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
  },
  closeBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: colors.textSubdued },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.white },
  textWrap: { flex: 1, minWidth: 0 },
  title: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: colors.textPrimary },
  sub: { fontFamily: 'Manrope-Regular', fontSize: 12, color: colors.textSubdued, marginTop: 1 },
  useBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  useBtnText: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: colors.white },
});
