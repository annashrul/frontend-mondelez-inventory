import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getList } from '@/services/api';
import { settingsService } from '@/services/settingsService';
import { notificationService } from '@/services/notificationService';
import { useSettingsStore } from '@/stores/settingsStore';

// Keep successful responses available when returning to the page.
const cacheOptions = { gcTime: Infinity };

function normalizeNotifications(value) {
  return {
    ...value,
    level_ids: (value.level_ids || []).map(Number),
    user_ids: (value.user_ids || []).map(Number),
    email_enabled: value.email_enabled === true,
    stock_enabled: value.stock_enabled !== false,
    transaction_enabled: value.transaction_enabled !== false,
  };
}

export function useSettingsPageData(activeTab, userId) {
  const settingsKey = ['settings', userId];
  const notificationKey = ['notification-settings', userId];
  const recipientsKey = ['settings-recipients', userId];
  const databaseKey = ['settings-database-status', userId];
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    ...cacheOptions, queryKey: settingsKey, queryFn: settingsService.get,
  });
  const notificationQuery = useQuery({
    ...cacheOptions, queryKey: notificationKey, queryFn: async () => normalizeNotifications(await notificationService.getSettings()),
    enabled: activeTab === 'notifikasi',
  });
  const recipientsQuery = useQuery({
    ...cacheOptions, queryKey: recipientsKey, enabled: activeTab === 'notifikasi',
    queryFn: async () => {
      const [levels, users] = await Promise.all([
        api.get('/level-pengguna', { params: { limit: 100 } }),
        api.get('/pengguna', { params: { limit: 100 } }),
      ]);
      return { levels: getList(levels), users: getList(users) };
    },
  });
  const databaseQuery = useQuery({
    ...cacheOptions, queryKey: databaseKey, queryFn: settingsService.databaseStatus,
    enabled: activeTab === 'database',
  });
  const saveMutation = useMutation({
    mutationFn: ({ section, payload }) => section === 'notifikasi'
      ? notificationService.saveSettings(payload)
      : settingsService.save(section, payload),
    onSuccess: async (value, { section }) => {
      const key = section === 'notifikasi' ? notificationKey : settingsKey;
      queryClient.setQueryData(key, section === 'notifikasi' ? normalizeNotifications(value) : value);
      if (section !== 'notifikasi') useSettingsStore.getState().apply(value);
      await queryClient.invalidateQueries({ queryKey: key });
      if (section === 'database') await queryClient.invalidateQueries({ queryKey: databaseKey });
    },
  });
  const backupMutation = useMutation({
    mutationFn: settingsService.backup,
    onSettled: () => queryClient.invalidateQueries({ queryKey: databaseKey }),
  });
  const testEmailMutation = useMutation({
    mutationFn: notificationService.testEmail,
  });

  const tabQueries = [settingsQuery];
  if (activeTab === 'notifikasi') tabQueries.push(notificationQuery, recipientsQuery);
  const loading = tabQueries.some(query => query.isPending);
  const loadError = tabQueries.find(query => query.isError && !query.data)?.error;
  const refreshError = tabQueries.find(query => query.isError && query.data)?.error;
  const backgroundFetching = tabQueries.some(query => query.isFetching && query.data);
  const retry = () => Promise.all(tabQueries.filter(query => query.isError).map(query => query.refetch()));

  return {
    settingsQuery, notificationQuery, recipientsQuery, databaseQuery,
    loading, loadError, refreshError, backgroundFetching, retry,
    saveMutation, backupMutation, testEmailMutation,
  };
}
