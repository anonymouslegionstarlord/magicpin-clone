const test = require("node:test");
const assert = require("node:assert/strict");

const {
    ImageValidationError,
    MAX_IMAGE_BYTES,
    normalizeImage
} = require("../utils/imageValidation");

test("accepts supported uploaded image data", () => {
    const image = `data:image/webp;base64,${Buffer.from("foodiehub").toString("base64")}`;

    assert.equal(normalizeImage(image), image);
});

test("accepts a remote HTTP or HTTPS image URL", () => {
    const image = "https://images.example.com/meal.webp";

    assert.equal(normalizeImage(image), image);
});

test("rejects SVG data URLs", () => {
    assert.throws(
        () =>
            normalizeImage(
                "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="
            ),
        ImageValidationError
    );
});

test("rejects uploaded images above the size limit", () => {
    const oversizedImage = `data:image/jpeg;base64,${Buffer.alloc(
        MAX_IMAGE_BYTES + 1
    ).toString("base64")}`;

    assert.throws(
        () => normalizeImage(oversizedImage),
        /too large/
    );
});

test("allows an image to be removed", () => {
    assert.equal(normalizeImage(""), "");
});
