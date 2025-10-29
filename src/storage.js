const Storage = (() => {
  const save = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const load = (key) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  };

  const clear = (key) => {
    localStorage.removeItem(key);
  };

  return { save, load, clear };
})();

export default Storage;
