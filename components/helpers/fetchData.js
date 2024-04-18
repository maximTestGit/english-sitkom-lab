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
export async function saveDataToLocalStorage(prefix, theKey, result, expirationSec) {
    if (expirationSec !== 0) { // 0 means no cache
        const keys = Object.keys(localStorage)
            .filter((key) => key.startsWith(prefix))
            .map((key) => key.split('#')[1]);

        while (keys.length >= 10) {
            const keyToDelete = Math.floor(Math.random() * keys.length)
            removeDataFromStorage(`${prefix}#${keys[keyToDelete]}`);
            keys.splice(keyToDelete, 1);
        }

        localStorage.setItem(theKey, JSON.stringify(result));

        if (expirationSec !== null) { // null means infinit cache
            setTimeout(() => {
                removeDataFromStorage(theKey);
                console.log(`Removed expired data for key: ${theKey}`);
            }, expirationSec * 1000); // Convert to milliseconds
        }
    }
}


export async function fetchData(prefix, url, expirationSec) {
    const theKey = `${prefix}#${url}`;
    let result = JSON.parse(localStorage.getItem(theKey));

    if (result && expirationSec === 0) { // no cach, but if found - remove
        removeDataFromStorage(theKey);
        result = null;
    }
    if (!result) { // not found or no cache
        result = await fetchDataFromSource(url);
        saveDataToLocalStorage(prefix, theKey, result, expirationSec);
    }

    return result;
}