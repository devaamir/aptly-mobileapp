import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import { shortToUuid } from '../utils/shortId';
import colors from '../themes/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ShortBooking'>;

/**
 * Short booking link (/b/:d/:c) used on clinic posters / QR codes.
 * Decodes the doctor and clinic ids and opens the booking page in its place.
 */
export default function ShortBookingLinkScreen({ navigation, route }: Props) {
  const { d, c } = route.params ?? {};

  useEffect(() => {
    const doctorId = d ? shortToUuid(String(d)) : null;
    const clinicId = c ? shortToUuid(String(c)) ?? undefined : undefined;
    if (!doctorId) {
      navigation.replace('Main');
      return;
    }
    navigation.replace('BookAppointment', { doctorId, clinicId });
  }, [d, c, navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
