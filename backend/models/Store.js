const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
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

        category: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        image: {
            type: String,
            default: ""
        },

        deliveryFee: {
            type: Number,
            default: 40,
            min: 0
        },

        freeDeliveryAbove: {
            type: Number,
            default: 500,
            min: 0
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },

            coordinates: {
                type: [Number],
                required: true
            }
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isArchived: {
            type: Boolean,
            default: false
        },

        archivedAt: {
            type: Date,
            default: null
        },

        source: {
            provider: {
                type: String,
                enum: ["manual", "openstreetmap"],
                default: "manual"
            },
            externalId: {
                type: String,
                trim: true
            },
            sourceUrl: {
                type: String,
                trim: true
            },
            license: {
                type: String,
                trim: true
            },
            lastSyncedAt: Date
        },

        menuSource: {
            name: {
                type: String,
                trim: true
            },
            authorized: {
                type: Boolean,
                default: false
            },
            sourceUrl: {
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

storeSchema.index({
    location: "2dsphere"
});

storeSchema.index(
    {
        "source.provider": 1,
        "source.externalId": 1
    },
    {
        unique: true,
        partialFilterExpression: {
            "source.provider": "openstreetmap",
            "source.externalId": {
                $type: "string"
            }
        }
    }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
