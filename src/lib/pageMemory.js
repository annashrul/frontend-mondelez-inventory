// Session-only state: survives route unmounts without writing drafts to disk.
const values = new Map();
export const pageMemory = {
  read(key, initialValue) {
    if (!values.has(key)) values.set(key, typeof initialValue === 'function' ? initialValue() : initialValue);
    return values.get(key);
  },
  write(key, value) { values.set(key, value); },
  clear() { values.clear(); },
};
