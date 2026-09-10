const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 160
        },
        category: {
            type: String,
            enum: [
                "order",
                "payment",
                "account",
                "store",
                "other"
            ],
            default: "other"
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open"
        }
    },
    {
        timestamps: true
    }
);

const SupportTicket = mongoose.model(
    "SupportTicket",
    supportTicketSchema
);

module.exports = SupportTicket;
