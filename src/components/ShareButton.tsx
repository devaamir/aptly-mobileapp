import React, { useEffect, useRef, useState } from 'react';
import { Platform, Share, StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

type Props = {
  /** Public link to share (e.g. the doctor's or clinic's page) */
  url: string;
  /** Shown in the share sheet, e.g. "Dr. Faiza Banu – Book an appointment on Aptly" */
  title: string;
  style?: StyleProp<ViewStyle>;
  /** 'pill' = icon + "Share" text; 'icon' = round grey icon button (clinic page) */
  variant?: 'pill' | 'icon';
};

const ShareIcon = ({ color = colors.primary, size = SIZE(16) }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={2} />
    <Line x1="8.6" y1="13.5" x2="15.4" y2="17.5" stroke={color} strokeWidth={2} />
    <Line x1="15.4" y1="6.5" x2="8.6" y2="10.5" stroke={color} strokeWidth={2} />
  </Svg>
);

/**
 * Shares a page link. Uses the phone's share sheet where there is one (app, mobile
 * browsers); on desktop browsers it copies the link and says "Link copied".
 */
export default function ShareButton({ url, title, style, variant = 'pill' }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const showCopied = () => {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  const onPress = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Share.share({ message: `${title}\n${url}`, url, title });
      } catch {}
      return;
    }
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title, text: title, url });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // user closed the share sheet
      }
    }
    try {
      await nav?.clipboard?.writeText(url);
      showCopied();
    } catch {
      // Clipboard blocked: fall back to a prompt the user can copy from
      if (typeof window !== 'undefined') window.prompt('Copy this link', url);
    }
  };

  if (variant === 'icon') {
    return (
      <View style={[styles.iconWrap, style]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Share">
          <ShareIcon color={colors.textPrimary} size={SIZE(18)} />
        </TouchableOpacity>
        {copied && (
          <View style={styles.tooltip} pointerEvents="none">
            <Text allowFontScaling={false} style={styles.tooltipText}>Link copied</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.btn}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Share">
        <ShareIcon />
        <Text allowFontScaling={false} style={styles.label}>{copied ? 'Link copied' : 'Share'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
    paddingVertical: SIZE(6),
    paddingHorizontal: SIZE(12),
    borderRadius: SIZE(20),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  iconWrap: { position: 'relative', alignItems: 'center' },
  iconBtn: {
    width: SIZE(40),
    height: SIZE(40),
    borderRadius: SIZE(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundMuted,
  },
  tooltip: {
    position: 'absolute',
    top: SIZE(46),
    right: 0,
    paddingVertical: SIZE(4),
    paddingHorizontal: SIZE(8),
    borderRadius: SIZE(6),
    backgroundColor: colors.textPrimary,
    zIndex: 10,
  },
  tooltipText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(12),
    color: colors.white,
    whiteSpace: 'nowrap',
  } as any,
  label: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.primary,
  },
});
