async function fetchDataFromSource(url) {
    const response = await fetch(url);
    const result = await response.json();
    return result;
}

function removeDataFromStorage(theKey) {
    localStorage.removeItem(theKey);
}

// expirationSec === null - infinit storage
// expirationSec === 0 - no cache
export async function saveDataToLocalStorage(prefix, key, data, expirationSec) {
    if (expirationSec !== 0) { // 0 means no cache
        const keys = Object.keys(localStorage)
            .filter((k) => k.startsWith(prefix))
            .map((k) => k.split('#')[1]);

        while (keys.length >= 10) {
            const keyToDelete = Math.floor(Math.random() * keys.length)
            removeDataFromStorage(`${prefix}#${keys[keyToDelete]}`);
            keys.splice(keyToDelete, 1);
        }
        const dataKey = buildDataKey(prefix, key);
        localStorage.setItem(dataKey, JSON.stringify(data));

        if (expirationSec !== null) { // null means infinit cache
            setTimeout(() => {
                removeDataFromStorage(dataKey);
                console.log(`Removed expired data for key: ${dataKey}`);
            }, expirationSec * 1000); // Convert to milliseconds
        }
    }
}

export function getDataFromLocalStorage(prefix, key, expirationSec) {
    const dataKey = buildDataKey(prefix, key);
    let result = JSON.parse(localStorage.getItem(dataKey));
    if (result && expirationSec === 0) { // no cach, but if found - remove
        removeDataFromStorage(dataKey);
        result = null;
    }    
    return result;
}

function buildDataKey(prefix, key) {
    return `${prefix}#${key}`;
}

export async function fetchData(prefix, key, url, expirationSec) {
    let result = getDataFromLocalStorage(prefix, key, expirationSec);

    if (!result) { // not found or no cache
        result = await fetchDataFromSource(url);
        saveDataToLocalStorage(prefix, key, result, expirationSec);
    }

    return result;
}