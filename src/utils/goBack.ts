import { RootStackParamList } from '../navigations/Navigation';

type NavLike = {
  canGoBack: () => boolean;
  goBack: () => void;
  reset: (state: { index: number; routes: { name: keyof RootStackParamList }[] }) => void;
};

/**
 * Goes back when there is history. When the screen was opened directly
 * (deep link, page refresh, search result) there is nothing to go back to,
 * so fall back to a root screen instead of doing nothing.
 */
export function goBackOrHome(
  navigation: NavLike,
  fallback: keyof RootStackParamList = 'Main',
) {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.reset({ index: 0, routes: [{ name: fallback }] });
  }
}
