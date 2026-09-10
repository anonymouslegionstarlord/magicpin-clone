import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingProduct, setUpdatingProduct] = useState(null);
    const [removingProduct, setRemovingProduct] = useState(null);

    const token = localStorage.getItem("token");

    // ==========================================
    // FETCH CART
    // ==========================================

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchCart = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get("/cart", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setCart(response.data.cart);

            } catch (error) {
                console.log(error);

                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    navigate("/login");
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Unable to load cart"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchCart();

    }, [navigate, token]);


    // ==========================================
    // UPDATE QUANTITY
    // ==========================================

    const updateQuantity = async (
        productId,
        quantity
    ) => {
        if (quantity < 1) {
            return;
        }

        try {
            setUpdatingProduct(productId);

            const response = await API.put(
                `/cart/${productId}`,
                {
                    quantity
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCart(response.data.cart);

        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            alert(
                error.response?.data?.message ||
                "Unable to update cart"
            );

        } finally {
            setUpdatingProduct(null);
        }
    };


    // ==========================================
    // REMOVE ITEM
    // ==========================================

    const removeItem = async (productId) => {
        try {
            setRemovingProduct(productId);

            const response = await API.delete(
                `/cart/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCart(response.data.cart);

        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            alert(
                error.response?.data?.message ||
                "Unable to remove item"
            );

        } finally {
            setRemovingProduct(null);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-7xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-medium text-gray-500">
                            Loading your cart...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none absolute left-0 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center md:p-14">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50/70 text-4xl">
                            😕
                        </div>

                        <h1 className="mt-6 text-2xl font-black text-gray-900">
                            Unable to load cart
                        </h1>

                        <p className="mt-3 leading-6 text-gray-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="glass-orange mt-7 rounded-xl px-7 py-3 font-bold"
                        >
                            Browse Stores
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // EMPTY CART
    // ==========================================

    if (
        !cart ||
        !cart.items ||
        cart.items.length === 0
    ) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center md:p-14">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-100/70 text-5xl shadow-inner">
                            🛒
                        </div>

                        <h1 className="mt-7 text-3xl font-black text-gray-900">
                            Your Cart is Empty
                        </h1>

                        <p className="mt-3 text-gray-500">
                            Looks like you haven't added anything yet.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="glass-orange mt-8 rounded-xl px-8 py-3.5 font-bold"
                        >
                            Explore Stores →
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // MAIN CART
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* Background decoration */}

            <div className="pointer-events-none fixed -left-40 top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-orange-400/10 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 bottom-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-orange-300/10 blur-3xl" />


            <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="glass rounded-[1.5rem] p-5 md:p-7">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                    🛒
                                </div>

                                <div>

                                    <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                        Your Cart
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Review your items before checkout.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="glass-button rounded-xl px-5 py-3 text-sm font-bold text-gray-700 transition hover:text-orange-600"
                        >
                            ← Continue Shopping
                        </button>

                    </div>

                </div>


                {/* ==========================================
                    CART CONTENT
                ========================================== */}

                <div className="mt-7 grid gap-7 lg:grid-cols-3">

                    {/* ==========================================
                        CART ITEMS
                    ========================================== */}

                    <div className="lg:col-span-2">

                        <div className="mb-4 flex items-center justify-between">

                            <h2 className="text-xl font-black text-gray-900">
                                Cart Items
                            </h2>

                            <span className="rounded-full border border-white/70 bg-white/50 px-4 py-1.5 text-sm font-semibold text-gray-600 backdrop-blur">
                                {cart.items.length}{" "}
                                {cart.items.length === 1
                                    ? "item"
                                    : "items"}
                            </span>

                        </div>


                        <div className="space-y-4">

                            {cart.items.map((item) => {

                                const productId =
                                    item.product._id;

                                const itemTotal =
                                    item.product.price *
                                    item.quantity;

                                const isUpdating =
                                    updatingProduct ===
                                    productId;

                                const isRemoving =
                                    removingProduct ===
                                    productId;

                                return (

                                    <div
                                        key={productId}
                                        className="glass glass-hover overflow-hidden rounded-[1.5rem] p-5"
                                    >

                                        <div className="flex gap-4 sm:gap-5">

                                            {/* PRODUCT IMAGE */}

                                            {item.product.image ? (

                                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">

                                                    <img
                                                        src={
                                                            item.product.image
                                                        }
                                                        alt={
                                                            item.product.name
                                                        }
                                                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                                    />

                                                </div>

                                            ) : (

                                                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100/90 to-white/50 text-4xl shadow-inner sm:h-28 sm:w-28">
                                                    🍔
                                                </div>

                                            )}


                                            {/* PRODUCT DETAILS */}

                                            <div className="min-w-0 flex-1">

                                                <div className="flex items-start justify-between gap-3">

                                                    <div className="min-w-0">

                                                        <h2 className="truncate text-lg font-black text-gray-900 sm:text-xl">
                                                            {
                                                                item
                                                                    .product
                                                                    .name
                                                            }
                                                        </h2>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            ₹
                                                            {
                                                                item
                                                                    .product
                                                                    .price
                                                            }{" "}
                                                            each
                                                        </p>

                                                    </div>


                                                    {/* REMOVE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                productId
                                                            )
                                                        }
                                                        disabled={
                                                            isRemoving
                                                        }
                                                        className="shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-red-500 transition hover:bg-red-50/70 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isRemoving
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </button>

                                                </div>


                                                {/* QUANTITY + TOTAL */}

                                                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                    {/* Quantity */}

                                                    <div className="flex w-fit items-center overflow-hidden rounded-xl border border-white/80 bg-white/45 shadow-sm backdrop-blur">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    productId,
                                                                    item.quantity -
                                                                        1
                                                                )
                                                            }
                                                            disabled={
                                                                item.quantity <=
                                                                    1 ||
                                                                isUpdating
                                                            }
                                                            className="flex h-10 w-10 items-center justify-center text-xl font-bold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            −
                                                        </button>


                                                        <span className="flex h-10 min-w-12 items-center justify-center border-x border-white/70 px-3 font-bold text-gray-900">
                                                            {isUpdating
                                                                ? "..."
                                                                : item.quantity}
                                                        </span>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    productId,
                                                                    item.quantity +
                                                                        1
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            className="flex h-10 w-10 items-center justify-center text-xl font-bold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            +
                                                        </button>

                                                    </div>


                                                    {/* Item total */}

                                                    <div className="text-left sm:text-right">

                                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                            Item Total
                                                        </p>

                                                        <p className="mt-1 text-xl font-black text-orange-600">
                                                            ₹{itemTotal}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    </div>


                    {/* ==========================================
                        ORDER SUMMARY
                    ========================================== */}

                    <div>

                        <div className="glass-strong sticky top-24 rounded-[1.5rem] p-6 md:p-7">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                    🧾
                                </div>

                                <h2 className="text-xl font-black text-gray-900">
                                    Order Summary
                                </h2>

                            </div>


                            {/* Total */}

                            <div className="mt-7 rounded-2xl border border-white/70 bg-white/40 p-5 backdrop-blur">

                                <div className="flex items-center justify-between">

                                    <span className="font-medium text-gray-600">
                                        Cart Total
                                    </span>

                                    <span className="text-2xl font-black text-gray-900">
                                        ₹{cart.total}
                                    </span>

                                </div>

                            </div>


                            {/* Delivery information */}

                            <div className="mt-5 flex gap-3 rounded-xl border border-orange-100/70 bg-orange-50/50 p-4">

                                <span className="text-xl">
                                    🚚
                                </span>

                                <p className="text-sm leading-5 text-gray-500">
                                    Delivery charges will be calculated
                                    during checkout.
                                </p>

                            </div>


                            {/* Checkout */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/checkout")
                                }
                                className="glass-orange mt-6 w-full rounded-xl py-4 text-base font-black"
                            >
                                Proceed to Checkout →
                            </button>


                            {/* Continue */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/")
                                }
                                className="glass-button mt-3 w-full rounded-xl py-3.5 font-bold text-gray-700 transition hover:text-orange-600"
                            >
                                Continue Shopping
                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Cart;