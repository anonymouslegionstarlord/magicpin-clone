const User = require("../models/User");
const {
    isAdminAccount
} = require("../utils/adminAccess");
const {
    ImageValidationError,
    normalizeImage
} = require("../utils/imageValidation");

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

const updateProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.profileImage = normalizeImage(req.body.image);
        await user.save();

        const safeUser = await User.findById(user._id).select("-password");

        res.status(200).json({
            success: true,
            message: user.profileImage
                ? "Profile picture updated successfully"
                : "Profile picture removed successfully",
            user: safeUser,
            permissions: {
                ownerDashboard: isAdminAccount(safeUser)
            }
        });
    } catch (error) {
        if (error instanceof ImageValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log("Update profile image error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getMyProfile,
    updateProfileImage
};
