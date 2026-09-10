const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        type: {
            type: String,
            enum: [
                "percentage",
                "fixed_amount",
                "free_delivery"
            ],
            required: true
        },
        value: {
            type: Number,
            default: 0,
            min: 0
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        maxDiscount: {
            type: Number,
            default: null,
            min: 0
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        startsAt: {
            type: Date,
            default: Date.now
        },
        endsAt: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        },
        source: {
            provider: {
                type: String,
                enum: ["manual", "merchant_feed", "platform"],
                default: "manual"
            },
            externalId: {
                type: String,
                trim: true
            },
            lastSyncedAt: Date
        }
    },
    {
        timestamps: true
    }
);

couponSchema.index(
    {
        store: 1,
        code: 1
    },
    {
        unique: true
    }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
