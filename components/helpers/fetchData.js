async function fetchDataFromSource(url) {
    const response = await fetch(url);
    const result = await response.json();
    return result;
}
// expirationSec===null - infinit cache
// expirationSec===0 - no cache
export async function fetchData(prefix, url, expirationSec) {
    const theKey = `${prefix}#${url}`;
    let result = JSON.parse(localStorage.getItem(theKey));

    if (expirationSec===null) {
        // infinit cache
        if (!result) {
            result = await fetchDataFromSource(url);
            localStorage.setItem(theKey, JSON.stringify(result));
        }
    } else if (expirationSec === 0) {
        // no cache
        if (result) {
            localStorage.removeItem(theKey);
        }
        result = await fetchDataFromSource(url);
    } else if (!result) {
        // exiration in cache
        const keys = Object.keys(localStorage)
            .filter((key) => key.startsWith(prefix))
            .map((key) => key.split('#')[1]);

        while (keys.length >= 10) {
            const keyToDelete = Math.floor(Math.random() * keys.length)
            localStorage.removeItem(`${prefix}#${keys[keyToDelete]}`);
            keys.splice(keyToDelete, 1);
        }
        result = await fetchDataFromSource(url);

        localStorage.setItem(theKey, JSON.stringify(result));

        setTimeout(() => {
            localStorage.removeItem(theKey);
            console.log(`Removed expired data for key: ${theKey}`);
        }, expirationSec * 1000); // Convert to milliseconds
    }


    return result;
}