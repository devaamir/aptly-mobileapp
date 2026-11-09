import { Platform } from 'react-native';

export const CONTENT_MAX_WIDTH = 1240;

/**
 * Side padding for a full-width header bar whose content should line up with
 * the centred, max-width page content: on wide web screens the padding grows
 * so the content stays inside CONTENT_MAX_WIDTH; elsewhere it is `base`.
 */
export const sideMargin = (base: number) =>
  Platform.OS === 'web'
    ? ({
        marginHorizontal: `max(${base}px, calc((100% - ${CONTENT_MAX_WIDTH}px) / 2 + ${base}px))`,
      } as any)
    : { marginHorizontal: base };

export const headerSidePadding = (base: number) =>
  Platform.OS === 'web'
    ? ({
        paddingHorizontal: `max(${base}px, calc((100% - ${CONTENT_MAX_WIDTH}px) / 2 + ${base}px))`,
      } as any)
    : { paddingHorizontal: base };
