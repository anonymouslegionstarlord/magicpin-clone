const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Product is not available"
            });
        }

        let cart = await Cart.findOne({
            user: req.userId
        });

        // Create cart if user doesn't have one
        if (!cart) {
            cart = await Cart.create({
                user: req.userId,
                store: product.store,
                items: [
                    {
                        product: product._id,
                        quantity
                    }
                ]
            });
        } else {

            // Don't allow products from another store
            if (
                cart.store &&
                cart.store.toString() !== product.store.toString()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Your cart contains products from another store"
                });
            }

            cart.store = product.store;

            const existingItem = cart.items.find(
                item =>
                    item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += Number(quantity);
            } else {
                cart.items.push({
                    product: product._id,
                    quantity
                });
            }

            await cart.save();
        }

        await calculateCartTotal(cart);

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product")
            .populate("store");

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: updatedCart
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const calculateCartTotal = async (cart) => {
    await cart.populate("items.product");

    let total = 0;

    cart.items.forEach(item => {
        total += item.product.price * item.quantity;
    });

    cart.total = total;

    await cart.save();
};


const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.userId
        })
            .populate("items.product")
            .populate("store");

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                    total: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            cart
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const cart = await Cart.findOne({
            user: req.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        item.quantity = Number(quantity);

        await cart.save();

        await calculateCartTotal(cart);

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product")
            .populate("store");

        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart: updatedCart
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({
            user: req.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemExists = cart.items.some(
            item => item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        if (cart.items.length === 0) {
            cart.store = null;
        }

        await cart.save();

        await calculateCartTotal(cart);

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product")
            .populate("store");

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: updatedCart
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = [];
        cart.store = null;
        cart.total = 0;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
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
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};