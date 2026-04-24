import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import LocationIcon from '../assets/icons/location-icon-light.svg';
import PhoneIcon from '../assets/icons/phone-icon.svg';
import MapIcon from '../assets/icons/map-icon.svg';
import WebIcon from '../assets/icons/web-icon.svg';
import PhoneIconBlue from '../assets/icons/phone-icon-blue.svg';
import MapIconBlue from '../assets/icons/map-icon-blue.svg';
import WebIconBlue from '../assets/icons/web-icon-blue.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';

type Props = {
  hospital: string;
  hospitalType: string;
  hospitalPicture?: string;
  location: string;
  doctor: string;
  doctorSpecialty: string;
  doctorPicture?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  websiteUrl?: string;
  onDoctorPress?: () => void;
  onCancelPress?: () => void;
  cancelLabel?: string;
  variant?: 'dark' | 'light';
};

export default function AppointmentInfoCard({
  hospital,
  hospitalType,
  hospitalPicture,
  location,
  doctor,
  doctorSpecialty,
  doctorPicture,
  phoneNumber,
  latitude,
  longitude,
  websiteUrl,
  onDoctorPress,
  onCancelPress,
  cancelLabel = 'Cancel Token',
  variant = 'dark',
}: Props) {
  const isLight = variant === 'light';
  return (
    <View style={styles.bottom}>
      <View style={[styles.hospitalCard, isLight && styles.hospitalCardLight]}>
        <View style={styles.hospitalTop}>
          <View style={styles.hospitalLeft}>
            {hospitalPicture
              ? <Image source={{ uri: hospitalPicture }} style={styles.hospitalAvatar} resizeMode="cover" />
              : <View style={[styles.hospitalAvatar, isLight && styles.avatarLight]} />}
            <View>
              <Text allowFontScaling={false} style={[styles.hospitalName, isLight && styles.textDark]}>{hospital}</Text>
              <Text allowFontScaling={false} style={[styles.hospitalType, isLight && styles.textMuted]}>{hospitalType}</Text>
            </View>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <LocationIcon width={SIZE(14)} height={SIZE(14)} />
          <Text allowFontScaling={false} style={[styles.locationText, isLight && styles.textMuted]}>{location}</Text>
        </View>
        <View style={styles.hospitalActions}>
          <TouchableOpacity style={[styles.actionBtn, isLight && styles.actionBtnLight]} activeOpacity={0.7} onPress={() => phoneNumber && Linking.openURL(`tel:${phoneNumber}`)}>
            {isLight ? <PhoneIconBlue width={SIZE(22)} height={SIZE(22)} /> : <PhoneIcon width={SIZE(22)} height={SIZE(22)} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isLight && styles.actionBtnLight]} activeOpacity={0.7} onPress={() => latitude && Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`)}>
            {isLight ? <MapIconBlue width={SIZE(22)} height={SIZE(22)} /> : <MapIcon width={SIZE(22)} height={SIZE(22)} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isLight && styles.actionBtnLight]} activeOpacity={0.7} onPress={() => websiteUrl && Linking.openURL(websiteUrl)}>
            {isLight ? <WebIconBlue width={SIZE(22)} height={SIZE(22)} /> : <WebIcon width={SIZE(22)} height={SIZE(22)} />}
          </TouchableOpacity>
        </View>
        <View style={styles.divider}>
          <View style={styles.dashedLine} />
        </View>
        <TouchableOpacity style={styles.hospitalBottom} activeOpacity={0.7} onPress={onDoctorPress}>
          {doctorPicture
            ? <Image source={{ uri: doctorPicture }} style={styles.doctorAvatar} resizeMode="cover" />
            : <View style={[styles.doctorAvatar, isLight && styles.avatarLight]} />}
          <View style={styles.doctorInfo}>
            <Text allowFontScaling={false} style={[styles.doctorName, isLight && styles.textDark]}>{doctor}</Text>
            <Text allowFontScaling={false} style={[styles.doctorSpecialty, isLight && styles.textMuted]}>{doctorSpecialty}</Text>
          </View>
          <ArrowRight width={SIZE(18)} height={SIZE(18)} />
        </TouchableOpacity>
      </View>

      {onCancelPress && (
        <TouchableOpacity onPress={onCancelPress} activeOpacity={0.7} style={styles.cancelBtn}>
          <Text allowFontScaling={false} style={styles.cancelText}>{cancelLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    gap: SIZE(12),
  },
  hospitalCard: {
    backgroundColor: colors.white15,
    borderRadius: SIZE(16),
    padding: SIZE(16),
  },
  hospitalCardLight: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hospitalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZE(12),
  },
  hospitalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
  },
  hospitalAvatar: {
    width: SIZE(44),
    height: SIZE(44),
    borderRadius: SIZE(22),
    backgroundColor: colors.white30,
    overflow: 'hidden',
  },
  hospitalName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(14),
    color: colors.white,
  },
  hospitalType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white70,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
    marginBottom: SIZE(14),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.cardBorder,
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: SIZE(8),
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: SIZE(18),
  },
  actionBtn: {
    width: '32%',
    height: SIZE(36),
    borderRadius: SIZE(10),
    backgroundColor: colors.white20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    marginBottom: SIZE(12),
    overflow: 'hidden',
  },
  dashedLine: {
    borderWidth: 1,
    borderColor: colors.borderLowOpacity,
    borderStyle: 'dashed',
    marginBottom: -1,
  },
  hospitalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
  },
  doctorAvatar: {
    width: SIZE(44),
    height: SIZE(44),
    borderRadius: SIZE(22),
    backgroundColor: colors.white30,
    overflow: 'hidden',
  },
  doctorInfo: { flex: 1 },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.white,
  },
  doctorSpecialty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.white70,
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: SIZE(8),
  },
  cancelText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.danger,
  },
  textDark: { color: colors.textPrimary },
  textMuted: { color: colors.textSecondary },
  actionBtnLight: { backgroundColor: colors.backgroundLight },
  avatarLight: { backgroundColor: colors.backgroundSubtle },
});
