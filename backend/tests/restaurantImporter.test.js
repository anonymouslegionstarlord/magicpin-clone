const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildOverpassQuery,
    normalizeRestaurant,
    validateScanOptions
} = require("../services/restaurantImporter");

test("normalizes a mapped restaurant and preserves source identity", () => {
    const restaurant = normalizeRestaurant({
        type: "way",
        id: 123,
        center: {
            lat: 26.45,
            lon: 80.33
        },
        tags: {
            name: "Test Kitchen",
            amenity: "restaurant",
            cuisine: "north_indian",
            "addr:street": "Market Road",
            "addr:city": "Kanpur"
        }
    });

    assert.equal(restaurant.externalId, "way/123");
    assert.equal(restaurant.name, "Test Kitchen");
    assert.equal(restaurant.address, "Market Road, Kanpur");
    assert.equal(restaurant.longitude, 80.33);
    assert.match(restaurant.sourceUrl, /openstreetmap\.org\/way\/123/);
});

test("skips unnamed restaurant records", () => {
    assert.equal(
        normalizeRestaurant({
            type: "node",
            id: 99,
            lat: 1,
            lon: 1,
            tags: { amenity: "cafe" }
        }),
        null
    );
});

test("limits scan radius and restaurant count", () => {
    assert.throws(
        () =>
            validateScanOptions({
                latitude: 26,
                longitude: 80,
                radius: 50000,
                maxRestaurants: 50
            }),
        /radius/
    );
});

test("builds an Overpass query for food amenities", () => {
    const query = buildOverpassQuery({
        latitude: 26,
        longitude: 80,
        radius: 5000
    });

    assert.match(query, /restaurant\|fast_food\|cafe/);
    assert.match(query, /around:5000,26,80/);
});
