const binyan = {
    cal: 0,
    nifal: 10,
    piel: 20,
    puel: 30,
    hifil: 40,
    hufal: 50,
    hitpael: 60
};

function getBinyanNameByCode(code) {
    // Iterate through the binyan object to find the matching code
    for (const [name, value] of Object.entries(binyan)) {
        if (value === code) {
            return name;
        }
    }
    // If no match is found, return null or an appropriate message
    return null;
}

// Example usage:
console.log(getBinyanNameByCode(0)); // Output: "piel"
console.log(getBinyanNameByCode(50)); // Output: "hufal"
console.log(getBinyanNameByCode(70)); // Output: null
