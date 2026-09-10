const Product = require("../models/Product");
const Store = require("../models/Store");
const {
    ImageValidationError,
    normalizeImage
} = require("../utils/imageValidation");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            storeId
        } = req.body;

        if (
            !name ||
            price === undefined ||
            !category ||
            !storeId
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Check whether store exists
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // Check whether logged-in user owns the store
        if (
            req.userRole !== "admin" &&
            store.owner.toString() !== req.userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not the owner of this store"
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image: normalizeImage(image),
            store: storeId
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
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


const getProductsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;

        const products = await Product.find({
            store: storeId,
            isAvailable: true
        });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("store");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!product.store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    // Check store ownership
    if (
      req.userRole !== "admin" &&
      product.store.owner.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this store"
      });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      isAvailable
    } = req.body;

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (price !== undefined) {
      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative"
        });
      }

      product.price = Number(price);
    }

    if (category !== undefined) {
      product.category = category.trim();
    }

    if (image !== undefined) {
      product.image = normalizeImage(image);
    }

    if (isAvailable !== undefined) {
      product.isAvailable = Boolean(isAvailable);
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("store");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.log("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("store");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!product.store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    // Check store ownership
    if (
      req.userRole !== "admin" &&
      product.store.owner.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this store"
      });
    }

    await Product.findByIdAndDelete(product._id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.log("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const toggleProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("store");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (!product.store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    // Check store ownership
    if (
      req.userRole !== "admin" &&
      product.store.owner.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this store"
      });
    }

    product.isAvailable = !product.isAvailable;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("store");

    res.status(200).json({
      success: true,
      message: product.isAvailable
        ? "Product is now available"
        : "Product is now unavailable",
      product: updatedProduct
    });
  } catch (error) {
    console.log("Toggle product availability error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
    createProduct,
    getProductsByStore,
    updateProduct,
    deleteProduct,
    toggleProductAvailability
};
