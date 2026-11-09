import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../themes/colors';
import NotificationIcon from '../assets/icons/notification-icon-grey.svg';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import ProfileDropdown from './ProfileDropdown';
import { CONTENT_MAX_WIDTH } from '../utils/layout';

type Props = { active?: 'Home' | 'Appointments' | 'Profile' };

/**
 * Top bar for the wide web layout of screens that have no header of their own
 * (the bottom tab bar is hidden there): logo, Home / Appointments, bell and
 * profile menu. Same look as the Home header.
 */
export default function DesktopNavHeader({ active }: Props) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const goTo = (tab: 'Home' | 'Appointments') => {
    if (tab === 'Appointments' && !user) {
      setShowLogin(true);
      return;
    }
    navigation.navigate('Main', { screen: tab });
  };

  const initials =
    (user?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'U';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => goTo('Home')} accessibilityLabel="Home">
            <Image
              source={require('../assets/images/aptly-logo3.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.nav}>
          {(['Home', 'Appointments'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              style={[styles.tab, active === tab && styles.tabActive]}
              onPress={() => goTo(tab)}
            >
              <Text
                allowFontScaling={false}
                style={[styles.tabText, active === tab && styles.tabTextActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.side, styles.sideRight]}>
          <TouchableOpacity style={styles.bell} activeOpacity={0.7} accessibilityLabel="Notifications">
            <NotificationIcon width={22} height={22} />
          </TouchableOpacity>
          <ProfileDropdown buttonStyle={styles.avatar} onLogin={() => setShowLogin(true)}>
            {user ? (
              <Text allowFontScaling={false} style={styles.avatarText}>{initials}</Text>
            ) : (
              <Image source={require('../assets/images/user-profile.png')} style={styles.guestAvatar} />
            )}
          </ProfileDropdown>
        </View>
      </View>
      <LoginModal visible={showLogin} onClose={() => setShowLogin(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  side: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  sideRight: { justifyContent: 'flex-end', gap: 12 },
  logo: { height: 48, width: 126 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  tabActive: { backgroundColor: colors.primaryLight },
  tabText: { fontFamily: 'Manrope-Medium', fontSize: 15, color: colors.textSubdued },
  tabTextActive: { fontFamily: 'Manrope-SemiBold', color: colors.primary },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  avatarText: { fontFamily: 'Manrope-SemiBold', fontSize: 15, color: colors.primary },
  guestAvatar: { width: 34, height: 34, borderRadius: 17 },
});
