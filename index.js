

/**
 * Converts a single-level JSON object with dot notation keys into a nested JSON object.
 * 
 * @param {Object} obj - The single-level JSON object to convert.
 * @returns {Object} - A nested JSON object.
 */
function unflattenJson(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error("Input must be a non-null object.");
    }

    const result = {};

    for (const fullKey in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, fullKey)) {
            // Split keys while handling escaped dots
            const keys = fullKey.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));

            let current = result;

            keys.forEach((key, index) => {
                if (index === keys.length - 1) {
                    // Final key - assign the value
                    current[key] = obj[fullKey];
                } else {
                    // Intermediate key - create object if it doesn't exist
                    if (!current[key] || typeof current[key] !== 'object') {
                        current[key] = {};
                    }
                    current = current[key];
                }
            });
        }
    }

    return result;
}


/**
 * Flattens a nested JSON object into a single level with dot notation keys,
 * escaping dots in keys with double backslashes.
 * 
 * @param {Object} obj - The nested JSON object to flatten.
 * @param {string} [prefix=""] - The prefix for nested keys (used for recursion).
 * @returns {Object} - A single level object with escaped dot notation keys.
 */
function flattenJsonWithEscaping(obj, prefix = "") {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error("Input must be a non-null object.");
    }

    const result = {};

    function escapeKey(key) {
        return key.replace(/\./g, '\\.');
    }

    function recurse(current, keyPrefix) {
        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const escapedKey = escapeKey(key);
                const newKey = keyPrefix ? `${keyPrefix}.${escapedKey}` : escapedKey;

                if (typeof current[key] === 'object' && current[key] !== null) {
                    // Recurse for nested objects
                    recurse(current[key], newKey);
                } else {
                    // Assign primitive values
                    result[newKey] = current[key];
                }
            }
        }
    }

    recurse(obj, prefix);
    return result;
}

/**
 * Reads a nested value from a JSON object using dot notation, interpreting escaped dots in keys.
 * 
 * @param {Object} obj - The JSON object to read from.
 * @param {string} path - The dot notation path to the desired value (e.g., "nest\\.secondnest.thirdnest").
 * @returns {*} - The value at the specified path, or undefined if the path does not exist.
 */
function getNestedValueWithEscaping(obj, path) {
    if (!obj || typeof path !== 'string') {
        return undefined;
    }

    // Split the path on unescaped dots and replace escaped dots with actual dots
    const keys = path.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));

    return keys.reduce((current, key) => {
        if (current && typeof current === 'object' && key in current) {
            return current[key];
        }
        return undefined; // Key does not exist at this level
    }, obj);
}

// // Example Usage:
// const data1 = { "nest.secondnest": { thirdnest: 10 } };
// console.log(getNestedValueWithEscaping(data1, "nest\\.secondnest.thirdnest")); // Output: 10

// const data2 = { test: { tester: { testing: "10" } } };
// console.log(getNestedValueWithEscaping(data2, "test.tester.testing")); // Output: "10"

// const data3 = { "nest.secondnest": { "third.nest": 20 } };
// console.log(getNestedValueWithEscaping(data3, "nest\\.secondnest.third\\.nest")); // Output: 20

// const data4 = { test: { tester: { testing: "10", makeup: 10 }, madeup: 20 }, fakeup: 30 };
// console.log(getNestedValueWithEscaping(data4, "test.tester.testing")); // Output: "10"
// console.log(getNestedValueWithEscaping(data4, "test.madeup")); // Output: 20
// console.log(getNestedValueWithEscaping(data4, "fakeup")); // Output: 30


/**
 * Writes a value to a nested JSON object using dot notation, creating any necessary levels.
 * Properly handles escaped dots in keys.
 *
 * @param {Object} obj - The JSON object to write to.
 * @param {string} path - The dot notation path where the value should be written (e.g., "nest\\.secondnest.thirdnest").
 * @param {*} value - The value to write.
 */
function setNestedValueWithEscaping(obj, path, value) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error("First argument must be a non-null object.");
    }
    if (typeof path !== 'string') {
        throw new Error("Path must be a string.");
    }

    // Split the path on unescaped dots and replace escaped dots with actual dots
    const keys = path.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));

    let current = obj;
    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            // Final key - assign the value
            current[key] = value;
        } else {
            // Create the object if it doesn't exist
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
    });
}

// // Example Usage:
// const data1 = {};
// setNestedValueWithEscaping(data1, "nest\\.secondnest.thirdnest", 10);
// console.log(JSON.stringify(data1, null, 2));
// // Output:
// // {
// //   "nest.secondnest": {
// //     "thirdnest": 10
// //   }
// // }

// const data2 = { test: { tester: {} } };
// setNestedValueWithEscaping(data2, "test.tester.testing", "hello");
// console.log(JSON.stringify(data2, null, 2));
// // Output:
// // {
// //   "test": {
// //     "tester": {
// //       "testing": "hello"
// //     }
// //   }
// // }

