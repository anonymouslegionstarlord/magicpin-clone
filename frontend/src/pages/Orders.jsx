import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH ORDERS
    // ==========================================

    const fetchOrders = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login to view your orders.");
                return;
            }

            const response = await API.get("/orders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrders(response.data.orders || []);

        } catch (error) {
            console.log("Fetch orders error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load orders"
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 0);

        return () => {
            clearTimeout(timer);
        };
    }, [fetchOrders]);


    // ==========================================
    // AUTO REFRESH ACTIVE ORDERS
    // ==========================================

    useEffect(() => {
        if (orders.length === 0) {
            return;
        }

        const hasActiveOrders = orders.some(
            (order) =>
                order.status !== "delivered" &&
                order.status !== "cancelled"
        );

        if (!hasActiveOrders) {
            return;
        }

        const interval = setInterval(() => {
            fetchOrders(true);
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [orders, fetchOrders]);


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
                return status;
        }
    };


    // ==========================================
    // STATUS CLASSES
    // ==========================================

    const getStatusClasses = (status) => {
        switch (status) {
            case "placed":
                return "bg-blue-50/80 text-blue-700 border-blue-100";

            case "confirmed":
                return "bg-indigo-50/80 text-indigo-700 border-indigo-100";

            case "preparing":
                return "bg-yellow-50/80 text-yellow-700 border-yellow-100";

            case "ready":
                return "bg-purple-50/80 text-purple-700 border-purple-100";

            case "out_for_delivery":
                return "bg-orange-50/80 text-orange-700 border-orange-100";

            case "delivered":
                return "bg-green-50/80 text-green-700 border-green-100";

            case "cancelled":
                return "bg-red-50/80 text-red-700 border-red-100";

            default:
                return "bg-gray-50/80 text-gray-700 border-gray-100";
        }
    };


    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    const getPaymentStatusClasses = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-50/80 text-green-700 border-green-100";

            case "failed":
                return "bg-red-50/80 text-red-700 border-red-100";

            case "pending":
            default:
                return "bg-yellow-50/80 text-yellow-700 border-yellow-100";
        }
    };


    const formatPaymentStatus = (status) => {
        if (!status) {
            return "Pending";
        }

        return (
            status.charAt(0).toUpperCase() +
            status.slice(1)
        );
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
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-5xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl">
                            📦
                        </div>

                        <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-medium text-gray-500">
                            Loading your orders...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // MAIN
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* Background */}

            <div className="pointer-events-none fixed -left-40 top-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-400/10 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-300/10 blur-3xl" />


            <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="glass rounded-[1.5rem] p-5 md:p-7">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 text-2xl">
                                📦
                            </div>

                            <div>

                                <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                    My Orders
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    Track and manage your orders
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() => fetchOrders(true)}
                            disabled={refreshing}
                            className="glass-orange rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "↻ Refresh Orders"}
                        </button>

                    </div>

                </div>


                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (

                    <div className="glass mt-5 rounded-2xl border border-red-200/70 bg-red-50/60 px-5 py-4 text-red-700">

                        <div className="flex items-center gap-3">

                            <span className="text-xl">
                                ⚠️
                            </span>

                            <p className="font-medium">
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* ==========================================
                    EMPTY
                ========================================== */}

                {!error && orders.length === 0 && (

                    <div className="glass-strong mt-7 rounded-[2rem] p-10 text-center md:p-14">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-100/70 text-5xl shadow-inner">
                            🛍️
                        </div>

                        <h2 className="mt-7 text-2xl font-black text-gray-900">
                            No Orders Yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-gray-500">
                            You haven't placed any orders yet.
                            Explore stores and find something delicious.
                        </p>

                        <Link
                            to="/"
                            className="glass-orange mt-7 inline-flex rounded-xl px-7 py-3.5 font-bold"
                        >
                            Start Shopping →
                        </Link>

                    </div>

                )}


                {/* ==========================================
                    ORDERS
                ========================================== */}

                <div className="mt-7 space-y-6">

                    {orders.map((order) => (

                        <div
                            key={order._id}
                            className="glass glass-hover overflow-hidden rounded-[1.5rem]"
                        >

                            {/* ==================================
                                ORDER HEADER
                            ================================== */}

                            <div className="border-b border-white/70 bg-white/30 p-5 backdrop-blur-xl md:p-6">

                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                    <div className="min-w-0">

                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Order ID
                                        </p>

                                        <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-800">
                                            {order._id}
                                        </p>

                                    </div>


                                    {/* Status */}

                                    <div className="flex flex-wrap items-center gap-2">

                                        <span
                                            className={`rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur ${getStatusClasses(
                                                order.status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                order.status
                                            )}
                                        </span>

                                        <span
                                            className={`rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur ${getPaymentStatusClasses(
                                                order.paymentStatus
                                            )}`}
                                        >
                                            Payment:{" "}
                                            {formatPaymentStatus(
                                                order.paymentStatus
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================
                                ORDER CONTENT
                            ================================== */}

                            <div className="p-5 md:p-6">

                                {/* STORE */}

                                <div className="rounded-2xl border border-white/70 bg-white/35 p-4 backdrop-blur">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                            🏪
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                                Store
                                            </p>

                                            <p className="mt-1 text-lg font-black text-gray-800">
                                                {order.store?.name ||
                                                    "Store"}
                                            </p>

                                            {order.store?.address && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {order.store.address}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                </div>


                                {/* ITEMS */}

                                <div className="mt-6">

                                    <div className="mb-4 flex items-center justify-between">

                                        <h3 className="text-lg font-black text-gray-900">
                                            Items
                                        </h3>

                                        <span className="rounded-full border border-white/70 bg-white/50 px-3 py-1 text-xs font-bold text-gray-500">
                                            {order.items?.length || 0}{" "}
                                            {order.items?.length === 1
                                                ? "item"
                                                : "items"}
                                        </span>

                                    </div>


                                    <div className="space-y-3">

                                        {order.items?.map(
                                            (item, index) => (

                                                <div
                                                    key={
                                                        item.product?._id ||
                                                        index
                                                    }
                                                    className="glass rounded-2xl p-4"
                                                >

                                                    <div className="flex items-center justify-between gap-4">

                                                        <div className="min-w-0">

                                                            <p className="truncate font-bold text-gray-800">
                                                                {item.name}
                                                            </p>

                                                            <p className="mt-1 text-sm text-gray-500">
                                                                ₹
                                                                {Number(
                                                                    item.price ||
                                                                    0
                                                                ).toFixed(2)}
                                                                {" × "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>

                                                        </div>

                                                        <p className="whitespace-nowrap font-black text-gray-900">
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


                                {/* ==================================
                                    BILL
                                ================================== */}

                                <div className="mt-6 rounded-2xl border border-white/70 bg-white/35 p-5 backdrop-blur">

                                    <h3 className="mb-4 font-black text-gray-900">
                                        Bill Summary
                                    </h3>

                                    <div className="space-y-3">

                                        <div className="flex justify-between text-sm">

                                            <span className="text-gray-500">
                                                Subtotal
                                            </span>

                                            <span className="font-semibold text-gray-700">
                                                ₹
                                                {Number(
                                                    order.subtotal || 0
                                                ).toFixed(2)}
                                            </span>

                                        </div>


                                        <div className="flex justify-between text-sm">

                                            <span className="text-gray-500">
                                                Delivery Fee
                                            </span>

                                            <span className="font-semibold text-gray-700">
                                                ₹
                                                {Number(
                                                    order.deliveryFee || 0
                                                ).toFixed(2)}
                                            </span>

                                        </div>


                                        <div className="mt-3 border-t border-white/70 pt-4">

                                            <div className="flex items-center justify-between">

                                                <span className="text-lg font-black text-gray-900">
                                                    Total
                                                </span>

                                                <span className="text-2xl font-black text-orange-600">
                                                    ₹
                                                    {Number(
                                                        order.total || 0
                                                    ).toFixed(2)}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* ==================================
                                    DATE + ACTION
                                ================================== */}

                                <div className="mt-6 flex flex-col gap-4 border-t border-white/70 pt-5 md:flex-row md:items-center md:justify-between">

                                    <div>

                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Ordered on
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-700">
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </p>

                                    </div>


                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="glass-orange inline-flex items-center justify-center rounded-xl px-6 py-3 font-bold"
                                    >
                                        View Details →
                                    </Link>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}

export default Orders;