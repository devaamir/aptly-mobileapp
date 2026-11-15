import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useIsFocused } from '@react-navigation/native';

/**
 * Helmet that only applies while its screen is the focused one.
 * Stack screens stay mounted underneath the current one, so a plain <Helmet>
 * would leave e.g. Home's canonical/description (or a login screen's noindex)
 * in the head after navigating to a clinic page.
 */
export default function FocusedHelmet({ children }: { children?: React.ReactNode }) {
  const isFocused = useIsFocused();
  if (!isFocused) return null;
  return <Helmet>{children}</Helmet>;
}
