import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import SearchIcon from '../assets/icons/search-icon.svg';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';

const SEARCH_TERMS = [
  '"skin doctor"',
  '"nearby clinics"',
  '"eye specialist"',
  '"dentist"',
  '"cardiologist"',
  '"pediatrician"',
  '"general physician"',
  '"orthopedic"',
];

export default function AnimatedSearchBar() {
  const [displayTerm, setDisplayTerm] = useState(SEARCH_TERMS[0]);
  const currentIndexRef = useRef(0);
  const letterOpacitiesRef = useRef<Animated.Value[]>(
    SEARCH_TERMS[0].split('').map(() => new Animated.Value(1)),
  );

  useEffect(() => {
    const runAnimation = () => {
      const reversed = [...letterOpacitiesRef.current].reverse();

      Animated.stagger(
        30,
        reversed.map(anim =>
          Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
        ),
      ).start(() => {
        currentIndexRef.current = (currentIndexRef.current + 1) % SEARCH_TERMS.length;
        const nextTerm = SEARCH_TERMS[currentIndexRef.current];
        letterOpacitiesRef.current = nextTerm.split('').map(() => new Animated.Value(0));
        setDisplayTerm(nextTerm);
        Animated.stagger(
          30,
          letterOpacitiesRef.current.map(anim =>
            Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
          ),
        ).start();
      });
    };

    const interval = setInterval(runAnimation, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <Text allowFontScaling={false} style={styles.staticText}>Search </Text>
        {displayTerm.split('').map((letter, i) => (
          <Animated.Text
            key={i}
            allowFontScaling={false}
            style={[styles.animText, { opacity: letterOpacitiesRef.current[i] }]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
      <View style={styles.iconContainer}>
        <SearchIcon width={SIZE(20)} height={SIZE(20)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.searchBorder,
    borderRadius: 12,
    paddingHorizontal: SIZE(14),
    backgroundColor: colors.white,
    height: SIZE(48),
  },
  textRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  staticText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textSecondary,
  },
  animText: {
    fontFamily: 'Manrope-Medium',
    fontSize: SIZE(16),
    color: colors.textSecondary,
  },
  iconContainer: {
    paddingVertical: SIZE(8),
    paddingLeft: SIZE(12),
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
