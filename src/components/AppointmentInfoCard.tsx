import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  location: string;
  doctor: string;
  doctorSpeciality: string;
  onDoctorPress?: () => void;
  onCancelPress?: () => void;
  cancelLabel?: string;
  variant?: 'dark' | 'light';
};

export default function AppointmentInfoCard({
  hospital,
  hospitalType,
  location,
  doctor,
  doctorSpeciality,
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
            <View style={[styles.hospitalAvatar, isLight && styles.avatarLight]} />
            <View>
              <Text style={[styles.hospitalName, isLight && styles.textDark]}>{hospital}</Text>
              <Text style={[styles.hospitalType, isLight && styles.textMuted]}>{hospitalType}</Text>
            </View>
          </View>
        </View>
        <View style={styles.locationContainer}>
          <LocationIcon width={SIZE(14)} height={SIZE(14)} />
          <Text style={[styles.locationText, isLight && styles.textMuted]}>{location}</Text>
        </View>
        <View style={styles.hospitalActions}>
          <TouchableOpacity style={[styles.actionBtn, isLight && styles.actionBtnLight]} activeOpacity={0.7}>
            {isLight ? <PhoneIconBlue width={SIZE(22)} height={SIZE(22)} /> : <PhoneIcon width={SIZE(22)} height={SIZE(22)} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isLight && styles.actionBtnLight]} activeOpacity={0.7}>
            {isLight ? <MapIconBlue width={SIZE(22)} height={SIZE(22)} /> : <MapIcon width={SIZE(22)} height={SIZE(22)} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, isLight && styles.actionBtnLight]} activeOpacity={0.7}>
            {isLight ? <WebIconBlue width={SIZE(22)} height={SIZE(22)} /> : <WebIcon width={SIZE(22)} height={SIZE(22)} />}
          </TouchableOpacity>
        </View>
        <View style={styles.divider}>
          <View style={styles.dashedLine} />
        </View>
        <TouchableOpacity style={styles.hospitalBottom} activeOpacity={0.7} onPress={onDoctorPress}>
          <View style={[styles.doctorAvatar, isLight && styles.avatarLight]} />
          <View style={styles.doctorInfo}>
            <Text style={[styles.doctorName, isLight && styles.textDark]}>{doctor}</Text>
            <Text style={[styles.doctorSpeciality, isLight && styles.textMuted]}>{doctorSpeciality}</Text>
          </View>
          <ArrowRight width={SIZE(18)} height={SIZE(18)} />
        </TouchableOpacity>
      </View>

      {onCancelPress && (
        <TouchableOpacity onPress={onCancelPress} activeOpacity={0.7} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>{cancelLabel}</Text>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  hospitalName: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(14),
    color: colors.white,
  },
  hospitalType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: 'rgba(255,255,255,0.7)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(8),
    marginBottom: SIZE(14),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(10),
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  doctorInfo: { flex: 1 },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.white,
  },
  doctorSpeciality: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: 'rgba(255,255,255,0.7)',
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
