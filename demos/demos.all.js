
// Import the jsonManager function
const jsonManager = require('../index').jsonManager();

// Write to the JSON object
jsonManager.write("nest.secondnest.third.nest", 10);
jsonManager.write("nest.secondnest.third\\.nest", 20);
jsonManager.write("nest.secondnest.third.nest\\.value", 30);

// Read from the JSON object
console.log('read("nest.secondnest.third.nest")', jsonManager.read("nest.secondnest.third.nest")); // Output: 10
console.log('read("nest.secondnest.third\\.nest")', jsonManager.read("nest.secondnest.third\\.nest")); // Output: 20
console.log('read("nest.secondnest.third.nest\\.value")', jsonManager.read("nest.secondnest.third.nest\\.value")); // Output: 30
console.log('read("nest.fakekey")', jsonManager.read("nest.fakekey")); // Output: undefined

// Search in the JSON object
console.log('search("nest.secondnest.third.nest")', jsonManager.search("nest.secondnest.third.nest")); // Output: 10 || true
console.log('search("nest.secondnest.fakekey")', jsonManager.search("nest.secondnest.fakekey")); // Output: false

// Dump the entire JSON object
console.log('dump()', jsonManager.dump());

// Get the entire JSON init of the path
console.log('init()', jsonManager.init());

// Write to the JSON object
jsonManager.write("nest.secondnest.third.nest", 10);

// Dump the entire JSON object
console.log('dump()', jsonManager.dump());

// Read the entire JSON object
console.log('read()', jsonManager.read("nest.secondnest.third.nest"));

// Get the entire JSON keys of the path
console.log('getKey()', jsonManager.getKeys("nest.secondnest.third.nest"));

// has the entire JSON keys of the path
console.log('hasKey()', jsonManager.hasKey("nest.secondnest.third.nest"));

