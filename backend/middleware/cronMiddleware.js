const crypto = require("crypto");

const safeEqual = (actual, expected) => {
    const actualBuffer = Buffer.from(actual || "");
    const expectedBuffer = Buffer.from(expected || "");

    return (
        actualBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    );
};

const requireCronSecret = (req, res, next) => {
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
        return res.status(503).json({
            success: false,
            message: "Restaurant import automation is not configured"
        });
    }

    const authorization = req.headers.authorization || "";
    const providedSecret = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : "";

    if (!safeEqual(providedSecret, expectedSecret)) {
        return res.status(401).json({
            success: false,
            message: "Invalid automation credentials"
        });
    }

    next();
};

module.exports = requireCronSecret;
