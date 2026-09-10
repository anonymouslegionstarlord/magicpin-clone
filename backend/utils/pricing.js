class CouponValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "CouponValidationError";
    }
}

const roundMoney = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const normalizeId = (value) => {
    if (!value) {
        return "";
    }

    return String(value._id || value);
};

const calculateSubtotal = (items) =>
    roundMoney(
        items.reduce((total, item) => {
            const product = item.product;
            const price = Number(product?.price);
            const quantity = Number(item.quantity);

            if (
                !product ||
                !Number.isFinite(price) ||
                !Number.isFinite(quantity) ||
                quantity < 1
            ) {
                throw new Error("Cart contains an invalid product");
            }

            return total + price * quantity;
        }, 0)
    );

const calculateDeliveryFee = (subtotal, store = {}) => {
    const deliveryFee = Number.isFinite(Number(store.deliveryFee))
        ? Number(store.deliveryFee)
        : 40;

    const freeDeliveryAbove = Number.isFinite(
        Number(store.freeDeliveryAbove)
    )
        ? Number(store.freeDeliveryAbove)
        : 500;

    return subtotal >= freeDeliveryAbove
        ? 0
        : roundMoney(Math.max(0, deliveryFee));
};

const calculateEligibleSubtotal = (coupon, items, subtotal) => {
    const eligibleProductIds = new Set(
        (coupon.products || []).map(normalizeId).filter(Boolean)
    );

    if (eligibleProductIds.size === 0) {
        return subtotal;
    }

    return roundMoney(
        items.reduce((total, item) => {
            const productId = normalizeId(item.product);

            if (!eligibleProductIds.has(productId)) {
                return total;
            }

            return (
                total +
                Number(item.product.price) * Number(item.quantity)
            );
        }, 0)
    );
};

const evaluateCoupon = ({
    coupon,
    items,
    store,
    subtotal,
    deliveryFee,
    now = new Date()
}) => {
    if (!coupon || !coupon.isActive) {
        throw new CouponValidationError("Coupon is not active");
    }

    if (
        normalizeId(coupon.store) !== normalizeId(store)
    ) {
        throw new CouponValidationError(
            "Coupon does not belong to this restaurant"
        );
    }

    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
        throw new CouponValidationError("Coupon has not started yet");
    }

    if (coupon.endsAt && new Date(coupon.endsAt) < now) {
        throw new CouponValidationError("Coupon has expired");
    }

    const minimum = Number(coupon.minOrderAmount || 0);

    if (subtotal < minimum) {
        throw new CouponValidationError(
            `Add ₹${roundMoney(minimum - subtotal)} more to use this coupon`
        );
    }

    const eligibleSubtotal = calculateEligibleSubtotal(
        coupon,
        items,
        subtotal
    );

    if (eligibleSubtotal <= 0) {
        throw new CouponValidationError(
            "This coupon is not valid for the products in your cart"
        );
    }

    const value = Number(coupon.value || 0);
    let discount = 0;

    if (coupon.type === "percentage") {
        if (value <= 0 || value > 100) {
            throw new CouponValidationError(
                "Coupon has an invalid discount percentage"
            );
        }

        discount = eligibleSubtotal * (value / 100);
    } else if (coupon.type === "fixed_amount") {
        if (value <= 0) {
            throw new CouponValidationError(
                "Coupon has an invalid discount amount"
            );
        }

        discount = Math.min(value, eligibleSubtotal);
    } else if (coupon.type === "free_delivery") {
        discount = deliveryFee;
    } else {
        throw new CouponValidationError("Coupon type is not supported");
    }

    if (
        coupon.maxDiscount !== null &&
        coupon.maxDiscount !== undefined
    ) {
        discount = Math.min(
            discount,
            Number(coupon.maxDiscount)
        );
    }

    discount = roundMoney(
        Math.max(0, Math.min(discount, subtotal + deliveryFee))
    );

    return {
        subtotal,
        deliveryFee,
        discount,
        total: roundMoney(subtotal + deliveryFee - discount),
        eligibleSubtotal
    };
};

const calculatePricing = ({ items, store, coupon = null }) => {
    const subtotal = calculateSubtotal(items);
    const deliveryFee = calculateDeliveryFee(subtotal, store);

    if (!coupon) {
        return {
            subtotal,
            deliveryFee,
            discount: 0,
            total: roundMoney(subtotal + deliveryFee)
        };
    }

    return evaluateCoupon({
        coupon,
        items,
        store,
        subtotal,
        deliveryFee
    });
};

module.exports = {
    CouponValidationError,
    calculateDeliveryFee,
    calculatePricing,
    calculateSubtotal,
    evaluateCoupon,
    roundMoney
};
