const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        name: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },

        // Delivery information
        address: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        // Ordered products
        items: [orderItemSchema],

        // Product subtotal
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        // Delivery charge
        deliveryFee: {
            type: Number,
            required: true,
            min: 0
        },

        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
            default: null
        },

        couponCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: ""
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        // Final amount
        total: {
            type: Number,
            required: true,
            min: 0
        },

        // Order status
        status: {
            type: String,
            enum: [
                "placed",
                "confirmed",
                "preparing",
                "ready",
                "out_for_delivery",
                "delivered",
                "cancelled"
            ],
            default: "placed"
        },

        // Payment status
        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
