import CryptoJS from 'crypto-js';

// #region local storage keys
const global_data_prefix = 'global';
const captions_data_prefix = 'captions';
const captions_range_data_prefix = 'captionsRange';
const videoList_data_prefix = 'videoList';
const session_data_prefix = 'session';
const playlist_key = 'playlist';
const video_key = 'video';
const allow_camera_key = 'allowCamera';
const your_line_playback_rate = 'yourLineSpeed';
const player_line_playback_rate = 'playerLineSpeed';
const player_line_playback_volume = 'playerLineVolume';
const whisper_playback_volume = 'whisperPlaybackVolume';
const learning_language = 'learningLanguage';
const playlist_registry_data_prefix = 'playlistRegistry'; 
const assitant_prompt = 'assistantPrompt';


export const session_data_keys = {
    playlist_key,
    video_key,
    allow_camera_key,
    your_line_playback_rate,
    player_line_playback_rate,
    player_line_playback_volume,
    whisper_playback_volume,
    learning_language,
    assitant_prompt
};
export const storageDataAttributes =
{
    global_data_prefix,
    captions_data_prefix,
    captions_range_data_prefix,
    videoList_data_prefix,
    playlist_registry_data_prefix,
    session_data_prefix,
    session_data_keys
};

// #endregion local storage keys

// #region local storage add/remove
function addDataToLocalStorage(prefix, key, data, expirationSec) {
    const dataKey = buildDataKey(prefix, key);
    localStorage.setItem(dataKey, JSON.stringify(data));
    console.log(`LingFlix: Saved data with key ${dataKey} to local storage.`);
    if (prefix !== global_data_prefix) {
        registerDataAtLocalStorage(prefix, key, expirationSec);
    }
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
export async function saveDataToLocalStorage(prefix, key, data, expirationSec = null) {
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

export function fetchDataFromLocalStorage(prefix, key, expirationSec = null) {
    let result = null;
    const dataKey = buildDataKey(prefix, key);
    const data = localStorage.getItem(dataKey);
    if (data && data !== 'undefined') {
        result = JSON.parse(data);
        if (result && expirationSec === 0) { // no cach, but if found - remove
            removeDataFromLocalStorage(prefix, key);
            result = null;
            console.log(`LingFlix: Removed data with key ${dataKey} from local storage.`);
        } else {
            console.log(`LingFlix: Fetched data with key ${dataKey} from local storage.`);
        }
    } else {
        console.log(`LingFlix: Data with key ${dataKey} not found in local storage.`);
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

export function removeDataFromLocalStorage(prefix, key) {
    const dataKey = buildDataKey(prefix, key);
    removeDataFromLocalStorageByKey(dataKey);
    unregisterDataAtLocalStorage(prefix, key);
    console.log(`LingFlix: removeDataFromLocalStorage: Removed data with key ${dataKey} from local storage.`);
}

export function saveLearningLanguageToLocalStorage(language) {
    saveDataToLocalStorage(
        storageDataAttributes.session_data_prefix,
        storageDataAttributes.session_data_keys.learning_language,
        language);
}

export function fetchLearningLanguageFromLocalStorage() {
    const result =
        fetchDataFromLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.learning_language,
            null);
    return result;
}

export function getHashCode(text) {
    return CryptoJS.SHA256(text).toString();
}