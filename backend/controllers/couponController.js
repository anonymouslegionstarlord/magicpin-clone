const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Store = require("../models/Store");
const {
    CouponValidationError,
    calculatePricing
} = require("../utils/pricing");

const getStoreCoupons = async (req, res) => {
    try {
        const now = new Date();

        const coupons = await Coupon.find({
            store: req.params.storeId,
            isActive: true,
            startsAt: { $lte: now },
            $or: [
                { endsAt: null },
                { endsAt: { $gte: now } }
            ]
        })
            .populate("products", "name")
            .sort({ minOrderAmount: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: coupons.length,
            coupons
        });
    } catch (error) {
        console.error("Get coupons error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load coupons"
        });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const code = req.body.code?.trim().toUpperCase();

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required"
            });
        }

        const cart = await Cart.findOne({
            user: req.userId
        }).populate("items.product");

        if (!cart || cart.items.length === 0 || !cart.store) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const [store, coupon] = await Promise.all([
            Store.findById(cart.store),
            Coupon.findOne({
                store: cart.store,
                code
            }).populate("products", "name")
        ]);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found for this restaurant"
            });
        }

        const pricing = calculatePricing({
            items: cart.items,
            store,
            coupon
        });

        res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            coupon,
            pricing
        });
    } catch (error) {
        if (error instanceof CouponValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Validate coupon error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to validate coupon"
        });
    }
};

module.exports = {
    getStoreCoupons,
    validateCoupon
};
