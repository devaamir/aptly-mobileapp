import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import AppointmentCard from '../components/AppointmentCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Tab = 'Upcoming' | 'Completed' | 'Cancelled';

const APPOINTMENTS = [
  { id: '1', doctor: 'Dr. Rodger Struck', type: 'Cardiologist', hospital: 'Sunrise Hospital', date: '24 Mar', time: '8:00am - 11:30am', token: 42, status: 'Live' as const },
  { id: '2', doctor: 'Dr. Sarah Collins', type: 'Neurologist', hospital: 'Apollo Clinic', date: '25 Mar', time: '3:00pm - 6:30pm', token: 18, status: 'Upcoming' as const },
  { id: '3', doctor: 'Dr. James Patel', type: 'Dermatologist', hospital: 'Max Care', date: '20 Mar', time: '8:00am - 11:30am', token: 7, status: 'Completed' as const },
  { id: '4', doctor: 'Dr. Meera Nair', type: 'Orthopaedic', hospital: 'Narayana Health', date: '18 Mar', time: '3:00pm - 6:30pm', token: 31, status: 'Cancelled' as const },
];

const TABS: Tab[] = ['Upcoming', 'Completed', 'Cancelled'];

export default function AppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('Upcoming');
  const filtered = APPOINTMENTS.filter(a =>
    tab === 'Upcoming' ? (a.status === 'Upcoming' || a.status === 'Live') : a.status === tab
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
      </View>

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
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AppointmentDetail', {
            doctor: item.doctor,
            type: item.type,
            hospital: item.hospital,
            date: item.date,
            time: item.time,
            token: item.token,
            status: item.status,
          })}>
            <AppointmentCard
              doctor={item.doctor}
              type={item.type}
              hospital={item.hospital}
              date={item.date}
              time={item.time}
              token={item.token}
              status={item.status}
            />
          </TouchableOpacity>
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
  tab: { flex: 1, alignItems: 'center' },
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
});
