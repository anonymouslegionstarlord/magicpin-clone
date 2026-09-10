const {
    isAdminAccount
} = require("../utils/adminAccess");

const requireAdmin = (req, res, next) => {
    const hasAdminAccess = isAdminAccount({
        role: req.userRole,
        email: req.userEmail
    });

    if (!hasAdminAccess) {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};

module.exports = requireAdmin;
