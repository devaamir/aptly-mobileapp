import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import colors from '../themes/colors';
import { SIZE, SIZES } from '../themes/sizes';
import ArrowRightBlue from '../assets/icons/arrow-right-blue.svg';

type Props = {
  onSwipeComplete: () => void;
  disabled?: boolean;
};

const THUMB_SIZE = SIZE(48);
const PADDING = SIZE(4);
const TRACK_WIDTH = SIZES.wp('100%') - SIZE(36);

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export default function SwipeToBook({ onSwipeComplete, disabled }: Props) {
  const translationX = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const maxX = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
  }));

  const labelOpacity = useAnimatedStyle(() => ({
    opacity: 1 - translationX.value / maxX,
  }));

  const pan = Gesture.Pan()
    .minDistance(1)
    .enabled(!disabled)
    .onStart(() => {
      prevTranslationX.value = translationX.value;
    })
    .onUpdate(e => {
      translationX.value = clamp(prevTranslationX.value + e.translationX, 0, maxX);
    })
    .onEnd(() => {
      if (translationX.value >= maxX * 0.85) {
        translationX.value = withTiming(maxX, { duration: 150 });
        onSwipeComplete();
        setTimeout(() => {
          translationX.value = withTiming(0, { duration: 300 });
        }, 400);
      } else {
        translationX.value = withTiming(0, { duration: 200 });
      }
    })
    .runOnJS(true);

  return (
    <View style={[styles.track, disabled && styles.disabled]}>
      <Animated.Text style={[styles.label, labelOpacity]}>Swipe to Book</Animated.Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <ArrowRightBlue width={SIZE(26)} height={SIZE(26)} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: THUMB_SIZE + PADDING * 2,
    borderRadius: SIZE(14),
    backgroundColor: colors.primary,
    padding: PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  disabled: { opacity: 0.5 },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: SIZE(10),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.white,
  },
});
