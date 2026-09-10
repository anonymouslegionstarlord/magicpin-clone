const Store = require("../models/Store");
const {
    ImageValidationError,
    normalizeImage
} = require("../utils/imageValidation");

const createStore = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            address,
            phone,
            image,
            longitude,
            latitude
        } = req.body;

        if (
            !name ||
            !category ||
            !address ||
            longitude === undefined ||
            latitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const store = await Store.create({
            name,
            description,
            category,
            address,
            phone,
            image: normalizeImage(image),

            location: {
                type: "Point",
                coordinates: [
                    longitude,
                    latitude
                ]
            },

            owner: req.userId
        });

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            store
        });

    } catch (error) {
        if (error instanceof ImageValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getStores = async (req, res) => {
    try {
        const stores = await Store.find({
            isActive: true
        });

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findOne({
            _id: id,
            isActive: true
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        res.status(200).json({
            success: true,
            store
        });

    } catch (error) {
        console.log("Get store by ID error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getNearbyStores = async (req, res) => {
    try {
        const {
            longitude,
            latitude,
            distance = 5000
        } = req.query;

        // Check if coordinates exist
        if (
            longitude === undefined ||
            latitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Longitude and latitude are required"
            });
        }

        const userLongitude = Number(longitude);
        const userLatitude = Number(latitude);
        const maxDistance = Number(distance);

        // Check if coordinates are valid numbers
        if (
            !Number.isFinite(userLongitude) ||
            !Number.isFinite(userLatitude)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid longitude or latitude"
            });
        }

        // Check valid latitude range
        if (
            userLatitude < -90 ||
            userLatitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message: "Latitude must be between -90 and 90"
            });
        }

        // Check valid longitude range
        if (
            userLongitude < -180 ||
            userLongitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Longitude must be between -180 and 180"
            });
        }

        // Check distance
        if (
            !Number.isFinite(maxDistance) ||
            maxDistance <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Distance must be a positive number"
            });
        }

        console.log("Nearby store search:");
        console.log("Longitude:", userLongitude);
        console.log("Latitude:", userLatitude);
        console.log("Max distance:", maxDistance, "meters");

        const stores = await Store.find({
            isActive: true,

            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            userLongitude,
                            userLatitude
                        ]
                    },

                    $maxDistance: maxDistance
                }
            }
        });

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.log("Nearby stores error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const searchStores = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const stores = await Store.find({
            isActive: true,
            $or: [
                {
                    name: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        });

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const getStoresByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        const stores = await Store.find({
            isActive: true,
            category: {
                $regex: `^${category}$`,
                $options: "i"
            }
        });

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.log("Category stores error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getMyStores = async (req, res) => {
    try {
        const storeFilter =
            req.userRole === "admin"
                ? {}
                : { owner: req.userId };

        const stores = await Store.find(storeFilter);

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.log("Get my stores error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const updateStore = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findById(id);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // Verify store ownership
        if (
            req.userRole !== "admin" &&
            store.owner.toString() !==
            req.userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not the owner of this store"
            });
        }

        const {
            name,
            description,
            category,
            address,
            phone,
            image,
            longitude,
            latitude,
            isActive
        } = req.body;

        // Update basic store information
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Store name cannot be empty"
                });
            }

            store.name = name.trim();
        }

        if (description !== undefined) {
            store.description = description.trim();
        }

        if (category !== undefined) {
            if (!category.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category cannot be empty"
                });
            }

            store.category = category.trim();
        }

        if (address !== undefined) {
            if (!address.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Address cannot be empty"
                });
            }

            store.address = address.trim();
        }

        if (phone !== undefined) {
            store.phone = phone.trim();
        }

        if (image !== undefined) {
            store.image = normalizeImage(image);
        }

        // Update location
        if (
            longitude !== undefined ||
            latitude !== undefined
        ) {
            const currentLongitude =
                store.location.coordinates[0];

            const currentLatitude =
                store.location.coordinates[1];

            const newLongitude =
                longitude !== undefined
                    ? Number(longitude)
                    : currentLongitude;

            const newLatitude =
                latitude !== undefined
                    ? Number(latitude)
                    : currentLatitude;

            if (
                !Number.isFinite(newLongitude) ||
                !Number.isFinite(newLatitude)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid longitude or latitude"
                });
            }

            if (
                newLongitude < -180 ||
                newLongitude > 180
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Longitude must be between -180 and 180"
                });
            }

            if (
                newLatitude < -90 ||
                newLatitude > 90
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Latitude must be between -90 and 90"
                });
            }

            store.location = {
                type: "Point",
                coordinates: [
                    newLongitude,
                    newLatitude
                ]
            };
        }

        // Update active status
        if (isActive !== undefined) {
            store.isActive = Boolean(isActive);
        }

        await store.save();

        res.status(200).json({
            success: true,
            message: "Store updated successfully",
            store
        });

    } catch (error) {
        if (error instanceof ImageValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log("Update store error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};





module.exports = {
    createStore,
    getStores,
    getStoreById,
    getNearbyStores,
    searchStores,
    getStoresByCategory,
    getMyStores,
    updateStore
};
