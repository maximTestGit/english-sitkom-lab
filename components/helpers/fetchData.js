const global_data_prefix = 'global';
const captions_data_prefix = 'captions';
const videoList_data_prefix = 'videoList';
const session_data_prefix = 'session';
const playlist_key = 'playlist';
const video_key = 'video';

export const session_data_keys = { playlist_key, video_key };
export const storageDataAttributes = 
    { 
        global_data_prefix, 
        captions_data_prefix, 
        videoList_data_prefix, 
        session_data_prefix,
        session_data_keys };

async function fetchDataFromSource(url) {
    const response = await fetch(url);
    const result = await response.json();
    return result;
}

// #region local storage add/remove
function addDataToLocalStorage(prefix, key, data, expirationSec) {
    const dataKey = buildDataKey(prefix, key);
    localStorage.setItem(dataKey, JSON.stringify(data));
    console.log(`LingFlix: Saved data with key ${dataKey} to local storage.`);
    if (prefix !== global_data_prefix) {
        registerDataAtLocalStorage(prefix, key, expirationSec);
    }
}

export function removeDataFromLocalStorage(prefix, key) {
    const dataKey = buildDataKey(prefix, key);
    removeDataFromLocalStorageByKey(dataKey);
    unregisterDataAtLocalStorage(prefix, key);
}

function removeDataFromLocalStorageByKey(dataKey) {
    localStorage.removeItem(dataKey);
    console.log(`LingFlix: Removed data with key ${dataKey} from local storage.`);
    unregisterDataAtLocalStorageByKey(dataKey);
}

// #endregion local storage add/remove

// #region dataKey
function buildDataKey(prefix, key) {
    return `${prefix}#${key}`;
}

function splitDataKey(str) {
    return str.split('#');
}

// #endregion dataKey

// #region registry
async function registerDataAtLocalStorage(prefix, key, expirationSec) {
    const dataKey = buildDataKey(prefix, key);
    const registryItem = {
        key: dataKey,
        expirationSec: expirationSec,
        registeredAt: Date.now()
    };
    let registry = fetchDataFromLocalStorage(global_data_prefix, 'registry', null) || [];

    // Find the index of the item with the same key in the registry
    const index = registry.findIndex(item => item.key === dataKey);

    // If the item exists in the registry, remove it
    if (index !== -1) {
        registry.splice(index, 1);
    }

    registry.push(registryItem);
    saveDataToLocalStorage(global_data_prefix, 'registry', registry, null);
}

async function unregisterDataAtLocalStorage(prefix, key) {
    const dataKey = buildDataKey(prefix, key);
    unregisterDataAtLocalStorageByKey(dataKey);
}

async function unregisterDataAtLocalStorageByKey(dataKey) {
    let registry = fetchDataFromLocalStorage(global_data_prefix, 'registry', null) || [];

    // Find the index of the item with the same key in the registry
    const index = registry.findIndex(item => item.key === dataKey);

    // If the item exists in the registry, remove it
    if (index !== -1) {
        registry.splice(index, 1);
        console.log(`LingFlix: Unregistered data with key ${dataKey} from local storage registry.`);
    }

    saveDataToLocalStorage(global_data_prefix, 'registry', registry, null);
}
// #endregion registry

// expirationSec === null - infinit storage
// expirationSec === 0 - no cache
export async function saveDataToLocalStorage(prefix, key, data, expirationSec=null) {
    if (expirationSec !== 0) { // 0 means no cache
        const keys = Object.keys(localStorage)
            .filter((k) => k.startsWith(prefix))
            .map((k) => k.split('#')[1]);

        while (keys.length >= 10) {
            const keyToDelete = Math.floor(Math.random() * keys.length)
            removeDataFromLocalStorage(prefix, keys[keyToDelete]);
            keys.splice(keyToDelete, 1);
        }
        addDataToLocalStorage(prefix, key, data, expirationSec);
    }
}

export function fetchDataFromLocalStorage(prefix, key, expirationSec) {
    const dataKey = buildDataKey(prefix, key);
    let result = JSON.parse(localStorage.getItem(dataKey));
    if (result && expirationSec === 0) { // no cach, but if found - remove
        removeDataFromLocalStorage(prefix, key);
        result = null;
    }
    console.log(`LingFlix: Fetched data with key ${dataKey} from local storage.`);
    return result;
}

export async function fetchData(prefix, key, url, expirationSec, refetchFromSource = false) {
    if (refetchFromSource) {
        removeDataFromLocalStorage(prefix, key);
    }
    let result = fetchDataFromLocalStorage(prefix, key, expirationSec);

    if (!result) { // not found or no cache
        result = await fetchDataFromSource(url);
        saveDataToLocalStorage(prefix, key, result, expirationSec);
    }

    return result;
}

export async function cleanUpLocalStorage(deleteAll = false) {
    if (deleteAll) {
        localStorage.clear();
        console.log('LingFlix: Cleared all data from local storage.');
    } else {
        const registry = fetchDataFromLocalStorage(global_data_prefix, 'registry', null) || [];
        const currentTime = Date.now();
        registry.forEach(item => {
            if (item.expirationSec !== null && currentTime - item.registeredAt > item.expirationSec * 1000) {
                removeDataFromLocalStorageByKey(item.key);
            }
        });

        const allKeys = Object.keys(localStorage);
        // Filter out keys that don't start with any of the prefixes in storageDataAttributes
        const invalidKeys = allKeys.filter(key => {
            return (!Object.values(storageDataAttributes).some(prefix => key.startsWith(prefix)));
        });
        // Delete these keys from localStorage
        invalidKeys.forEach(key => {
            removeDataFromLocalStorageByKey(key);
        });
    }
}