// const data3 = {};
// setNestedValueWithEscaping(data3, "a\\.b.c\\.d.e", 42);
// console.log(JSON.stringify(data3, null, 2));
// // Output:
// // {
// //   "a.b": {
// //     "c.d": {
// //       "e": 42
// //     }
// //   }
// // }


/**
 * Searches for a value in a nested JSON object using dot notation.
 * Handles escaped dots in keys.
 *
 * @param {Object} obj - The JSON object to search in.
 * @param {string} path - The dot notation path to search for (e.g., "nest\\.secondnest.thirdnest").
 * @returns {*} - The value at the specified path, or undefined if not found.
 */
function searchNestedValueWithEscaping(obj, path) {
    if (!obj || typeof obj !== 'object') {
        throw new Error("First argument must be a non-null object.");
    }
    if (typeof path !== 'string') {
        throw new Error("Path must be a string.");
    }

    // Split the path on unescaped dots and replace escaped dots with actual dots
    const keys = path.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));

    // Traverse the object to find the value
    let current = obj;
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined; // Path does not exist
        }
    }
    return current;
}

// // Example Usage:
// const data1 = {
//     nest: {
//         secondnest: {
//             third: {
//                 nest: 10
//             }
//         }
//     }
// };
// console.log(searchNestedValueWithEscaping(data1, "nest.secondnest.third.nest")); // Output: 10

// const data2 = {
//     "nest.secondnest.third\\.nest": 10
// };
// console.log(searchNestedValueWithEscaping(data2, "nest\\.secondnest.third\\.nest")); // Output: 10

// const data3 = {
//     nest: {
//         secondnest: {
//             "third.nest": 20
//         }
//     }
// };
// console.log(searchNestedValueWithEscaping(data3, "nest.secondnest.third\\.nest")); // Output: 20

// const data4 = {
//     "a\\.b": {
//         "c\\.d": {
//             e: 42
//         }
//     }
// };
// console.log(searchNestedValueWithEscaping(data4, "a\\.b.c\\.d.e")); // Output: 42



/**
 * Checks if a key exists in a nested JSON object using dot notation.
 * Handles escaped dots in keys.
 *
 * @param {Object} obj - The JSON object to search in.
 * @param {string} path - The dot notation path to check for (e.g., "nest\\.secondnest.third.nest").
 * @returns {boolean} - True if the key exists, otherwise false.
 */
function hasNestedKeyWithEscaping(obj, path) {
    if (!obj || typeof obj !== 'object') {
        throw new Error("First argument must be a non-null object.");
    }
    if (typeof path !== 'string') {
        throw new Error("Path must be a string.");
    }

    // Split the path on unescaped dots and replace escaped dots with actual dots
    const keys = path.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));

    // Traverse the object to check for key presence
    let current = obj;
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return false; // Key does not exist
        }
    }
    return true;
}

// // Example Usage:
// const data1 = {
//     nest: {
//         secondnest: {
//             third: {
//                 nest: 10
//             }
//         }
//     }
// };
// console.log(hasNestedKeyWithEscaping(data1, "nest.secondnest.third.nest")); // Output: true
// console.log(hasNestedKeyWithEscaping(data1, "nest.secondnest.third.fake")); // Output: false

// const data2 = {
//     "nest.secondnest.third\\.nest": 10
// };
// console.log(hasNestedKeyWithEscaping(data2, "nest\\.secondnest.third\\.nest")); // Output: true
// console.log(hasNestedKeyWithEscaping(data2, "nest.secondnest.third\\.fake")); // Output: false

// const data3 = {
//     nest: {
//         secondnest: {
//             "third.nest": 20
//         }
//     }
// };
// console.log(hasNestedKeyWithEscaping(data3, "nest.secondnest.third\\.nest")); // Output: true
// console.log(hasNestedKeyWithEscaping(data3, "nest.secondnest.third")); // Output: false

// const data4 = {
//     "a\\.b": {
//         "c\\.d": {
//             e: 42
//         }
//     }
// };
// console.log(hasNestedKeyWithEscaping(data4, "a\\.b.c\\.d.e")); // Output: true
// console.log(hasNestedKeyWithEscaping(data4, "a\\.b.c\\.d.f")); // Output: false

/**
 * Searches for a value in a nested JSON object using dot notation.
 * Handles escaped dots in keys.
 *
 * @param {Object} obj - The JSON object to search in.
 * @param {string} path - The dot notation path to search for (e.g., "nest\\.secondnest.third.nest").
 * @returns {*} - The value at the specified path, or undefined if not found.
 */
function getNestedValueWithEscaping(obj, path) {
    if (!obj || typeof obj !== 'object') {
        throw new Error("First argument must be a non-null object.");
    }
    if (typeof path !== 'string') {
        throw new Error("Path must be a string.");
    }

    // Split the path on unescaped dots and replace escaped dots with actual dots
    const keys = path.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));

    // Traverse the object to find the value
    let current = obj;
    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined; // Path does not exist
        }
    }
    return current;
}

