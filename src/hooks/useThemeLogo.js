import lightLogo from '../../logo.webp';
import darkLogo from '../../logo.png';
import { useSettingsStore } from '@/stores/settingsStore';

export function useThemeLogo() {
  const theme = useSettingsStore(state => state.settings.tema);
  return theme === 'dark' ? darkLogo : lightLogo;
}
