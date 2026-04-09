const AsyncStorage = {
    getItem: async (key) => localStorage.getItem(key),
    setItem: async (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); },
    removeItem: async (key) => { localStorage.removeItem(key); return Promise.resolve(); },
    clear: async () => { localStorage.clear(); return Promise.resolve(); },
};
export default AsyncStorage;
