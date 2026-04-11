import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, PanResponder, Dimensions } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import CarIcon from '../assets/icons/car-icon.svg';

const TRACK_WIDTH = Dimensions.get('window').width - SIZE(48);
const MIN = 0;
const MAX = 100;

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export default function DistancePicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value);
  const translateX = useRef(new Animated.Value((value / MAX) * TRACK_WIDTH)).current;
  const currentVal = useRef(value);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, g) => {
      const pos = Math.min(TRACK_WIDTH, Math.max(0, (currentVal.current / MAX) * TRACK_WIDTH + g.dx));
      translateX.setValue(pos);
      const v = Math.round((pos / TRACK_WIDTH) * MAX);
      setDraft(v);
    },
    onPanResponderRelease: (_, g) => {
      const pos = Math.min(TRACK_WIDTH, Math.max(0, (currentVal.current / MAX) * TRACK_WIDTH + g.dx));
      const v = Math.round((pos / TRACK_WIDTH) * MAX);
      currentVal.current = v;
      translateX.setValue((v / MAX) * TRACK_WIDTH);
      setDraft(v);
    },
  })).current;

  const open = () => {
    setDraft(value);
    currentVal.current = value;
    translateX.setValue((value / MAX) * TRACK_WIDTH);
    setVisible(true);
  };

  const apply = () => { onChange(draft); setVisible(false); };

  const thumbX = translateX.interpolate({ inputRange: [0, TRACK_WIDTH], outputRange: [0, TRACK_WIDTH], extrapolate: 'clamp' });

  return (
    <>
      <TouchableOpacity style={styles.btn} activeOpacity={0.7} onPress={open}>
        <CarIcon width={SIZE(16)} height={SIZE(16)} />
        <Text allowFontScaling={false} style={styles.btnText}>{value} km</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.handle} />
            <Text allowFontScaling={false} style={styles.title}>Edit Distance</Text>
            <Text allowFontScaling={false} style={styles.valueText}>{draft} km</Text>

            {/* Track */}
            <View style={styles.trackContainer}>
              <View style={styles.track}>
                <Animated.View style={[styles.fill, { width: thumbX }]} />
              </View>
              <Animated.View
                style={[styles.thumb, { transform: [{ translateX: thumbX }] }]}
                {...panResponder.panHandlers}
              />
            </View>

            <View style={styles.labels}>
              <Text allowFontScaling={false} style={styles.label}>0 km</Text>
              <Text allowFontScaling={false} style={styles.label}>100 km</Text>
            </View>

            <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8} onPress={apply}>
              <Text allowFontScaling={false} style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: SIZE(4) },
  btnText: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(13), color: colors.primary },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: SIZE(24),
    borderTopRightRadius: SIZE(24),
    padding: SIZE(24),
    paddingBottom: SIZE(40),
    width: '100%',
  },
  handle: { width: SIZE(40), height: SIZE(4), borderRadius: SIZE(2), backgroundColor: colors.border, alignSelf: 'center', marginBottom: SIZE(20) },
  title: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(18), color: colors.textPrimary, marginBottom: SIZE(8) },
  valueText: { fontFamily: 'Manrope-Bold', fontSize: SIZE(32), color: colors.primary, marginBottom: SIZE(24) },
  trackContainer: { height: SIZE(40), justifyContent: 'center', marginBottom: SIZE(8) },
  track: {
    height: SIZE(6),
    backgroundColor: colors.border,
    borderRadius: SIZE(3),
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: SIZE(3) },
  thumb: {
    position: 'absolute',
    width: SIZE(24),
    height: SIZE(24),
    borderRadius: SIZE(12),
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    marginLeft: -SIZE(12),
    top: SIZE(8),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZE(24) },
  label: { fontFamily: 'Manrope-Regular', fontSize: SIZE(12), color: colors.subText },
  applyBtn: { backgroundColor: colors.primary, borderRadius: SIZE(12), paddingVertical: SIZE(14), alignItems: 'center' },
  applyText: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(16), color: colors.white },
});
