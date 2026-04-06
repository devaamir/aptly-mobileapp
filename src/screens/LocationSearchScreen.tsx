import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import LocationIcon from '../assets/icons/location-icon.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationSearch'>;

const SUGGESTIONS = [
  'Malappuram, Kerala',
  'Kozhikode, Kerala',
  'Thrissur, Kerala',
  'Kochi, Kerala',
  'Bangalore, Karnataka',
  'Chennai, Tamil Nadu',
  'Mumbai, Maharashtra',
];

export default function LocationSearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(22)} height={SIZE(22)} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <LocationIcon width={SIZE(18)} height={SIZE(18)} />
          <TextInput
            allowFontScaling={false}
            style={styles.input}
            placeholder="Search location..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <LocationIcon width={SIZE(16)} height={SIZE(16)} />
            <Text allowFontScaling={false} style={styles.rowText}>{item}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: SIZE(4) },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(10),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: SIZE(14),
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(15),
    color: colors.textPrimary,
  },
  list: { paddingHorizontal: SIZE(18), paddingTop: SIZE(8), paddingBottom: SIZE(24) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    paddingVertical: SIZE(14),
  },
  rowText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  separator: { height: 1, backgroundColor: colors.border },
});
