import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import LocationIcon from '../assets/icons/location-icon.svg';
import ArrowRight from '../assets/icons/arrow-right.svg';

type Props = {
  name: string;
  subType: string;
  location: string;
  image?: string;
  onPress?: () => void;
};

export default function ClinicCard({ name, subType, location, image, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <Image
        source={image ? { uri: image } : require('../assets/images/aptly-logo.png')}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subType}>{subType}</Text>
        <View style={styles.locationRow}>
          <LocationIcon width={SIZE(12)} height={SIZE(12)} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      </View>
      <ArrowRight width={SIZE(18)} height={SIZE(18)} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(4),
    marginHorizontal: SIZE(18),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: '#F1F2F4',
    backgroundColor: colors.white,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: SIZE(10),
    backgroundColor: colors.backgroundLight,
    resizeMode: 'cover',
  },
  info: { flex: 1, justifyContent: 'space-between', alignSelf: 'stretch', paddingVertical: SIZE(7) },
  name: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
  },
  subType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textSecondary,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SIZE(4), marginTop: SIZE(2) },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(10),
    color: colors.textSecondary,
  },
});
