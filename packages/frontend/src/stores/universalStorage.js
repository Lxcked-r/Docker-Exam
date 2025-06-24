export const universalStorage = {
  async get(key) {
    if (window.electronAPI && key === "token") {
      return await window.electronAPI.getToken();
    }
    const value = localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  async set(key, value) {
    if (window.electronAPI && key === "token") {
      await window.electronAPI.saveToken(value);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
  async has(key) {
    if (window.electronAPI && key === "token") {
      const token = await window.electronAPI.getToken();
      return !!token;
    }
    return localStorage.getItem(key) !== null;
  }
};