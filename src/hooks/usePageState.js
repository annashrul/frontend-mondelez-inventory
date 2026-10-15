import { useCallback, useRef, useState } from 'react';
import { pageMemory } from '@/lib/pageMemory';

export default function usePageState(key, initialValue) {
  const initial = useRef(initialValue);
  const [value, setValue] = useState(() => pageMemory.read(key, initialValue));
  const update = useCallback(next => {
    // Update memory immediately so rapid navigation also keeps the latest input.
    const previous = pageMemory.read(key, initial.current);
    const result = typeof next === 'function' ? next(previous) : next;
    pageMemory.write(key, result);
    setValue(result);
  }, [key]);
  return [value, update];
}
