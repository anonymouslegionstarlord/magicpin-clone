import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

const formatStatus = (status = "") => {
    return status
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
};

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

const formatDate = (date) => {
    if (!date) {
        return "N/A";
    }

    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
};

const OwnerDashboard = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const [ordersResponse, storeResponse] =
                    await Promise.all([
                        API.get("/orders/store", {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }),

                        API.get("/stores/my", {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                    ]);

                setOrders(
                    ordersResponse.data.orders || []
                );

                const stores =
                    storeResponse.data.stores || [];

                if (stores.length > 0) {
                    setStore(stores[0]);
                }

            } catch (error) {
                console.log(
                    "Owner dashboard error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard"
                );

            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);


    // ==========================================
    // STATISTICS
    // ==========================================

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) =>
            order.status === "placed" ||
            order.status === "confirmed"
    ).length;

    const preparingOrders = orders.filter(
        (order) =>
            order.status === "preparing" ||
            order.status === "ready"
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.status === "delivered"
    ).length;

    const totalRevenue = orders
        .filter(
            (order) => order.status !== "cancelled"
        )
        .reduce(
            (sum, order) =>
                sum + Number(order.total || 0),
            0
        );

    const recentOrders = orders.slice(0, 5);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-12">

                <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

                <div className="mx-auto max-w-7xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100/70 text-4xl shadow-lg">
                            📊
                        </div>

                        <div className="mx-auto mt-7 h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Loading dashboard...
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

            {/* ==========================================
                BACKGROUND EFFECTS
            ========================================== */}

            <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-400/15 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 top-[25rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-200/10 blur-3xl" />


            <main className="mx-auto max-w-7xl px-4 py-7 md:py-10">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="glass-strong mb-7 rounded-[2rem] p-6 shadow-xl md:p-8">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl shadow-sm">
                                👨‍💼
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Owner Panel
                                </p>

                                <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                                    Owner Dashboard
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                    Manage your store, products and incoming customer orders from one place.
                                </p>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <Link
                                to="/owner/store?action=add"
                                className="glass-orange inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black"
                            >
                                + Add Restaurant
                            </Link>

                            <Link
                                to={
                                    store
                                        ? `/owner/products?store=${store._id}&action=add`
                                        : "/owner/store?action=add"
                                }
                                className="glass-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black text-gray-700"
                            >
                                + Add Food Item
                            </Link>

                            <Link
                                to="/owner/orders"
                                className="glass-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black text-gray-700"
                            >
                                📦 Manage Orders
                            </Link>

                            <Link
                                to="/owner/products"
                                className="glass-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black text-gray-700"
                            >
                                🍔 Products
                            </Link>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (

                    <div className="glass mb-7 rounded-2xl border border-red-200/70 bg-red-50/60 p-5">

                        <div className="flex items-start gap-3">

                            <span className="text-xl">
                                ⚠️
                            </span>

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
                    STORE INFORMATION
                ========================================== */}

                {store && (

                    <div className="glass-strong mb-7 overflow-hidden rounded-[2rem] shadow-xl">

                        <div className="border-b border-white/70 p-6 md:p-7">

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <div className="flex flex-wrap items-center gap-3">

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                            🏪
                                        </div>

                                        <h2 className="text-2xl font-black text-gray-900">
                                            {store.name}
                                        </h2>

                                        <span
                                            className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                                                store.isActive
                                                    ? "border-green-200/70 bg-green-50/70 text-green-700"
                                                    : "border-red-200/70 bg-red-50/70 text-red-700"
                                            }`}
                                        >
                                            {store.isActive
                                                ? "● Open"
                                                : "● Closed"}
                                        </span>

                                    </div>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Your business overview
                                    </p>

                                </div>


                                <Link
                                    to="/owner/store"
                                    className="glass-orange inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black"
                                >
                                    ⚙️ Manage Store
                                </Link>

                            </div>

                        </div>


                        {/* Store Cards */}

                        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">

                            {/* Category */}

                            <div className="glass glass-hover rounded-2xl p-5">

                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                    🏷️
                                </div>

                                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    Category
                                </p>

                                <p className="mt-2 font-black text-gray-900">
                                    {store.category ||
                                        "Not specified"}
                                </p>

                            </div>


                            {/* Address */}

                            <div className="glass glass-hover rounded-2xl p-5">

                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                    📍
                                </div>

                                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    Address
                                </p>

                                <p className="mt-2 font-black leading-6 text-gray-900">
                                    {store.address ||
                                        "Not specified"}
                                </p>

                            </div>


                            {/* Phone */}

                            <div className="glass glass-hover rounded-2xl p-5">

                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                    📞
                                </div>

                                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    Phone
                                </p>

                                <p className="mt-2 font-black text-gray-900">
                                    {store.phone ||
                                        "Not specified"}
                                </p>

                            </div>

                        </div>


                        {/* Closed Notice */}

                        {!store.isActive && (

                            <div className="mx-6 mb-6 rounded-2xl border border-red-200/70 bg-red-50/60 p-5">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100/70 text-xl">
                                        🔒
                                    </div>

                                    <div>

                                        <p className="font-black text-red-800">
                                            Your store is currently closed
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-red-700">
                                            Customers cannot see or order from your store while it is closed.
                                        </p>

                                        <Link
                                            to="/owner/store"
                                            className="mt-3 inline-block font-black text-red-800 hover:text-red-900"
                                        >
                                            Open Store →
                                        </Link>

                                    </div>

                                </div>

                            </div>
                        )}

                    </div>
                )}


                {/* ==========================================
                    STATISTICS
                ========================================== */}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


                    {/* Total Orders */}

                    <div className="glass glass-hover rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                📦
                            </div>

                            <span className="rounded-full border border-white/70 bg-white/40 px-3 py-1 text-xs font-black text-gray-500">
                                Total
                            </span>

                        </div>

                        <p className="mt-6 text-4xl font-black text-gray-900">
                            {totalOrders}
                        </p>

                        <p className="mt-2 text-sm font-bold text-gray-500">
                            Total orders
                        </p>

                    </div>


                    {/* Pending */}

                    <div className="glass glass-hover rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100/70 text-2xl">
                                ⏳
                            </div>

                            <span className="rounded-full border border-yellow-200/70 bg-yellow-50/60 px-3 py-1 text-xs font-black text-yellow-700">
                                Pending
                            </span>

                        </div>

                        <p className="mt-6 text-4xl font-black text-gray-900">
                            {pendingOrders}
                        </p>

                        <p className="mt-2 text-sm font-bold text-gray-500">
                            Need attention
                        </p>

                    </div>


                    {/* Preparing */}

                    <div className="glass glass-hover rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100/70 text-2xl">
                                👨‍🍳
                            </div>

                            <span className="rounded-full border border-purple-200/70 bg-purple-50/60 px-3 py-1 text-xs font-black text-purple-700">
                                Preparing
                            </span>

                        </div>

                        <p className="mt-6 text-4xl font-black text-gray-900">
                            {preparingOrders}
                        </p>

                        <p className="mt-2 text-sm font-bold text-gray-500">
                            In progress
                        </p>

                    </div>


                    {/* Delivered */}

                    <div className="glass glass-hover rounded-[1.5rem] p-6 shadow-lg">

                        <div className="flex items-center justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100/70 text-2xl">
                                ✅
                            </div>

                            <span className="rounded-full border border-green-200/70 bg-green-50/60 px-3 py-1 text-xs font-black text-green-700">
                                Delivered
                            </span>

                        </div>

                        <p className="mt-6 text-4xl font-black text-gray-900">
                            {deliveredOrders}
                        </p>

                        <p className="mt-2 text-sm font-bold text-gray-500">
                            Completed orders
                        </p>

                    </div>

                </div>


                {/* ==========================================
                    REVENUE
                ========================================== */}

                <div className="glass-strong mt-6 rounded-[2rem] p-6 shadow-xl md:p-7">

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100/70 text-2xl">
                                    💰
                                </div>

                                <div>

                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                        Total Revenue
                                    </p>

                                    <p className="mt-1 text-3xl font-black text-gray-900">
                                        ₹
                                        {totalRevenue.toFixed(2)}
                                    </p>

                                </div>

                            </div>

                            <p className="mt-4 text-sm text-gray-500">
                                Revenue excluding cancelled orders
                            </p>

                        </div>


                        <div className="flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/owner/orders"
                                className="glass-orange inline-flex items-center justify-center rounded-xl px-6 py-3 font-black"
                            >
                                📦 Manage Orders
                            </Link>

                            <Link
                                to="/owner/products"
                                className="glass-button inline-flex items-center justify-center rounded-xl px-6 py-3 font-black text-gray-700"
                            >
                                🍔 Manage Products
                            </Link>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    RECENT ORDERS
                ========================================== */}

                <div className="glass-strong mt-8 overflow-hidden rounded-[2rem] shadow-xl">


                    {/* Header */}

                    <div className="flex flex-col gap-4 border-b border-white/70 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                    🧾
                                </div>

                                <div>

                                    <h2 className="text-xl font-black text-gray-900">
                                        Recent Orders
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Your latest customer orders
                                    </p>

                                </div>

                            </div>

                        </div>


                        <Link
                            to="/owner/orders"
                            className="font-black text-orange-600 hover:text-orange-700"
                        >
                            View All →
                        </Link>

                    </div>


                    {/* No Orders */}

                    {recentOrders.length === 0 ? (

                        <div className="p-12 text-center">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100/70 text-4xl">
                                📦
                            </div>

                            <h3 className="mt-5 font-black text-gray-900">
                                No orders yet
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Customer orders will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="p-4 md:p-6">

                            <div className="space-y-3">

                                {recentOrders.map(
                                    (order) => (

                                        <div
                                            key={order._id}
                                            className="glass glass-hover rounded-2xl p-5"
                                        >

                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">


                                                {/* Order Info */}

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-3">

                                                        <p className="font-black text-gray-900">
                                                            #
                                                            {order._id.slice(
                                                                -8
                                                            ).toUpperCase()}
                                                        </p>

                                                        <span
                                                            className={`rounded-full border px-3 py-1.5 text-xs font-black ${getStatusStyle(
                                                                order.status
                                                            )}`}
                                                        >
                                                            {formatStatus(
                                                                order.status
                                                            )}
                                                        </span>

                                                    </div>

                                                    <p className="mt-2 text-sm font-bold text-gray-600">
                                                        👤{" "}
                                                        {order.user?.name ||
                                                            "Customer"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </p>

                                                </div>


                                                {/* Amount + Action */}

                                                <div className="flex items-center justify-between gap-5 lg:justify-end">

                                                    <div>

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Order Total
                                                        </p>

                                                        <p className="mt-1 text-xl font-black text-gray-900">
                                                            ₹
                                                            {Number(
                                                                order.total ||
                                                                0
                                                            ).toFixed(2)}
                                                        </p>

                                                    </div>


                                                    <Link
                                                        to={`/orders/${order._id}`}
                                                        className="glass-orange inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-black"
                                                    >
                                                        View
                                                    </Link>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>
                    )}

                </div>


                {/* ==========================================
                    QUICK ACTIONS
                ========================================== */}

                <div className="mt-8 grid gap-5 md:grid-cols-3">

                    <Link
                        to="/owner/orders"
                        className="glass glass-hover group rounded-[1.5rem] p-6 shadow-lg"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl transition group-hover:scale-105">
                            📦
                        </div>

                        <h3 className="mt-5 font-black text-gray-900">
                            Orders
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            View and update incoming customer orders.
                        </p>

                    </Link>


                    <Link
                        to="/owner/products"
                        className="glass glass-hover group rounded-[1.5rem] p-6 shadow-lg"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100/70 text-2xl transition group-hover:scale-105">
                            🍔
                        </div>

                        <h3 className="mt-5 font-black text-gray-900">
                            Products
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Add, edit and manage products in your store.
                        </p>

                    </Link>


                    <Link
                        to="/owner/store"
                        className="glass glass-hover group rounded-[1.5rem] p-6 shadow-lg"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100/70 text-2xl transition group-hover:scale-105">
                            🏪
                        </div>

                        <h3 className="mt-5 font-black text-gray-900">
                            Store Settings
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Update your store information and availability.
                        </p>

                    </Link>

                </div>

            </main>

        </div>
    );
};

export default OwnerDashboard;
