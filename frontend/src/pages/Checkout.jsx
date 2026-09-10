import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    const [placingOrder, setPlacingOrder] = useState(false);

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

                const response = await API.get(
                    "/cart",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setCart(response.data.cart);

            } catch (error) {
                console.log("Cart error:", error);

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
    // PLACE ORDER
    // ==========================================

    const placeOrder = async (e) => {
        e.preventDefault();

        if (!address.trim()) {
            alert("Please enter your delivery address.");
            return;
        }

        if (!phone.trim()) {
            alert("Please enter your phone number.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone.trim())) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        try {
            setPlacingOrder(true);

            const response = await API.post(
                "/orders",
                {
                    address: address.trim(),
                    phone: phone.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Order created:",
                response.data
            );

            alert(
                response.data.message ||
                "Order placed successfully"
            );

            navigate("/orders");

        } catch (error) {
            console.log(
                "Place order error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            alert(
                error.response?.data?.message ||
                "Unable to place order"
            );

        } finally {
            setPlacingOrder(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-3xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-medium text-gray-500">
                            Loading checkout...
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

                <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center md:p-14">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50/70 text-4xl">
                            😕
                        </div>

                        <h1 className="mt-6 text-2xl font-black text-gray-900">
                            Checkout unavailable
                        </h1>

                        <p className="mt-3 leading-6 text-gray-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/cart")}
                            className="glass-orange mt-7 rounded-xl px-7 py-3 font-bold"
                        >
                            ← Back to Cart
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

                <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center md:p-14">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-100/70 text-5xl shadow-inner">
                            🛒
                        </div>

                        <h1 className="mt-7 text-3xl font-black text-gray-900">
                            Your Cart is Empty
                        </h1>

                        <p className="mt-3 text-gray-500">
                            Add some products before checking out.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="glass-orange mt-8 rounded-xl px-8 py-3.5 font-bold"
                        >
                            Browse Stores →
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // CALCULATE TOTALS
    // ==========================================

    const subtotal = cart.items.reduce(
        (total, item) => {
            return (
                total +
                item.product.price *
                item.quantity
            );
        },
        0
    );

    const deliveryFee =
        subtotal >= 500 ? 0 : 40;

    const total =
        subtotal + deliveryFee;


    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* Background decoration */}

            <div className="pointer-events-none fixed -left-40 top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-orange-400/10 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 bottom-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-orange-300/10 blur-3xl" />


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="mx-auto max-w-7xl px-4 pt-6">

                <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="glass-button rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:text-orange-600"
                >
                    ← Back to Cart
                </button>

            </div>


            {/* ==========================================
                MAIN
            ========================================== */}

            <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">

                {/* TITLE */}

                <div className="glass rounded-[1.5rem] p-6 md:p-7">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100/70 text-2xl">
                            🧾
                        </div>

                        <div>

                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                Checkout
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Complete your details to place your order.
                            </p>

                        </div>

                    </div>

                </div>


                {/* CONTENT */}

                <div className="mt-7 grid gap-7 lg:grid-cols-3">


                    {/* ==========================================
                        DELIVERY DETAILS
                    ========================================== */}

                    <div className="lg:col-span-2">

                        <form
                            onSubmit={placeOrder}
                            className="glass-strong rounded-[1.5rem] p-6 md:p-8"
                        >

                            {/* SECTION HEADER */}

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                    📍
                                </div>

                                <div>

                                    <h2 className="text-xl font-black text-gray-900">
                                        Delivery Details
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        Where should we deliver your order?
                                    </p>

                                </div>

                            </div>


                            {/* ADDRESS */}

                            <div className="mt-7">

                                <label
                                    htmlFor="address"
                                    className="mb-2 block text-sm font-bold text-gray-700"
                                >
                                    Delivery Address
                                </label>

                                <div className="glass-input rounded-xl">

                                    <textarea
                                        id="address"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your full delivery address"
                                        rows={4}
                                        required
                                        className="w-full resize-none bg-transparent px-4 py-3.5 text-gray-800 outline-none placeholder:text-gray-400"
                                    />

                                </div>

                            </div>


                            {/* PHONE */}

                            <div className="mt-5">

                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-bold text-gray-700"
                                >
                                    Phone Number
                                </label>

                                <div className="glass-input flex items-center rounded-xl px-4">

                                    <span className="mr-3 text-lg">
                                        📞
                                    </span>

                                    <input
                                        id="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="Enter 10-digit phone number"
                                        required
                                        className="w-full bg-transparent py-3.5 text-gray-800 outline-none placeholder:text-gray-400"
                                    />

                                </div>

                                <p className="mt-2 text-xs text-gray-400">
                                    Enter a valid 10-digit mobile number.
                                </p>

                            </div>


                            {/* ==========================================
                                ORDER ITEMS
                            ========================================== */}

                            <div className="mt-9">

                                <div className="flex items-center justify-between">

                                    <h2 className="text-xl font-black text-gray-900">
                                        Your Items
                                    </h2>

                                    <span className="rounded-full border border-white/70 bg-white/50 px-3 py-1 text-xs font-bold text-gray-500 backdrop-blur">
                                        {cart.items.length}{" "}
                                        {cart.items.length === 1
                                            ? "item"
                                            : "items"}
                                    </span>

                                </div>


                                <div className="mt-4 space-y-3">

                                    {cart.items.map((item) => (

                                        <div
                                            key={item.product._id}
                                            className="glass glass-hover rounded-2xl p-4"
                                        >

                                            <div className="flex items-center justify-between gap-4">

                                                <div className="flex min-w-0 items-center gap-4">

                                                    {/* IMAGE */}

                                                    {item.product.image ? (

                                                        <img
                                                            src={
                                                                item.product.image
                                                            }
                                                            alt={
                                                                item.product.name
                                                            }
                                                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                                        />

                                                    ) : (

                                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                                            🍔
                                                        </div>

                                                    )}


                                                    {/* NAME */}

                                                    <div className="min-w-0">

                                                        <h3 className="truncate font-bold text-gray-900">
                                                            {
                                                                item.product
                                                                    .name
                                                            }
                                                        </h3>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            ₹
                                                            {
                                                                item.product
                                                                    .price
                                                            }
                                                            {" × "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* ITEM TOTAL */}

                                                <p className="whitespace-nowrap font-black text-gray-900">
                                                    ₹
                                                    {item.product.price *
                                                        item.quantity}
                                                </p>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            </div>


                            {/* PLACE ORDER */}

                            <button
                                type="submit"
                                disabled={placingOrder}
                                className="glass-orange mt-8 w-full rounded-xl py-4 text-lg font-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {placingOrder
                                    ? "Placing Order..."
                                    : "Place Order →"}
                            </button>

                        </form>

                    </div>


                    {/* ==========================================
                        ORDER SUMMARY
                    ========================================== */}

                    <div>

                        <div className="glass-strong sticky top-24 rounded-[1.5rem] p-6 md:p-7">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                    💳
                                </div>

                                <h2 className="text-xl font-black text-gray-900">
                                    Order Summary
                                </h2>

                            </div>


                            {/* SUMMARY */}

                            <div className="mt-7 space-y-5">

                                {/* SUBTOTAL */}

                                <div className="flex justify-between text-gray-600">

                                    <span>
                                        Subtotal
                                    </span>

                                    <span className="font-bold text-gray-900">
                                        ₹{subtotal}
                                    </span>

                                </div>


                                {/* DELIVERY */}

                                <div className="flex justify-between text-gray-600">

                                    <span>
                                        Delivery Fee
                                    </span>

                                    <span
                                        className={
                                            deliveryFee === 0
                                                ? "font-bold text-green-600"
                                                : "font-bold text-gray-900"
                                        }
                                    >
                                        {deliveryFee === 0
                                            ? "FREE"
                                            : `₹${deliveryFee}`}
                                    </span>

                                </div>


                                {/* DIVIDER */}

                                <div className="border-t border-white/70 pt-5">

                                    <div className="flex items-center justify-between">

                                        <span className="text-lg font-black text-gray-900">
                                            Total
                                        </span>

                                        <span className="text-2xl font-black text-orange-600">
                                            ₹{total}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* FREE DELIVERY */}

                            {subtotal < 500 && (

                                <div className="mt-6 rounded-2xl border border-orange-100/70 bg-orange-50/60 p-4 backdrop-blur">

                                    <p className="text-sm font-bold text-orange-700">
                                        🚚 Free delivery on orders above ₹500
                                    </p>

                                    <p className="mt-1.5 text-xs leading-5 text-orange-600">
                                        Add ₹{500 - subtotal} more to get free delivery.
                                    </p>

                                </div>

                            )}


                            {subtotal >= 500 && (

                                <div className="mt-6 rounded-2xl border border-green-100/70 bg-green-50/60 p-4 backdrop-blur">

                                    <p className="text-sm font-bold text-green-700">
                                        🎉 You've unlocked free delivery!
                                    </p>

                                </div>

                            )}


                            {/* SECURE CHECKOUT */}

                            <div className="mt-4 rounded-2xl border border-green-100/70 bg-green-50/50 p-4 backdrop-blur">

                                <div className="flex gap-3">

                                    <span className="text-lg">
                                        🔒
                                    </span>

                                    <div>

                                        <p className="text-sm font-bold text-green-700">
                                            Secure Checkout
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-green-600">
                                            Your order information is protected.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Checkout;