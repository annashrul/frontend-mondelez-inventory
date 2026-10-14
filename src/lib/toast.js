import { toast as sonnerToast } from 'sonner';
import { translate } from '@/lib/i18n';

const messageMethods = new Set(['success', 'error', 'info', 'warning', 'message', 'loading']);
function localizedArguments(args) {
  const [message, options, ...rest] = args;
  return [translate(message), options ? { ...options, description: translate(options.description) } : options, ...rest];
}
export const toast = new Proxy(sonnerToast, {
  apply(target, thisArg, args) { return Reflect.apply(target, thisArg, localizedArguments(args)); },
  get(target, key) {
    const value = Reflect.get(target, key);
    return messageMethods.has(key) && typeof value === 'function'
      ? (...args) => Reflect.apply(value, target, localizedArguments(args))
      : value;
  },
});
