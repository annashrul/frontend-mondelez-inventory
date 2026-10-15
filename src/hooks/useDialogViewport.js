import { useLayoutEffect } from 'react';
import { bindDialogViewport } from '@/lib/dialogViewport';

export default function useDialogViewport(content) {
  useLayoutEffect(() => {
    if (content) return bindDialogViewport(content);
  }, [content]);
}
