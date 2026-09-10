const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            default: ""
        },

        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },

        isAvailable: {
            type: Boolean,
            default: true
        },

        source: {
            provider: {
                type: String,
                enum: ["manual", "merchant_feed"],
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

productSchema.index(
    {
        store: 1,
        "source.externalId": 1
    },
    {
        unique: true,
        partialFilterExpression: {
            "source.provider": "merchant_feed",
            "source.externalId": {
                $type: "string"
            }
        }
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
