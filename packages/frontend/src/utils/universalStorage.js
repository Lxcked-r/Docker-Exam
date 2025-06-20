export const universalStorage = {
  async get(key) {
    if (window.electronAPI && window.electronAPI.getStore) {
      return await window.electronAPI.getStore(key);
    } else {
      return JSON.parse(localStorage.getItem(key));
    }
  },
  async set(key, value) {
    if (window.electronAPI && window.electronAPI.setStore) {
      await window.electronAPI.setStore(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
};

export default universalStorage;