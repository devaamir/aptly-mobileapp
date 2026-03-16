import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import colors from '../themes/colors';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white},
  text: {fontFamily: 'Manrope-SemiBold', fontSize: 18, color: colors.textPrimary},
});
