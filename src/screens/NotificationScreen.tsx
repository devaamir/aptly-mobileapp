import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigations/Navigation';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import BackArrow from '../assets/icons/back-arrows.svg';
import DangerIcon from '../assets/icons/danger-icon.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const MOCK_NOTIFICATIONS: any[] = [];

export default function NotificationScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackArrow width={SIZE(26)} height={SIZE(26)} />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.title}>Notifications</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text allowFontScaling={false} style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} activeOpacity={0.7}>
            <View style={styles.iconCircle}>
              <DangerIcon width={SIZE(18)} height={SIZE(18)} />
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemRow}>
                <Text allowFontScaling={false} style={styles.itemTitle}>{item.title}</Text>
                {/* {!item.read && <View style={styles.dot} />} */}
              </View>
              <Text allowFontScaling={false} style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
              <Text allowFontScaling={false} style={styles.itemTime}>{item.time}</Text>
            </View>
            {/* {!item.read && <View style={styles.dot} />} */}
          </TouchableOpacity>
        )}
      // ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZE(16),
    paddingVertical: SIZE(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: SIZE(4), zIndex: 1 },
  title: {
    fontFamily: 'Manrope-Bold',
    fontSize: SIZE(16),
    color: '#32363E',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  list: { paddingTop: SIZE(20) },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SIZE(20),
    marginBottom: SIZE(24),
    // paddingVertical: SIZE(20),
    gap: SIZE(10),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#418EFD',
  },
  itemContent: { width: SIZE(280) },
  iconCircle: {
    backgroundColor: '#F5F5F5',
    borderRadius: 999,
    padding: SIZE(11),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZE(8),
  },
  itemTime: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
    marginTop: SIZE(14),
  },
  itemTitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: '#00001D',
    flex: 1,
  },
  itemBody: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(14),
    color: colors.appointmentDate,
    lineHeight: SIZE(19),
  },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: SIZE(20) },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SIZE(100),
  },
  emptyText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textSecondary,
  },
});
