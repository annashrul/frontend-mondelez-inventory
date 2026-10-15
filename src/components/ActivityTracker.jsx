import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { recordUiActivity } from '@/services/activityEvents';

export default function ActivityTracker() {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  const tab = new URLSearchParams(search).get('tab') || '';
  const previous = useRef(null);
  useEffect(() => {
    if (!user) { previous.current = null; return; }
    const key = `${user.id}:${pathname}:${tab}`;
    if (previous.current === key) return;
    previous.current = key;
    void recordUiActivity({ type: 'navigation', path: pathname, tab });
  }, [user, pathname, tab]);
  return null;
}
