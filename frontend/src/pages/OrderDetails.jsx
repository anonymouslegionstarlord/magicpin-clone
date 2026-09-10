import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";

function OrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [canManage, setCanManage] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // ==========================================
    // ORDER STATUS FLOW
    // ==========================================

    const statusFlow = [
        "placed",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered"
    ];


    // ==========================================
    // STATUS LABEL
    // ==========================================

    const getStatusLabel = (status) => {
        switch (status) {
            case "placed":
                return "Order Placed";

            case "confirmed":
                return "Confirmed";

            case "preparing":
                return "Preparing";

            case "ready":
                return "Ready";

            case "out_for_delivery":
                return "Out for Delivery";

            case "delivered":
                return "Delivered";

            case "cancelled":
                return "Cancelled";

            default:
                return status || "Unknown";
        }
    };


    // ==========================================
    // STATUS ICON
    // ==========================================

    const getStatusIcon = (status) => {
        switch (status) {
            case "placed":
                return "📝";

            case "confirmed":
                return "✓";

            case "preparing":
                return "👨‍🍳";

            case "ready":
                return "📦";

            case "out_for_delivery":
                return "🛵";

            case "delivered":
                return "🎉";

            default:
                return "•";
        }
    };


    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    const getPaymentStatus = (status) => {
        if (!status) {
            return "Pending";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
    };


    const getPaymentClasses = (status) => {
        switch (status) {
            case "paid":
                return "border-green-200/70 bg-green-50/70 text-green-700";

            case "failed":
                return "border-red-200/70 bg-red-50/70 text-red-700";

            default:
                return "border-yellow-200/70 bg-yellow-50/70 text-yellow-700";
        }
    };


    // ==========================================
    // DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };


    // ==========================================
    // FETCH ORDER
    // ==========================================

    const fetchOrder = useCallback(
        async (showRefresh = false) => {
            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Please login to continue");
                    return;
                }

                const response = await API.get(
                    `/orders/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setOrder(response.data.order);
                setCanManage(
                    response.data.canManage === true
                );

            } catch (error) {
                console.log(
                    "Fetch order error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load order"
                );

            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [id]
    );


    // ==========================================
    // INITIAL FETCH
    // ==========================================

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrder();
        }, 0);

        return () => {
            clearTimeout(timer);
        };
    }, [fetchOrder]);


    // ==========================================
    // ADMIN STATUS UPDATE
    // ==========================================

    const updateOrderStatus = async (status) => {
        try {
            setUpdatingStatus(true);
            setStatusMessage("");

            const token = localStorage.getItem("token");
            const response = await API.put(
                `/orders/${id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOrder(response.data.order);
            setStatusMessage(
                response.data.message ||
                "Order status updated"
            );
        } catch (error) {
            setStatusMessage(
                error.response?.data?.message ||
                "Unable to update order status"
            );
        } finally {
            setUpdatingStatus(false);
        }
    };


    // ==========================================
    // AUTO REFRESH
    // ==========================================

    useEffect(() => {
        if (!order) {
            return;
        }

        if (
            order.status === "delivered" ||
            order.status === "cancelled"
        ) {
            return;
        }

        const interval = setInterval(() => {
            fetchOrder(true);
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [order, fetchOrder]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-5xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100/70 text-4xl shadow-lg">
                            📦
                        </div>

                        <div className="mx-auto mt-7 h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Loading order...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error && !order) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50/70 text-4xl">
                            ⚠️
                        </div>

                        <h1 className="mt-6 text-2xl font-black text-gray-900">
                            Unable to load order
                        </h1>

                        <p className="mt-3 text-gray-500">
                            {error}
                        </p>

                        <Link
                            to="/orders"
                            className="glass-orange mt-7 inline-flex rounded-xl px-7 py-3.5 font-black"
                        >
                            ← Back to Orders
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // ORDER NOT FOUND
    // ==========================================

    if (!order) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-14 text-center">

                        <div className="text-6xl">
                            🔎
                        </div>

                        <h1 className="mt-6 text-2xl font-black text-gray-900">
                            Order not found
                        </h1>

                        <p className="mt-2 text-gray-500">
                            We couldn't find the requested order.
                        </p>

                        <Link
                            to="/orders"
                            className="glass-orange mt-7 inline-flex rounded-xl px-7 py-3.5 font-black"
                        >
                            ← Back to Orders
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // CURRENT STATUS
    // ==========================================

    const currentIndex =
        statusFlow.indexOf(order.status);


    const subtotal = Number(
        order.subtotal || 0
    );

    const deliveryFee = Number(
        order.deliveryFee || 0
    );

    const discount = Number(
        order.discount || 0
    );

    const total = Number(
        order.total || subtotal + deliveryFee
    );


    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* ==========================================
                BACKGROUND
            ========================================== */}

            <div className="pointer-events-none fixed -left-40 top-24 -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-400/15 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 top-[35rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-200/10 blur-3xl" />


            <main className="mx-auto max-w-6xl px-4 py-7 md:py-10">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="glass-strong rounded-[2rem] p-5 shadow-xl md:p-7">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex min-w-0 items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 text-2xl shadow-sm">
                                📦
                            </div>

                            <div className="min-w-0">

                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Order Details
                                </p>

                                <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
                                    #{order._id.slice(-8).toUpperCase()}
                                </h1>

                                <p className="mt-2 break-all text-xs text-gray-400">
                                    {order._id}
                                </p>

                                <p className="mt-2 text-sm font-medium text-gray-500">
                                    Ordered on {formatDate(order.createdAt)}
                                </p>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    fetchOrder(true)
                                }
                                disabled={refreshing}
                                className="glass-button rounded-xl px-5 py-3 text-sm font-black text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {refreshing
                                    ? "Refreshing..."
                                    : "↻ Refresh"}
                            </button>

                            <Link
                                to={
                                    canManage
                                        ? "/owner/orders"
                                        : "/orders"
                                }
                                className="glass-orange inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black"
                            >
                                {canManage
                                    ? "← Admin Orders"
                                    : "← My Orders"}
                            </Link>

                        </div>

                    </div>

                </div>


                {canManage && (
                    <div className="glass-strong mt-6 rounded-2xl border border-orange-200/70 p-5 shadow-lg">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Atlas Admin Controls
                                </p>
                                <p className="mt-2 font-black text-gray-900">
                                    {order.user?.name || "Customer"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {order.user?.email || "Email unavailable"}
                                </p>
                            </div>

                            <div className="min-w-64">
                                <label
                                    htmlFor="admin-order-status"
                                    className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500"
                                >
                                    Manage status
                                </label>
                                <select
                                    id="admin-order-status"
                                    value={order.status}
                                    onChange={(event) =>
                                        updateOrderStatus(
                                            event.target.value
                                        )
                                    }
                                    disabled={updatingStatus}
                                    className="glass-input w-full rounded-xl px-4 py-3 font-bold text-gray-800 outline-none disabled:opacity-60"
                                >
                                    {[
                                        ...statusFlow,
                                        "cancelled"
                                    ].map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {getStatusLabel(status)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {statusMessage && (
                            <p className="mt-3 text-sm font-bold text-orange-700">
                                {statusMessage}
                            </p>
                        )}
                    </div>
                )}


                {/* ==========================================
                    STATUS + PAYMENT
                ========================================== */}

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                    <div className="glass rounded-2xl p-5 shadow-lg">

                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                            Current Order Status
                        </p>

                        <div className="mt-3 flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                {getStatusIcon(order.status)}
                            </div>

                            <div>
                                <p className="text-lg font-black text-orange-600">
                                    {getStatusLabel(order.status)}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {order.status === "delivered"
                                        ? "Your order has been delivered."
                                        : order.status === "cancelled"
                                            ? "This order has been cancelled."
                                            : "Your order is being processed."}
                                </p>
                            </div>

                        </div>

                    </div>


                    <div className="glass rounded-2xl p-5 shadow-lg">

                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                            Payment Status
                        </p>

                        <div className="mt-3 flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100/70 text-xl">
                                💳
                            </div>

                            <span
                                className={`rounded-full border px-4 py-2 text-sm font-black ${getPaymentClasses(
                                    order.paymentStatus
                                )}`}
                            >
                                {getPaymentStatus(
                                    order.paymentStatus
                                )}
                            </span>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    LIVE TRACKING
                ========================================== */}

                {order.status !== "delivered" &&
                    order.status !== "cancelled" && (

                        <div className="glass mt-6 rounded-2xl border border-blue-100/70 bg-blue-50/50 p-5 shadow-sm backdrop-blur-xl">

                            <div className="flex items-start gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/60 text-xl shadow-sm">
                                    🔄
                                </div>

                                <div>

                                    <p className="font-black text-blue-700">
                                        Live Order Tracking
                                    </p>

                                    <p className="mt-1 text-sm text-blue-600">
                                        This page automatically checks for status updates every 10 seconds.
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}


                {/* ==========================================
                    ERROR DURING REFRESH
                ========================================== */}

                {error && order && (

                    <div className="glass mt-5 rounded-2xl border border-red-200/70 bg-red-50/60 px-5 py-4">

                        <div className="flex items-center gap-3">

                            <span className="text-xl">
                                ⚠️
                            </span>

                            <p className="text-sm font-bold text-red-700">
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* ==========================================
                    TRACKING
                ========================================== */}

                {order.status === "cancelled" ? (

                    <div className="glass-strong mt-7 rounded-[2rem] p-6 shadow-xl md:p-8">

                        <div className="rounded-2xl border border-red-200/70 bg-red-50/60 p-6">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100/70 text-3xl">
                                ❌
                            </div>

                            <h2 className="mt-5 text-2xl font-black text-red-700">
                                Order Cancelled
                            </h2>

                            <p className="mt-2 text-sm text-red-600">
                                This order has been cancelled.
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="glass-strong mt-7 rounded-[2rem] p-6 shadow-xl md:p-8">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Live Tracking
                                </p>

                                <h2 className="mt-1 text-2xl font-black text-gray-900">
                                    Track Your Order
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Follow your order from placement to delivery.
                                </p>

                            </div>

                            <span className="self-start rounded-full border border-orange-200/70 bg-orange-50/70 px-4 py-2 text-xs font-black text-orange-700">
                                {getStatusLabel(order.status)}
                            </span>

                        </div>


                        <div className="mt-8">

                            {statusFlow.map(
                                (status, index) => {

                                    const completed =
                                        currentIndex >= 0 &&
                                        index <= currentIndex;

                                    const current =
                                        status === order.status;

                                    const isLast =
                                        index ===
                                        statusFlow.length - 1;

                                    return (
                                        <div
                                            key={status}
                                            className="relative"
                                        >

                                            {/* CONNECTOR */}

                                            {!isLast && (

                                                <div
                                                    className={`absolute left-6 top-14 h-10 w-0.5 ${
                                                        index < currentIndex
                                                            ? "bg-green-400"
                                                            : "bg-gray-200/80"
                                                    }`}
                                                />

                                            )}


                                            {/* STATUS CARD */}

                                            <div
                                                className={`relative mb-3 flex items-center gap-4 rounded-2xl border p-3 backdrop-blur-xl transition ${
                                                    current
                                                        ? "border-orange-200/80 bg-orange-50/70 shadow-lg shadow-orange-100/50"
                                                        : completed
                                                            ? "border-green-100/80 bg-green-50/50"
                                                            : "border-white/60 bg-white/30"
                                                }`}
                                            >

                                                {/* ICON */}

                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                                                        completed
                                                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                                            : "bg-gray-100/80 text-gray-400"
                                                    } ${
                                                        current
                                                            ? "ring-4 ring-orange-100/80"
                                                            : ""
                                                    }`}
                                                >
                                                    {completed
                                                        ? getStatusIcon(status)
                                                        : index + 1}
                                                </div>


                                                {/* TEXT */}

                                                <div className="min-w-0 flex-1">

                                                    <p
                                                        className={`font-black ${
                                                            current
                                                                ? "text-orange-600"
                                                                : completed
                                                                    ? "text-green-700"
                                                                    : "text-gray-400"
                                                        }`}
                                                    >
                                                        {getStatusLabel(
                                                            status
                                                        )}
                                                    </p>

                                                    {current && (

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Current order status
                                                        </p>

                                                    )}

                                                </div>


                                                {/* CURRENT BADGE */}

                                                {current && (

                                                    <span className="hidden rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white sm:block">
                                                        Current
                                                    </span>

                                                )}

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>
                )}


                {/* ==========================================
                    STORE + DELIVERY
                ========================================== */}

                <div className="mt-7 grid gap-7 md:grid-cols-2">


                    {/* STORE */}

                    <div className="glass-strong rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                🏪
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                                    Restaurant / Store
                                </p>

                                <h2 className="text-xl font-black text-gray-900">
                                    Store Information
                                </h2>

                            </div>

                        </div>


                        <div className="glass mt-5 rounded-2xl p-5">

                            <p className="text-lg font-black text-gray-900">
                                {order.store?.name ||
                                    "Store"}
                            </p>

                            {order.store?.address && (

                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                    📍 {order.store.address}
                                </p>

                            )}

                            {order.store?.phone && (

                                <p className="mt-3 text-sm text-gray-500">
                                    📞 {order.store.phone}
                                </p>

                            )}

                        </div>

                    </div>


                    {/* DELIVERY */}

                    <div className="glass-strong rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                🛵
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                                    Delivery
                                </p>

                                <h2 className="text-xl font-black text-gray-900">
                                    Delivery Details
                                </h2>

                            </div>

                        </div>


                        <div className="mt-5 space-y-3">

                            <div className="glass rounded-2xl p-4">

                                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    Address
                                </p>

                                <p className="mt-2 text-sm font-bold leading-6 text-gray-700">
                                    {order.address ||
                                        "Not available"}
                                </p>

                            </div>


                            <div className="glass rounded-2xl p-4">

                                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    Phone
                                </p>

                                <p className="mt-2 text-sm font-bold text-gray-700">
                                    📞 {order.phone ||
                                        "Not available"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    ORDER ITEMS
                ========================================== */}

                <div className="glass-strong mt-7 rounded-[2rem] p-6 shadow-xl md:p-8">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                Your Purchase
                            </p>

                            <h2 className="mt-1 text-2xl font-black text-gray-900">
                                Ordered Items
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Products included in this order.
                            </p>

                        </div>

                        <span className="self-start rounded-full border border-white/70 bg-white/50 px-4 py-2 text-xs font-black text-gray-500">
                            {order.items?.length || 0}{" "}
                            {order.items?.length === 1
                                ? "item"
                                : "items"}
                        </span>

                    </div>


                    <div className="mt-6 space-y-3">

                        {order.items?.map(
                            (item, index) => (

                                <div
                                    key={
                                        item.product?._id ||
                                        index
                                    }
                                    className="glass glass-hover rounded-2xl p-4"
                                >

                                    <div className="flex items-center justify-between gap-4">

                                        <div className="flex min-w-0 items-center gap-4">

                                            {/* PRODUCT IMAGE */}

                                            {item.product?.image ? (

                                                <img
                                                    src={
                                                        item.product
                                                            .image
                                                    }
                                                    alt={
                                                        item.name
                                                    }
                                                    className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-sm"
                                                />

                                            ) : (

                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                                    🍔
                                                </div>

                                            )}


                                            <div className="min-w-0">

                                                <p className="truncate font-black text-gray-900">
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    ₹
                                                    {Number(
                                                        item.price ||
                                                        0
                                                    ).toFixed(2)}

                                                    {" × "}

                                                    {item.quantity}
                                                </p>

                                            </div>

                                        </div>


                                        <p className="whitespace-nowrap text-lg font-black text-gray-900">

                                            ₹
                                            {(
                                                Number(
                                                    item.price ||
                                                    0
                                                ) *
                                                Number(
                                                    item.quantity ||
                                                    0
                                                )
                                            ).toFixed(2)}

                                        </p>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>


                {/* ==========================================
                    BILL + PAYMENT
                ========================================== */}

                <div className="mt-7 grid gap-7 md:grid-cols-2">


                    {/* BILL */}

                    <div className="glass-strong rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                🧾
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                                    Payment Breakdown
                                </p>

                                <h2 className="text-xl font-black text-gray-900">
                                    Bill Details
                                </h2>

                            </div>

                        </div>


                        <div className="mt-6 space-y-4">

                            <div className="flex justify-between text-sm">

                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span className="font-bold text-gray-800">
                                    ₹
                                    {subtotal.toFixed(2)}
                                </span>

                            </div>


                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-700">
                                    <span>
                                        Coupon {order.couponCode
                                            ? `(${order.couponCode})`
                                            : "discount"}
                                    </span>

                                    <span className="font-black">
                                        -₹{discount.toFixed(2)}
                                    </span>
                                </div>
                            )}


                            <div className="flex justify-between text-sm">

                                <span className="text-gray-500">
                                    Delivery Fee
                                </span>

                                <span
                                    className={
                                        deliveryFee === 0
                                            ? "font-black text-green-600"
                                            : "font-bold text-gray-800"
                                    }
                                >
                                    {deliveryFee === 0
                                        ? "FREE"
                                        : `₹${deliveryFee.toFixed(
                                              2
                                          )}`}
                                </span>

                            </div>


                            {deliveryFee === 0 && (
                                <div className="rounded-xl border border-green-100/70 bg-green-50/50 px-4 py-3 text-xs font-bold text-green-700">
                                    🎉 You received free delivery on this order.
                                </div>
                            )}


                            <div className="border-t border-white/70 pt-5">

                                <div className="flex items-center justify-between">

                                    <span className="text-lg font-black text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-2xl font-black text-orange-600">
                                        ₹
                                        {total.toFixed(2)}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* PAYMENT */}

                    <div className="glass-strong rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100/70 text-xl">
                                💳
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-wider text-green-600">
                                    Transaction
                                </p>

                                <h2 className="text-xl font-black text-gray-900">
                                    Payment
                                </h2>

                            </div>

                        </div>


                        <div className="glass mt-6 rounded-2xl p-5">

                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Payment Status
                            </p>

                            <span
                                className={`mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-black ${getPaymentClasses(
                                    order.paymentStatus
                                )}`}
                            >
                                {getPaymentStatus(
                                    order.paymentStatus
                                )}
                            </span>

                        </div>


                        <div className="mt-4 rounded-2xl border border-green-100/70 bg-green-50/50 p-5">

                            <div className="flex gap-3">

                                <span className="text-xl">
                                    🔒
                                </span>

                                <div>

                                    <p className="font-black text-green-700">
                                        Secure Order
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-green-600">
                                        Your order information is protected.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    ORDER SUMMARY
                ========================================== */}

                <div className="glass mt-7 rounded-[1.5rem] p-6 shadow-lg">

                    <div className="grid gap-5 sm:grid-cols-3">

                        <div className="glass rounded-2xl p-4 text-center">

                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Items
                            </p>

                            <p className="mt-2 text-2xl font-black text-gray-900">
                                {order.items?.reduce(
                                    (sum, item) =>
                                        sum +
                                        Number(
                                            item.quantity || 0
                                        ),
                                    0
                                )}
                            </p>

                        </div>


                        <div className="glass rounded-2xl p-4 text-center">

                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Order Status
                            </p>

                            <p className="mt-2 text-sm font-black text-orange-600">
                                {getStatusLabel(
                                    order.status
                                )}
                            </p>

                        </div>


                        <div className="glass rounded-2xl p-4 text-center">

                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Amount Paid
                            </p>

                            <p className="mt-2 text-2xl font-black text-orange-600">
                                ₹{total.toFixed(2)}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    BOTTOM ACTION
                ========================================== */}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                    <Link
                        to={
                            canManage
                                ? "/owner/orders"
                                : "/orders"
                        }
                        className="glass-button inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-black text-gray-700"
                    >
                        {canManage
                            ? "← Back to Admin Orders"
                            : "← Back to My Orders"}
                    </Link>

                    <Link
                        to="/"
                        className="glass-orange inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-black"
                    >
                        Continue Shopping →
                    </Link>

                </div>

            </main>

        </div>
    );
}

export default OrderDetails;
