import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function OwnerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [filter, setFilter] = useState("all");

    // ==========================================
    // STATUS FLOW
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
                return "Placed";

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

            case "cancelled":
                return "❌";

            default:
                return "•";
        }
    };


    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "placed":
                return "border-blue-200/70 bg-blue-50/70 text-blue-700";

            case "confirmed":
                return "border-indigo-200/70 bg-indigo-50/70 text-indigo-700";

            case "preparing":
                return "border-yellow-200/70 bg-yellow-50/70 text-yellow-700";

            case "ready":
                return "border-purple-200/70 bg-purple-50/70 text-purple-700";

            case "out_for_delivery":
                return "border-orange-200/70 bg-orange-50/70 text-orange-700";

            case "delivered":
                return "border-green-200/70 bg-green-50/70 text-green-700";

            case "cancelled":
                return "border-red-200/70 bg-red-50/70 text-red-700";

            default:
                return "border-gray-200/70 bg-gray-50/70 text-gray-700";
        }
    };


    // ==========================================
    // NEXT STATUS
    // ==========================================

    const getNextStatus = (currentStatus) => {
        const currentIndex =
            statusFlow.indexOf(currentStatus);

        if (currentIndex === -1) {
            return null;
        }

        if (
            currentIndex >=
            statusFlow.length - 1
        ) {
            return null;
        }

        return statusFlow[currentIndex + 1];
    };


    // ==========================================
    // DATE FORMAT
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    // ==========================================
    // LOAD ORDERS
    // ==========================================

    const loadOrders = async (
        showRefreshLoader = false
    ) => {
        try {
            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "You are not logged in."
                );
                return;
            }

            const response = await API.get(
                "/orders/store",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setOrders(
                response.data.orders || []
            );

        } catch (error) {
            console.log(
                "Owner orders error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load orders"
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        let cancelled = false;

        const fetchInitialOrders = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                if (!token) {
                    if (!cancelled) {
                        setError(
                            "You are not logged in."
                        );
                        setLoading(false);
                    }

                    return;
                }

                const response =
                    await API.get(
                        "/orders/store",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                if (!cancelled) {
                    setOrders(
                        response.data.orders || []
                    );

                    setError("");
                    setLoading(false);
                }

            } catch (error) {
                console.log(
                    "Initial orders fetch error:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.response?.data?.message ||
                        "Unable to load orders"
                    );

                    setLoading(false);
                }
            }
        };

        fetchInitialOrders();

        return () => {
            cancelled = true;
        };
    }, []);


    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    const updateStatus = async (
        orderId,
        status
    ) => {
        try {
            setUpdatingOrder(orderId);
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "You are not logged in."
                );
                return;
            }

            const response =
                await API.put(
                    `/orders/${orderId}/status`,
                    {
                        status
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const updatedOrder =
                response.data.order;

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order._id === updatedOrder._id
                        ? updatedOrder
                        : order
                )
            );

        } catch (error) {
            console.log(
                "Update order status error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update order status"
            );

        } finally {
            setUpdatingOrder(null);
        }
    };


    // ==========================================
    // NEXT STATUS
    // ==========================================

    const handleNextStatus = (order) => {
        const nextStatus =
            getNextStatus(order.status);

        if (!nextStatus) {
            return;
        }

        updateStatus(
            order._id,
            nextStatus
        );
    };


    // ==========================================
    // CANCEL
    // ==========================================

    const handleCancelOrder = (order) => {
        if (
            order.status === "delivered" ||
            order.status === "cancelled"
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );

        if (!confirmed) {
            return;
        }

        updateStatus(
            order._id,
            "cancelled"
        );
    };


    // ==========================================
    // FILTER
    // ==========================================

    const filteredOrders =
        filter === "all"
            ? orders
            : orders.filter(
                  (order) =>
                      order.status === filter
              );


    // ==========================================
    // STATISTICS
    // ==========================================

    const pendingCount = orders.filter(
        (order) =>
            order.status === "placed" ||
            order.status === "confirmed"
    ).length;

    const preparingCount = orders.filter(
        (order) =>
            order.status === "preparing" ||
            order.status === "ready"
    ).length;

    const deliveryCount = orders.filter(
        (order) =>
            order.status ===
            "out_for_delivery"
    ).length;

    const completedCount = orders.filter(
        (order) =>
            order.status === "delivered"
    ).length;


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

                <div className="mx-auto max-w-7xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100/70 text-4xl shadow-lg">
                            📦
                        </div>

                        <div className="mx-auto mt-7 h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Loading store orders...
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

            {/* BACKGROUND */}

            <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-400/15 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 top-[30rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-200/10 blur-3xl" />


            <main className="mx-auto max-w-7xl px-4 py-7 md:py-10">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="glass-strong rounded-[2rem] p-6 shadow-xl md:p-8">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl shadow-sm">
                                📦
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Owner Panel
                                </p>

                                <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                                    Store Orders
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                    Manage customer orders and keep their status updated.
                                </p>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <button
                                onClick={() =>
                                    loadOrders(true)
                                }
                                disabled={refreshing}
                                className="glass-button rounded-xl px-5 py-3 text-sm font-black text-gray-700 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {refreshing
                                    ? "↻ Refreshing..."
                                    : "↻ Refresh"}
                            </button>

                            <Link
                                to="/owner"
                                className="glass-orange inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black"
                            >
                                ← Dashboard
                            </Link>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (

                    <div className="glass mt-6 rounded-2xl border border-red-200/70 bg-red-50/60 p-5">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100/70">
                                ⚠️
                            </div>

                            <div>

                                <p className="font-black text-red-800">
                                    Something went wrong
                                </p>

                                <p className="mt-1 text-sm text-red-700">
                                    {error}
                                </p>

                            </div>

                        </div>

                    </div>
                )}


                {/* ==========================================
                    STATISTICS
                ========================================== */}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">


                    {/* ALL */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilter("all")
                        }
                        className={`glass glass-hover rounded-2xl p-5 text-left shadow-lg transition ${
                            filter === "all"
                                ? "ring-2 ring-orange-300/70"
                                : ""
                        }`}
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                📦
                            </div>

                            <span className="text-2xl">
                                {orders.length}
                            </span>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            All Orders
                        </p>

                    </button>


                    {/* PENDING */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilter("placed")
                        }
                        className={`glass glass-hover rounded-2xl p-5 text-left shadow-lg transition ${
                            filter === "placed"
                                ? "ring-2 ring-blue-300/70"
                                : ""
                        }`}
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100/70 text-xl">
                                ⏳
                            </div>

                            <span className="text-2xl font-black text-gray-900">
                                {pendingCount}
                            </span>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            New / Pending
                        </p>

                    </button>


                    {/* PREPARING */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilter("preparing")
                        }
                        className={`glass glass-hover rounded-2xl p-5 text-left shadow-lg transition ${
                            filter === "preparing"
                                ? "ring-2 ring-yellow-300/70"
                                : ""
                        }`}
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100/70 text-xl">
                                👨‍🍳
                            </div>

                            <span className="text-2xl font-black text-gray-900">
                                {preparingCount}
                            </span>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            Preparing
                        </p>

                    </button>


                    {/* DELIVERY */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilter(
                                "out_for_delivery"
                            )
                        }
                        className={`glass glass-hover rounded-2xl p-5 text-left shadow-lg transition ${
                            filter ===
                            "out_for_delivery"
                                ? "ring-2 ring-orange-300/70"
                                : ""
                        }`}
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                🛵
                            </div>

                            <span className="text-2xl font-black text-gray-900">
                                {deliveryCount}
                            </span>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            Out for Delivery
                        </p>

                    </button>


                    {/* COMPLETED */}

                    <button
                        type="button"
                        onClick={() =>
                            setFilter("delivered")
                        }
                        className={`glass glass-hover rounded-2xl p-5 text-left shadow-lg transition ${
                            filter === "delivered"
                                ? "ring-2 ring-green-300/70"
                                : ""
                        }`}
                    >

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100/70 text-xl">
                                ✅
                            </div>

                            <span className="text-2xl font-black text-gray-900">
                                {completedCount}
                            </span>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            Delivered
                        </p>

                    </button>

                </div>


                {/* ==========================================
                    FILTER BAR
                ========================================== */}

                <div className="glass-strong mt-6 rounded-2xl p-4 shadow-lg">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                Showing
                            </p>

                            <p className="mt-1 font-black text-gray-900">
                                {filteredOrders.length}{" "}
                                {filteredOrders.length === 1
                                    ? "order"
                                    : "orders"}
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            {[
                                ["all", "All"],
                                ["placed", "Placed"],
                                ["confirmed", "Confirmed"],
                                ["preparing", "Preparing"],
                                ["ready", "Ready"],
                                [
                                    "out_for_delivery",
                                    "Out for Delivery"
                                ],
                                ["delivered", "Delivered"],
                                ["cancelled", "Cancelled"]
                            ].map(
                                ([value, label]) => (

                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            setFilter(
                                                value
                                            )
                                        }
                                        className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                                            filter ===
                                            value
                                                ? "border-orange-300 bg-orange-50/80 text-orange-700 shadow-sm"
                                                : "border-white/70 bg-white/40 text-gray-500 hover:bg-white/70"
                                        }`}
                                    >
                                        {label}
                                    </button>

                                )
                            )}

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    NO ORDERS
                ========================================== */}

                {filteredOrders.length === 0 ? (

                    <div className="glass-strong mt-6 rounded-[2rem] p-12 text-center shadow-xl">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-100/70 text-5xl">
                            📦
                        </div>

                        <h2 className="mt-6 text-2xl font-black text-gray-900">
                            No orders found
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            {orders.length === 0
                                ? "Orders placed at your store will appear here."
                                : "There are no orders matching the selected filter."}
                        </p>

                        {filter !== "all" && (

                            <button
                                type="button"
                                onClick={() =>
                                    setFilter("all")
                                }
                                className="glass-orange mt-6 rounded-xl px-6 py-3 font-black"
                            >
                                Show All Orders
                            </button>

                        )}

                    </div>

                ) : (

                    <div className="mt-6 space-y-6">

                        {filteredOrders.map(
                            (order) => {

                                const nextStatus =
                                    getNextStatus(
                                        order.status
                                    );

                                const currentIndex =
                                    statusFlow.indexOf(
                                        order.status
                                    );

                                const isUpdating =
                                    updatingOrder ===
                                    order._id;

                                return (

                                    <div
                                        key={order._id}
                                        className="glass-strong overflow-hidden rounded-[2rem] shadow-xl"
                                    >


                                        {/* ==========================================
                                            ORDER HEADER
                                        ========================================== */}

                                        <div className="border-b border-white/70 p-5 md:p-7">

                                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-3">

                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                                            📦
                                                        </div>

                                                        <div>

                                                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                                Order ID
                                                            </p>

                                                            <p className="mt-1 break-all font-black text-gray-900">
                                                                #
                                                                {order._id
                                                                    .slice(
                                                                        -8
                                                                    )
                                                                    .toUpperCase()}
                                                            </p>

                                                        </div>

                                                        <span
                                                            className={`rounded-full border px-3 py-1.5 text-xs font-black ${getStatusStyle(
                                                                order.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(
                                                                order.status
                                                            )}{" "}
                                                            {getStatusLabel(
                                                                order.status
                                                            )}
                                                        </span>

                                                    </div>

                                                    <p className="mt-3 text-sm text-gray-500">
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </p>

                                                </div>


                                                <div className="flex items-center gap-3">

                                                    <div className="text-left lg:text-right">

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Order Total
                                                        </p>

                                                        <p className="mt-1 text-2xl font-black text-orange-600">
                                                            ₹
                                                            {Number(
                                                                order.total ||
                                                                0
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </p>

                                                    </div>

                                                    <Link
                                                        to={`/orders/${order._id}`}
                                                        className="glass-button rounded-xl px-4 py-3 text-sm font-black text-gray-700"
                                                    >
                                                        View
                                                    </Link>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ==========================================
                                            PROGRESS
                                        ========================================== */}

                                        <div className="p-5 md:p-7">

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                                                        Order Progress
                                                    </p>

                                                    <h3 className="mt-1 text-lg font-black text-gray-900">
                                                        Track Status
                                                    </h3>

                                                </div>

                                            </div>


                                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">

                                                {statusFlow.map(
                                                    (
                                                        status,
                                                        index
                                                    ) => {

                                                        const completed =
                                                            currentIndex >=
                                                            index;

                                                        const current =
                                                            order.status ===
                                                            status;

                                                        return (

                                                            <div
                                                                key={
                                                                    status
                                                                }
                                                                className={`relative rounded-xl border p-3 transition ${
                                                                    current
                                                                        ? "border-orange-200 bg-orange-50/80 shadow-sm"
                                                                        : completed
                                                                            ? "border-green-200/70 bg-green-50/60"
                                                                            : "border-white/70 bg-white/30"
                                                                }`}
                                                            >

                                                                <div className="flex items-center gap-2">

                                                                    <div
                                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                                                            completed
                                                                                ? "bg-green-500 text-white"
                                                                                : "bg-gray-100/80 text-gray-400"
                                                                        }`}
                                                                    >
                                                                        {completed
                                                                            ? "✓"
                                                                            : index +
                                                                              1}
                                                                    </div>

                                                                    <p
                                                                        className={`text-xs font-black leading-4 ${
                                                                            current
                                                                                ? "text-orange-700"
                                                                                : completed
                                                                                    ? "text-green-700"
                                                                                    : "text-gray-400"
                                                                        }`}
                                                                    >
                                                                        {getStatusLabel(
                                                                            status
                                                                        )}
                                                                    </p>

                                                                </div>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>

                                        </div>


                                        {/* ==========================================
                                            CUSTOMER + PAYMENT
                                        ========================================== */}

                                        <div className="grid gap-5 px-5 pb-5 md:grid-cols-2 md:px-7 md:pb-7">


                                            {/* CUSTOMER */}

                                            <div className="glass rounded-2xl p-5">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100/70 text-xl">
                                                        👤
                                                    </div>

                                                    <div>

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Customer
                                                        </p>

                                                        <p className="font-black text-gray-900">
                                                            Customer Details
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="mt-5 space-y-3 text-sm">

                                                    <div className="rounded-xl bg-white/40 p-3">

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Name
                                                        </p>

                                                        <p className="mt-1 font-bold text-gray-800">
                                                            {order.user?.name ||
                                                                "N/A"}
                                                        </p>

                                                    </div>


                                                    <div className="rounded-xl bg-white/40 p-3">

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Email
                                                        </p>

                                                        <p className="mt-1 break-all font-bold text-gray-800">
                                                            {order.user?.email ||
                                                                "N/A"}
                                                        </p>

                                                    </div>


                                                    <div className="grid gap-3 sm:grid-cols-2">

                                                        <div className="rounded-xl bg-white/40 p-3">

                                                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                                Phone
                                                            </p>

                                                            <p className="mt-1 font-bold text-gray-800">
                                                                {order.phone ||
                                                                    "N/A"}
                                                            </p>

                                                        </div>


                                                        <div className="rounded-xl bg-white/40 p-3">

                                                            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                                Payment
                                                            </p>

                                                            <p className="mt-1 font-bold text-gray-800">
                                                                {order.paymentStatus
                                                                    ? order.paymentStatus
                                                                          .charAt(
                                                                              0
                                                                          )
                                                                          .toUpperCase() +
                                                                      order.paymentStatus.slice(
                                                                          1
                                                                      )
                                                                    : "Pending"}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <div className="rounded-xl bg-white/40 p-3">

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Delivery Address
                                                        </p>

                                                        <p className="mt-1 font-bold leading-6 text-gray-800">
                                                            {order.address ||
                                                                "N/A"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* ITEMS */}

                                            <div className="glass rounded-2xl p-5">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                                        🍔
                                                    </div>

                                                    <div>

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Order Contents
                                                        </p>

                                                        <p className="font-black text-gray-900">
                                                            Ordered Products
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">

                                                    {order.items?.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (

                                                            <div
                                                                key={
                                                                    item
                                                                        .product
                                                                        ?._id ||
                                                                    index
                                                                }
                                                                className="rounded-xl border border-white/70 bg-white/40 p-3"
                                                            >

                                                                <div className="flex items-center justify-between gap-4">

                                                                    <div className="min-w-0">

                                                                        <p className="truncate font-black text-gray-800">
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-gray-500">
                                                                            ₹
                                                                            {Number(
                                                                                item.price ||
                                                                                0
                                                                            ).toFixed(
                                                                                2
                                                                            )}{" "}
                                                                            ×{" "}
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
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>


                                        {/* ==========================================
                                            BILL
                                        ========================================== */}

                                        <div className="border-t border-white/70 px-5 py-5 md:px-7">

                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                <div>

                                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                        Bill Summary
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-4 text-sm">

                                                        <span className="text-gray-500">
                                                            Subtotal:{" "}
                                                            <strong className="text-gray-800">
                                                                ₹
                                                                {Number(
                                                                    order.subtotal ||
                                                                    0
                                                                ).toFixed(
                                                                    2
                                                                )}
                                                            </strong>
                                                        </span>

                                                        <span className="text-gray-500">
                                                            Delivery:{" "}
                                                            <strong className="text-gray-800">
                                                                ₹
                                                                {Number(
                                                                    order.deliveryFee ||
                                                                    0
                                                                ).toFixed(
                                                                    2
                                                                )}
                                                            </strong>
                                                        </span>

                                                    </div>

                                                </div>


                                                <div className="sm:text-right">

                                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                        Total
                                                    </p>

                                                    <p className="mt-1 text-3xl font-black text-orange-600">
                                                        ₹
                                                        {Number(
                                                            order.total ||
                                                            0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ==========================================
                                            ACTIONS
                                        ========================================== */}

                                        <div className="border-t border-white/70 bg-white/20 px-5 py-5 md:px-7">

                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                                <div>

                                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                        Order Management
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Update the order as you process it.
                                                    </p>

                                                </div>


                                                {order.status ===
                                                "cancelled" ? (

                                                    <div className="rounded-xl border border-red-200/70 bg-red-50/60 px-5 py-3 text-sm font-black text-red-700">
                                                        ❌ This order has been cancelled.
                                                    </div>

                                                ) : order.status ===
                                                  "delivered" ? (

                                                    <div className="rounded-xl border border-green-200/70 bg-green-50/60 px-5 py-3 text-sm font-black text-green-700">
                                                        🎉 Order delivered successfully.
                                                    </div>

                                                ) : (

                                                    <div className="flex flex-wrap gap-3">

                                                        {nextStatus && (

                                                            <button
                                                                onClick={() =>
                                                                    handleNextStatus(
                                                                        order
                                                                    )
                                                                }
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                                className="glass-orange rounded-xl px-5 py-3 text-sm font-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {isUpdating
                                                                    ? "Updating..."
                                                                    : `${getStatusIcon(
                                                                          nextStatus
                                                                      )} Move to ${getStatusLabel(
                                                                          nextStatus
                                                                      )}`}
                                                            </button>

                                                        )}


                                                        <button
                                                            onClick={() =>
                                                                handleCancelOrder(
                                                                    order
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            className="rounded-xl border border-red-200/70 bg-red-50/70 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100/80 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            ❌ Cancel Order
                                                        </button>

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}


                {/* ==========================================
                    FOOTER ACTIONS
                ========================================== */}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                    <Link
                        to="/owner"
                        className="glass-button inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-black text-gray-700"
                    >
                        ← Dashboard
                    </Link>

                    <Link
                        to="/owner/products"
                        className="glass-orange inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-black"
                    >
                        Manage Products →
                    </Link>

                </div>

            </main>

        </div>
    );
}

export default OwnerOrders;