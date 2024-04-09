// In a new file, e.g., fetchData.js
export async function fetchData(prefix, url, expirationSec = null) {
    const theKey = `${prefix}#${url}`;
    let result = JSON.parse(localStorage.getItem(theKey));

    if (!result) {
        const keys = Object.keys(localStorage)
            .filter((key) => key.startsWith(prefix))
            .map((key) => key.split('#')[1]);

        while (keys.length >= 10) {
            const keyToDelete = Math.floor(Math.random() * keys.length)
            localStorage.removeItem(`${prefix}#${keys[keyToDelete]}`);
            keys.splice(keyToDelete, 1);
        }
        const response = await fetch(url);
        result = await response.json();

        localStorage.setItem(theKey, JSON.stringify(result));

        // If expirationSec is defined, start a timer to delete the key
        if (expirationSec) {
            setTimeout(() => {
                localStorage.removeItem(theKey);
                console.log(`Removed expired data for key: ${theKey}`);
            }, expirationSec * 1000); // Convert to milliseconds
        }
    }
    return result;
}