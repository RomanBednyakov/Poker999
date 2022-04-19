export const getLocalStorageItem = (key: string): any => {
    if (localStorage) {
        const result = localStorage.getItem(key) || '';
        return result ? JSON.parse(result) : '';
    }
    return '';
};

export const setLocalStorageItem = (key: string, value: unknown): void => {
    window.localStorage.setItem(key, JSON.stringify(value));
};

export const deleteLocalStorageItem = (key: string): void => {
    window.localStorage.removeItem(key);
};
