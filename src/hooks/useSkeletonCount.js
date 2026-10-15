import { useSettingsStore } from '@/stores/settingsStore';

export default function useSkeletonCount(limit) {
  const configured = useSettingsStore(state => state.settings.items_per_page);
  const count = Number(limit ?? configured);
  return Number.isInteger(count) && count > 0 ? Math.min(count, 100) : configured;
}
