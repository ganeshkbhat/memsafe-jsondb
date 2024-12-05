const { expect } = require("chai");

// Import the createJsonManager function
const createJsonManager = require('../index');

describe("JsonManager", () => {
    let jsonManager;

    beforeEach(() => {
        // Create a new instance of JsonManager before each test
        jsonManager = createJsonManager();
    });

    describe("write()", () => {
        it("should write values to the JSON structure at the specified path", () => {
            jsonManager.write("nest.secondnest.third.nest", 10);
            expect(jsonManager.read("nest.secondnest.third.nest")).to.equal(10);
        });

        it("should create nested structures if they do not exist", () => {
            jsonManager.write("level1.level2.level3.value", 42);
            expect(jsonManager.read("level1.level2.level3.value")).to.equal(42);
        });

        it("should handle escaped dots correctly in keys", () => {
            jsonManager.write("escaped\\.key.level.nested", "test");
            expect(jsonManager.read("escaped\\.key.level.nested")).to.equal("test");
        });

        it("should overwrite existing values at the specified path", () => {
            jsonManager.write("key1.key2", "initial");
            jsonManager.write("key1.key2", "updated");
            expect(jsonManager.read("key1.key2")).to.equal("updated");
        });
    });

    describe("read()", () => {
        beforeEach(() => {
            jsonManager.write("nest.secondnest.third.nest", 10);
            jsonManager.write("escaped\\.key.level.nested", "test");
        });

        it("should return the value at the specified path", () => {
            expect(jsonManager.read("nest.secondnest.third.nest")).to.equal(10);
        });

        it("should return undefined for nonexistent paths", () => {
            expect(jsonManager.read("nonexistent.path")).to.be.undefined;
        });

        it("should handle escaped dots correctly in keys", () => {
            expect(jsonManager.read("escaped\\.key.level.nested")).to.equal("test");
        });
    });

    describe("search()", () => {
        beforeEach(() => {
            jsonManager.write("nest.secondnest.third.nest", 10);
            jsonManager.write("escaped\\.key.level.nested", "test");
        });

        it("should return true for existing paths", () => {
            expect(!!jsonManager.search("nest.secondnest.third.nest")).to.be.true;
        });

        it("should return false for nonexistent paths", () => {
            expect(!!jsonManager.search("nonexistent.path")).to.be.false;
        });

        it("should handle escaped dots correctly in keys", () => {
            expect(!!jsonManager.search("escaped\\.key.level.nested")).to.be.true;
        });
    });

    describe("dump()", () => {
        it("should return the entire JSON structure", () => {
            jsonManager.write("key1", 1);
            jsonManager.write("key2.subkey", 2);
            jsonManager.write("escaped\\.key", "value");
            const dump = jsonManager.dump();
            expect(dump).to.deep.equal({
                key1: 1,
                key2: { subkey: 2 },
                escaped: {
                    key: "value"
                }
            });
        });

        it("should not allow modification of the dumped JSON structure", () => {
            jsonManager.write("key", 1);
            const dump = jsonManager.dump();
            dump.key = 2; // Attempt to modify the dumped JSON
            expect(jsonManager.read("key")).to.equal(1); // Original JSON should remain unchanged
        });
    });


    describe("hasKey()", () => {

        beforeEach(() => {
            jsonManager.write("nest.secondnest.third.nest", 10);
            jsonManager.write("escaped\\.key.level.nested", "test");
        });

        it("should have key in JSON structure at the specified path", () => {
            expect(!!jsonManager.hasKey("nest.secondnest.third.nest")).to.equal(true);
        });

        it("should have key in JSON structure if they do not exist", () => {
            expect(!!jsonManager.hasKey("escaped\\.key.level.nested")).to.equal(true);
        });

    });

    describe("JsonManager Advanced Search", () => {
        let jsonManager;

        beforeEach(() => {
            jsonManager = createJsonManager();
            jsonManager.write("nest.secondnest.third.value", 42);
            jsonManager.write("example.like.path", "test");
            jsonManager.write("escaped\\.key.level", "value");
        });

        it("should return the value for a valid path search", () => {
            const result = jsonManager.has({ path: "nest.secondnest.third.value" });
            expect(result).to.deep.equal([{ path: "nest.secondnest.third.value", value: 42 }]);
        });

        it("should return matches for a like search", () => {
            const result = jsonManager.has({ like: "like" });
            expect(JSON.stringify(result)).to.deep.equal(JSON.stringify([
                { "path": "example.like", "value": { "path": "test" } },
                { "path": "example.like.path", "value": "test" }
            ]));
            expect(JSON.parse(JSON.stringify(result)).length).to.deep.equal(JSON.parse(JSON.stringify([
                { "path": "example.like", "value": { "path": "test" } },
                { "path": "example.like.path", "value": "test" }
            ])).length);
        });

        it("should return matches for a keyword search", () => {
            const result = jsonManager.has({ keywords: ["value", "like"] });
            expect(JSON.stringify(result)).to.be.equal(JSON.stringify([
                { "path": "nest.secondnest.third.value", "value": 42 },
                { "path": "example.like", "value": { "path": "test" } },
                { "path": "example.like.path", "value": "test" },
                { "path": "escaped\\.key.level", "value": "value" }
            ]));
            expect(JSON.parse(JSON.stringify(result)).length).to.equal(JSON.parse(JSON.stringify([
                { "path": "nest.secondnest.third.value", "value": 42 },
                { "path": "example.like", "value": { "path": "test" } },
                { "path": "example.like.path", "value": "test" },
                { "path": "escaped\\.key.level", "value": "value" }
            ])).length);
        });

        it("should return matches for a regex search", () => {
            const result = jsonManager.has({ regex: /example\..*\.path/ });
            expect(result).to.deep.equal([{ path: "example.like.path", value: "test" }]);
        });

        it("should return an empty array for no matches", () => {
            const result = jsonManager.has({ like: "nonexistent" });
            expect(result).to.deep.equal([]);
        });
    });


});
