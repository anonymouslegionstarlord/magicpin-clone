const SupportTicket = require("../models/SupportTicket");

const allowedCategories = [
    "order",
    "payment",
    "account",
    "store",
    "other"
];

const normalizeText = (value) =>
    typeof value === "string"
        ? value.trim()
        : "";

const createSupportTicket = async (req, res) => {
    try {
        const name = normalizeText(req.body.name);
        const email = normalizeText(
            req.body.email
        ).toLowerCase();
        const category = normalizeText(
            req.body.category
        );
        const subject = normalizeText(
            req.body.subject
        );
        const message = normalizeText(
            req.body.message
        );
        const website = normalizeText(
            req.body.website
        );

        // Silently accept bot submissions that fill the hidden field.
        if (website) {
            return res.status(201).json({
                success: true,
                message: "Your message has been received",
                reference: "SUP-RECEIVED"
            });
        }

        if (
            !name ||
            !email ||
            !category ||
            !subject ||
            !message
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required fields"
            });
        }

        if (
            name.length < 2 ||
            name.length > 80 ||
            subject.length < 3 ||
            subject.length > 120 ||
            message.length < 10 ||
            message.length > 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Please check the length of your message details"
            });
        }

        if (
            email.length > 160 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid help category"
            });
        }

        const ticket = await SupportTicket.create({
            name,
            email,
            category,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully",
            reference: `SUP-${ticket._id
                .toString()
                .slice(-8)
                .toUpperCase()}`
        });

    } catch (error) {
        console.error(
            "Create support ticket error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to send your message"
        });
    }
};

module.exports = {
    createSupportTicket
};
