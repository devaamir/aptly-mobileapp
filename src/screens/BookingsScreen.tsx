import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import LocationIcon from '../assets/icons/location-icon.svg';

type Tab = 'Upcoming' | 'Completed' | 'Cancelled';

const APPOINTMENTS = [
  { id: '1', doctor: 'Dr. Rodger Struck', type: 'Cardiologist', hospital: 'Sunrise Hospital', date: '24 Mar', time: '8:00am - 11:30am', token: 42, status: 'Upcoming' },
  { id: '2', doctor: 'Dr. Sarah Collins', type: 'Neurologist', hospital: 'Apollo Clinic', date: '25 Mar', time: '3:00pm - 6:30pm', token: 18, status: 'Upcoming' },
  { id: '3', doctor: 'Dr. James Patel', type: 'Dermatologist', hospital: 'Max Care', date: '20 Mar', time: '8:00am - 11:30am', token: 7, status: 'Completed' },
  { id: '4', doctor: 'Dr. Meera Nair', type: 'Orthopaedic', hospital: 'Narayana Health', date: '18 Mar', time: '3:00pm - 6:30pm', token: 31, status: 'Cancelled' },
];

const TABS: Tab[] = ['Upcoming', 'Completed', 'Cancelled'];

const statusColors: Record<Tab, { bg: string; text: string }> = {
  Upcoming:  { bg: colors.primaryLight, text: colors.primary },
  Completed: { bg: colors.successLight, text: colors.successText },
  Cancelled: { bg: '#FEF3F2', text: '#B42318' },
};

export default function BookingsScreen() {
  const [tab, setTab] = useState<Tab>('Upcoming');
  const filtered = APPOINTMENTS.filter(a => a.status === tab);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No {tab.toLowerCase()} appointments</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar} />
              <View style={styles.cardInfo}>
                <Text style={styles.doctorName}>{item.doctor}</Text>
                <Text style={styles.doctorType}>{item.type}</Text>
                <View style={styles.locationRow}>
                  <LocationIcon width={SIZE(12)} height={SIZE(12)} />
                  <Text style={styles.locationText}>{item.hospital}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[tab].bg }]}>
                <Text style={[styles.statusText, { color: statusColors[tab].text }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardBottom}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{item.date}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaValue}>{item.time}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Token</Text>
                <Text style={styles.metaValue}>#{item.token}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZE(20),
    paddingVertical: SIZE(12),
  },
  title: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(16),
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: SIZE(18),
    marginTop: SIZE(10),
    marginBottom: SIZE(16),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontFamily: 'Manrope-SemiBold',
    color: colors.accent,
  },
  tabUnderline: {
    height: 4,
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 20,
    marginTop: SIZE(6),
  },
  list: { paddingHorizontal: SIZE(18), gap: SIZE(12), paddingBottom: SIZE(24) },
  empty: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: SIZE(40),
  },
  card: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
  },
  avatar: {
    width: SIZE(48),
    height: SIZE(48),
    borderRadius: SIZE(24),
    backgroundColor: colors.backgroundLight,
  },
  cardInfo: { flex: 1 },
  doctorName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.textPrimary,
  },
  doctorType: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(2),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(4),
    marginTop: SIZE(4),
  },
  locationText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: SIZE(10),
    paddingVertical: SIZE(4),
    borderRadius: SIZE(20),
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(11),
  },
  divider: { height: 1, backgroundColor: colors.cardBorder },
  cardBottom: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGrey,
    paddingVertical: SIZE(12),
  },
  metaItem: { flex: 1, alignItems: 'center', gap: SIZE(4) },
  metaDivider: { width: 1, backgroundColor: colors.cardBorder },
  metaLabel: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(11),
    color: colors.textMuted,
  },
  metaValue: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(13),
    color: colors.textPrimary,
  },
});
