const User = require("../models/User");
const {
    isAdminAccount
} = require("../utils/adminAccess");

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user,
            permissions: {
                ownerDashboard: isAdminAccount(user)
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getMyProfile
};
