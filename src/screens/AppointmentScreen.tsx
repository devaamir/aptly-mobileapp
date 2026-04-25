import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import AppointmentCard from '../components/AppointmentCard';
import { getAppointments, Appointment } from '../services/api';
import { useTracking } from '../context/TrackingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'Upcoming' | 'Completed' | 'Cancelled';
const TABS: Tab[] = ['Upcoming', 'Completed', 'Cancelled'];

const statusMap: Record<string, 'Upcoming' | 'Completed' | 'Cancelled' | 'Live'> = {
  pending: 'Upcoming',
  active: 'Live',
  ongoing: 'Live',
  completed: 'Completed',
  done: 'Completed',
  cancelled: 'Cancelled',
};

export default function AppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const { trackData } = useTracking();
  const [tab, setTab] = useState<Tab>('Upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = (p: number, reset = false) => {
    if (p === 1) reset ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);
    getAppointments(p).then(res => {
      const data = res.data;
      setAppointments(prev => p === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
      setPage(p);
    }).finally(() => {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    });
  };

  useFocusEffect(useCallback(() => { fetchPage(1); }, []));

  const today = new Date().toISOString().split('T')[0];
  const filtered = appointments.filter(a => {
    const mapped = statusMap[a.tokenStatus] ?? 'Upcoming';
    if (tab === 'Upcoming') {
      return (mapped === 'Upcoming' || mapped === 'Live') && a.appointmentDate >= today;
    }
    return mapped === tab;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text allowFontScaling={false} style={styles.title}>Appointments</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={styles.tab} onPress={() => { setTab(t); }} activeOpacity={0.8}>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPage(1, true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={() => { if (hasMore && !loadingMore) fetchPage(page + 1); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: SIZE(16) }} color={colors.primary} /> : null}
          ListEmptyComponent={<Text allowFontScaling={false} style={styles.empty}>No {tab.toLowerCase()} appointments</Text>}
          renderItem={({ item }) => {
            const liveAppt = trackData?.appointments.find(a => a.id === item.id);
            const isLive = () => {
              const today = new Date().toISOString().split('T')[0];
              if (item.appointmentDate !== today || item.tokenStatus !== 'pending') return false;
              const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
              const [sh, sm] = (item.schedule?.startTime ?? '').split(':').map(Number);
              const [eh, em] = (item.schedule?.stopTime ?? '').split(':').map(Number);
              return nowMins >= sh * 60 + sm && nowMins <= eh * 60 + em;
            };
            const status = isLive() ? 'Live' : (statusMap[item.tokenStatus] ?? 'Upcoming');
            const liveToken = liveAppt?.tokenNumber ?? item.tokenNumber;
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
                token: liveToken,
                status,
              })}>
                <AppointmentCard
                  doctor={item.doctor.name}
                  type={item.doctor.specialties[0]?.name ?? ''}
                  hospital={item.medicalCenter.name}
                  date={date}
                  time={time}
                  token={liveToken}
                  status={status}
                  avatar={item.doctor.profilePicture}
                  clinicAvatar={item.medicalCenter.profilePicture}
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
