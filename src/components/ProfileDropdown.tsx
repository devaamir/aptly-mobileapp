import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Linking, StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import colors from '../themes/colors';
import ProfileIcon from '../assets/icons/profile-icon.svg';
import GroupIcon from '../assets/icons/group-icon.svg';
import LockIcon from '../assets/icons/lock-icon.svg';
import IIcon from '../assets/icons/i-icon.svg';
import SettingsIcon from '../assets/icons/settings-icon.svg';
import LogoutIcon from '../assets/icons/logout-icon.svg';

const MENU_WIDTH = 260;
const ICON = 30;

type Props = {
  /** Shown when a guest taps the avatar (e.g. open the login modal). */
  onLogin: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
  /** The avatar content (initials, image …). */
  children: React.ReactNode;
};

/**
 * Avatar button that opens a profile menu under it. Guests get `onLogin`
 * instead of a menu.
 */
export default function ProfileDropdown({ onLogin, buttonStyle, children }: Props) {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<any>();
  const btnRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 70, left: 0 });

  const toggle = () => {
    if (!user) {
      onLogin();
      return;
    }
    btnRef.current?.measureInWindow((x, y, w, h) => {
      setPos({ top: y + h + 8, left: Math.max(12, x + w - MENU_WIDTH) });
      setOpen(true);
    });
  };

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userId',
      'patientId',
      'name',
      'phoneNumber',
      'email',
    ]);
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'PhoneNumber' }] });
  };

  const items = [
    { label: 'Your Profile', icon: ProfileIcon, onPress: () => navigation.navigate('EditProfile') },
    { label: 'Family Members', icon: GroupIcon, onPress: () => navigation.navigate('FamilyMembers') },
    { label: 'Account Settings', icon: SettingsIcon, onPress: () => navigation.navigate('AccountSettings') },
    {
      label: 'Privacy Policy',
      icon: LockIcon,
      onPress: () => Linking.openURL('https://aptlycare.framer.website/privacy-policy'),
    },
    {
      label: 'Terms and Conditions',
      icon: IIcon,
      onPress: () => Linking.openURL('https://aptlycare.framer.website/terms-and-conditions'),
    },
  ];

  return (
    <>
      <TouchableOpacity
        ref={btnRef as any}
        style={buttonStyle}
        activeOpacity={0.7}
        onPress={toggle}
        accessibilityLabel={user ? 'Profile menu' : 'Login'}
      >
        {children}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { top: pos.top, left: pos.left }]} onStartShouldSetResponder={() => true}>
            <View style={styles.userRow}>
              <Text allowFontScaling={false} style={styles.userName} numberOfLines={1}>
                {user?.name}
              </Text>
              {user?.phoneNumber ? (
                <Text allowFontScaling={false} style={styles.userSub} numberOfLines={1}>
                  {user.phoneNumber}
                </Text>
              ) : null}
            </View>
            <View style={styles.divider} />
            {items.map(item => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => go(item.onPress)}
                >
                  <Icon width={ICON} height={ICON} />
                  <Text allowFontScaling={false} style={styles.rowText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => go(logout)}>
              <LogoutIcon width={20} height={20} />
              <Text allowFontScaling={false} style={[styles.rowText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  userRow: { paddingHorizontal: 16, paddingVertical: 10 },
  userName: { fontFamily: 'Manrope-SemiBold', fontSize: 15, color: colors.textPrimary },
  userSub: { fontFamily: 'Manrope-Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  rowText: { fontFamily: 'Manrope-Medium', fontSize: 14, color: colors.textPrimary },
  logoutText: { color: colors.logoutdanger },
});
