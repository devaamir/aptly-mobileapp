import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import AppointmentCard from '../components/AppointmentCard';
import { getAppointments, Appointment } from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'Upcoming' | 'Completed' | 'Cancelled';
const TABS: Tab[] = ['Upcoming', 'Completed', 'Cancelled'];

const statusMap: Record<string, 'Upcoming' | 'Completed' | 'Cancelled' | 'Live'> = {
  pending: 'Upcoming',
  active: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('Upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    getAppointments().then(res => setAppointments(res.data)).finally(() => setLoading(false));
  }, []));

  const filtered = appointments.filter(a => {
    const mapped = statusMap[a.tokenStatus] ?? 'Upcoming';
    return tab === 'Upcoming' ? (mapped === 'Upcoming' || mapped === 'Live') : mapped === tab;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text allowFontScaling={false} style={styles.title}>Appointments</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text allowFontScaling={false} style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: SIZE(40) }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text allowFontScaling={false} style={styles.empty}>No {tab.toLowerCase()} appointments</Text>}
          renderItem={({ item }) => {
            const isLive = () => {
              const today = new Date().toISOString().split('T')[0];
              if (item.appointmentDate !== today || item.tokenStatus !== 'pending') return false;
              const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
              const [sh, sm] = (item.schedule?.startTime ?? '').split(':').map(Number);
              const [eh, em] = (item.schedule?.stopTime ?? '').split(':').map(Number);
              return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
            };
            const status = isLive() ? 'Live' : (statusMap[item.tokenStatus] ?? 'Upcoming');
            const formatDate = (d: string) => {
              const dt = new Date(d);
              return `${String(dt.getDate()).padStart(2, '0')} ${dt.toLocaleDateString('en-US', { month: 'short' })} ${dt.getFullYear()}`;
            };
            const formatTime = (t: string) => {
              const [h, m] = t.split(':').map(Number);
              return m === 0 ? `${h % 12 || 12}${h >= 12 ? 'pm' : 'am'}` : `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`;
            };
            const start = item.schedule?.startTime ? formatTime(item.schedule.startTime) : '';
            const stop = item.schedule?.stopTime ? formatTime(item.schedule.stopTime) : '';
            const time = start && stop ? `${start} - ${stop}` : '';
            const date = formatDate(item.appointmentDate);
            return (
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AppointmentDetail', {
                id: item.id,
                doctor: item.doctor.name,
                type: item.doctor.specialties[0]?.name ?? '',
                hospital: item.medicalCenter.name,
                date,
                time,
                token: item.tokenNumber,
                status,
              })}>
                <AppointmentCard
                  doctor={item.doctor.name}
                  type={item.doctor.specialties[0]?.name ?? ''}
                  hospital={item.medicalCenter.name}
                  date={date}
                  time={time}
                  token={item.tokenNumber}
                  status={status}
                  avatar={item.doctor.profilePicture}
                />
              </TouchableOpacity>
            );
          }}
        />
      )}
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
