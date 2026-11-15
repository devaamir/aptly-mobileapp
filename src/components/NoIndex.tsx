import React from 'react';
import FocusedHelmet from './FocusedHelmet';

/**
 * Keeps private / utility screens (login, profile, booking, search …) out of
 * search results. The page's own tag replaces the default "index, follow" one
 * from index.html (see utils/dedupeHead).
 */
export default function NoIndex() {
  return (
    <FocusedHelmet>
      <meta name="robots" content="noindex, nofollow" />
    </FocusedHelmet>
  );
}
