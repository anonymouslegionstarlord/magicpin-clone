const test = require("node:test");
const assert = require("node:assert/strict");

const {
    CouponValidationError,
    calculatePricing
} = require("../utils/pricing");

const store = {
    _id: "store-1",
    deliveryFee: 40,
    freeDeliveryAbove: 500
};

const items = [
    {
        product: {
            _id: "product-1",
            price: 200
        },
        quantity: 2
    },
    {
        product: {
            _id: "product-2",
            price: 100
        },
        quantity: 1
    }
];

test("uses a restaurant's free-delivery threshold", () => {
    const pricing = calculatePricing({
        items,
        store
    });

    assert.deepEqual(pricing, {
        subtotal: 500,
        deliveryFee: 0,
        discount: 0,
        total: 500
    });
});

test("applies an item-specific percentage coupon", () => {
    const pricing = calculatePricing({
        items,
        store,
        coupon: {
            store: "store-1",
            isActive: true,
            type: "percentage",
            value: 10,
            minOrderAmount: 200,
            products: ["product-1"],
            startsAt: new Date("2020-01-01")
        }
    });

    assert.equal(pricing.eligibleSubtotal, 400);
    assert.equal(pricing.discount, 40);
    assert.equal(pricing.total, 460);
});

test("applies free delivery without trusting the browser", () => {
    const pricing = calculatePricing({
        items: [items[1]],
        store,
        coupon: {
            store: "store-1",
            isActive: true,
            type: "free_delivery",
            value: 0,
            minOrderAmount: 100,
            products: []
        }
    });

    assert.equal(pricing.deliveryFee, 40);
    assert.equal(pricing.discount, 40);
    assert.equal(pricing.total, 100);
});

test("rejects a coupon from another restaurant", () => {
    assert.throws(
        () =>
            calculatePricing({
                items,
                store,
                coupon: {
                    store: "store-2",
                    isActive: true,
                    type: "fixed_amount",
                    value: 50
                }
            }),
        CouponValidationError
    );
});
