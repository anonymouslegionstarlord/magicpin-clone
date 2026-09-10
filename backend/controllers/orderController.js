const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Store = require("../models/Store");
const Coupon = require("../models/Coupon");
const {
    isAdminAccount
} = require("../utils/adminAccess");
const {
    CouponValidationError,
    calculatePricing
} = require("../utils/pricing");


// =====================================================
// OWNER - GET STORE ORDERS
// =====================================================

const getStoreOrders = async (req, res) => {
    try {

        // Find ALL stores owned by the logged-in user.
        // Do NOT check isActive here.
        // An owner should still be able to see/manage
        // existing orders even if the store is closed.

        const storeFilter =
            req.userRole === "admin"
                ? {}
                : { owner: req.userId };

        const stores = await Store.find(
            storeFilter
        ).select("_id");

        const storeIds = stores.map(
            (store) => store._id
        );

        // If owner has no stores
        if (storeIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                orders: []
            });
        }

        // Find orders belonging to owner's stores
        const orders = await Order.find({
            store: {
                $in: storeIds
            }
        })
            .populate("store")
            .populate("user")
            .populate("items.product")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {

        console.log(
            "Get store orders error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// ADMIN - CLEAR ALL ORDERS
// =====================================================

const clearAllOrders = async (req, res) => {
    try {
        const result = await Order.deleteMany({});

        res.status(200).json({
            success: true,
            message: "All orders cleared successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {

        console.log(
            "Clear all orders error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// CUSTOMER - CREATE ORDER
// =====================================================

const createOrder = async (req, res) => {
    try {

        const {
            address,
            phone,
            couponCode
        } = req.body;


        // Validate address
        if (
            !address ||
            !address.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }


        // Validate phone
        if (
            !phone ||
            !phone.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }


        if (
            !/^[0-9]{10}$/.test(
                phone.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid 10-digit phone number"
            });
        }


        // Find user's cart
        const cart = await Cart.findOne({
            user: req.userId
        }).populate(
            "items.product"
        );


        // Check cart
        if (
            !cart ||
            cart.items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }


        // Check store
        if (!cart.store) {
            return res.status(400).json({
                success: false,
                message:
                    "Store information is missing from cart"
            });
        }

        const store = await Store.findById(cart.store);

        if (!store || !store.isActive) {
            return res.status(400).json({
                success: false,
                message: "Restaurant is not available"
            });
        }


        // Check product availability
        for (
            const item of cart.items
        ) {

            if (
                !item.product ||
                !item.product.isAvailable
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "One or more products are unavailable"
                });
            }
        }


        const normalizedCouponCode = couponCode
            ?.trim()
            .toUpperCase();

        let coupon = null;

        if (normalizedCouponCode) {
            coupon = await Coupon.findOne({
                store: cart.store,
                code: normalizedCouponCode
            });

            if (!coupon) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon not found for this restaurant"
                });
            }
        }

        const pricing = calculatePricing({
            items: cart.items,
            store,
            coupon
        });


        // Create order items
        const orderItems =
            cart.items.map(
                (item) => ({
                    product:
                        item.product._id,

                    name:
                        item.product.name,

                    price:
                        item.product.price,

                    quantity:
                        item.quantity
                })
            );


        const {
            subtotal,
            deliveryFee,
            discount,
            total
        } = pricing;


        // Create order
        const order =
            await Order.create({

                user:
                    req.userId,

                store:
                    cart.store,

                address:
                    address.trim(),

                phone:
                    phone.trim(),

                items:
                    orderItems,

                subtotal,

                deliveryFee,

                coupon:
                    coupon?._id || null,

                couponCode:
                    coupon?.code || "",

                discount,

                total
            });


        // Clear cart
        cart.items = [];

        cart.store = null;

        cart.total = 0;

        await cart.save();


        // Populate created order
        const populatedOrder =
            await Order.findById(
                order._id
            )
                .populate("store")
                .populate("items.product");


        res.status(201).json({
            success: true,
            message:
                "Order placed successfully",
            order:
                populatedOrder
        });

    } catch (error) {

        if (error instanceof CouponValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.log(
            "Create order error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// CUSTOMER - GET MY ORDERS
// =====================================================

const getMyOrders = async (req, res) => {
    try {

        const orders =
            await Order.find({
                user: req.userId
            })
                .populate("store")
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            success: true,
            count:
                orders.length,
            orders
        });

    } catch (error) {

        console.log(
            "Get my orders error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// CUSTOMER - GET ONE ORDER
// =====================================================

const getOrderById = async (req, res) => {
    try {

        const canManageOrder = isAdminAccount({
            role: req.userRole,
            email: req.userEmail
        });

        const orderFilter = canManageOrder
            ? { _id: req.params.id }
            : {
                _id: req.params.id,
                user: req.userId
            };

        const order =
            await Order.findOne(orderFilter)
                .populate("store")
                .populate("user", "name email phone")
                .populate(
                    "items.product"
                );


        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found"
            });
        }


        res.status(200).json({
            success: true,
            canManage: canManageOrder,
            order
        });

    } catch (error) {

        console.log(
            "Get order by ID error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// OWNER - UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus = async (req, res) => {
    try {

        const {
            status
        } = req.body;


        const allowedStatuses = [
            "placed",
            "confirmed",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ];


        // Check status exists
        if (!status) {
            return res.status(400).json({
                success: false,
                message:
                    "Order status is required"
            });
        }


        // Check valid status
        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status"
            });
        }


        // Find order
        const order =
            await Order.findById(
                req.params.id
            ).populate("store");


        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found"
            });
        }


        // Check store
        if (!order.store) {
            return res.status(404).json({
                success: false,
                message:
                    "Store not found"
            });
        }


        // Check ownership
        if (
            req.userRole !== "admin" &&
            order.store.owner.toString() !==
            req.userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not the owner of this store"
            });
        }


        // Update status
        order.status =
            status;

        await order.save();


        // Get updated order
        const updatedOrder =
            await Order.findById(
                order._id
            )
                .populate("store")
                .populate("user")
                .populate(
                    "items.product"
                );


        res.status(200).json({
            success: true,
            message:
                "Order status updated successfully",

            order:
                updatedOrder
        });

    } catch (error) {

        console.log(
            "Update order status error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getStoreOrders,
    clearAllOrders
};