// // Example Usage:
// const data1 = {
//     nest: {
//         secondnest: {
//             third: {
//                 nest: 10
//             }
//         }
//     }
// };
// console.log(getNestedValueWithEscaping(data1, "nest.secondnest.third.nest")); // Output: 10
// console.log(getNestedValueWithEscaping(data1, "nest.secondnest.third.fake")); // Output: undefined

// const data2 = {
//     "nest.secondnest.third\\.nest": 10
// };
// console.log(getNestedValueWithEscaping(data2, "nest\\.secondnest.third\\.nest")); // Output: 10
// console.log(getNestedValueWithEscaping(data2, "nest.secondnest.third\\.fake")); // Output: undefined

// const data3 = {
//     nest: {
//         secondnest: {
//             "third.nest": 20
//         }
//     }
// };
// console.log(getNestedValueWithEscaping(data3, "nest.secondnest.third\\.nest")); // Output: 20
// console.log(getNestedValueWithEscaping(data3, "nest.secondnest.third")); // Output: undefined

// const data4 = {
//     "a\\.b": {
//         "c\\.d": {
//             e: 42
//         }
//     }
// };
// console.log(getNestedValueWithEscaping(data4, "a\\.b.c\\.d.e")); // Output: 42
// console.log(getNestedValueWithEscaping(data4, "a\\.b.c\\.d.f")); // Output: undefined


/**
 * Creates a closure for managing a private JSON object with functions to read, write, search, and dump values.
 * All operations respect the dot notation with escaped dots (`\\.`) in keys.
 */
function createJsonManager() {
    // Private JSON object within the closure
    let jsonObject = {};

    function searchJson(json, { path, like, keywords, regex }) {
        const results = [];
    
        function escapeDots(key) {
            return key.replace(/\\\./g, ".");
        }
    
        function searchPath(obj, currentPath, targetPath) {
            const normalizedPath = escapeDots(targetPath);
            const keys = normalizedPath.split(".");
            let current = obj;
    
            for (const key of keys) {
                if (current && key in current) {
                    current = current[key];
                } else {
                    return null;
                }
            }
            return current;
        }
    
        function deepSearch(obj, currentPath = "") {
            for (const key in obj) {
                const escapedKey = key.replace(/\./g, "\\.");
                const fullPath = currentPath ? `${currentPath}.${escapedKey}` : escapedKey;
    
                // Match `like`
                if (like && fullPath.includes(like)) {
                    results.push({ path: fullPath, value: obj[key] });
                }
    
                // Match `keywords`
                if (keywords && keywords.some(kw => fullPath.includes(kw) || (typeof obj[key] === "string" && obj[key].includes(kw)))) {
                    results.push({ path: fullPath, value: obj[key] });
                }
    
                // Match `regex`
                if (regex && regex.test(fullPath)) {
                    results.push({ path: fullPath, value: obj[key] });
                }
    
                // Recursive search for nested objects
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    deepSearch(obj[key], fullPath);
                }
            }
        }
    
        // Perform Path Search
        if (path) {
            const value = searchPath(json, "", path);
            if (value !== null) {
                results.push({ path, value });
            }
        }
    
        // Perform Like, Keywords, and Regex Searches
        if (like || keywords || regex) {
            deepSearch(json);
        }
    
        return results;
    }
    

    /**
     * Splits the path into keys, accounting for escaped dots.
     */
    function getKeys(path) {
        return path.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));
    }

    /**
     * Reads a nested value from the JSON object using dot notation with escape characters.
     */
    function read(path) {
        return getNestedValueWithEscaping(jsonObject, path)
    }

    /**
     * Writes a value to the nested JSON object, creating necessary nested levels.
     * Uses dot notation with escape characters.
     */
    function write(path, value) {
        setNestedValueWithEscaping(jsonObject, path, value);
    }

    /**
     * Searches for the presence of a key at a nested level using dot notation with escape characters returning presence of key
     */
    function hasKey(path) {
        return hasNestedKeyWithEscaping(jsonObject, path);
    }

    function has(criteria) {
        return searchJson(jsonObject, criteria);
    }
    
    /**
     * Searches for the presence of a key at a nested level using dot notation with escape characters returning value
     */
    function search(path) {
        return searchNestedValueWithEscaping(jsonObject, path);
    }

    /**
     * Dumps the entire JSON object.
     */
    function dump() {
        // convert to nested value
        return JSON.parse(JSON.stringify(unflattenJson(jsonObject))); // Deep clone the JSON object
    }

    /**
     * Dumps the entire JSON object.
     */
    function init(obj) {
        // convert to nested value
        jsonObject = JSON.parse(JSON.stringify(flattenJsonWithEscaping(obj || {}))); // Deep clone the JSON object
    }

    // Return the public API with all the methods
    return {
        read,
        write,
        has,
        search,
        dump,
        hasKey,
        getKeys,
        init
    };
}

// Example Usage:
const jsonManager = createJsonManager();

module.exports = createJsonManager;
