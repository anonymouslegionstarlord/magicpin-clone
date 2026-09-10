import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function OwnerStore() {
    const navigate = useNavigate();

    const [store, setStore] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [editing, setEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        address: "",
        phone: "",
        longitude: "",
        latitude: ""
    });


    // =====================================================
    // FETCH STORE
    // =====================================================

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response =
                    await API.get("/stores/my", {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    });

                const stores =
                    response.data.stores || [];

                if (stores.length === 0) {
                    setError(
                        "You don't have a store yet."
                    );
                    return;
                }

                const currentStore =
                    stores[0];

                setStore(currentStore);

                setFormData({
                    name:
                        currentStore.name || "",
                    description:
                        currentStore.description ||
                        "",
                    category:
                        currentStore.category || "",
                    address:
                        currentStore.address || "",
                    phone:
                        currentStore.phone || "",
                    longitude:
                        currentStore.location
                            ?.coordinates?.[0] ??
                        "",
                    latitude:
                        currentStore.location
                            ?.coordinates?.[1] ??
                        ""
                });

            } catch (error) {
                console.log(
                    "Owner store error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load store"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [navigate]);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // =====================================================
    // EDIT
    // =====================================================

    const handleEdit = () => {
        setError("");
        setSuccess("");
        setEditing(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {
        if (!store) {
            return;
        }

        setFormData({
            name:
                store.name || "",
            description:
                store.description || "",
            category:
                store.category || "",
            address:
                store.address || "",
            phone:
                store.phone || "",
            longitude:
                store.location
                    ?.coordinates?.[0] ??
                "",
            latitude:
                store.location
                    ?.coordinates?.[1] ??
                ""
        });

        setError("");
        setSuccess("");
        setEditing(false);
    };


    // =====================================================
    // SAVE STORE
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const token =
                localStorage.getItem("token");

            const response =
                await API.put(
                    `/stores/${store._id}`,
                    {
                        name:
                            formData.name.trim(),
                        description:
                            formData.description.trim(),
                        category:
                            formData.category.trim(),
                        address:
                            formData.address.trim(),
                        phone:
                            formData.phone.trim(),
                        longitude:
                            Number(
                                formData.longitude
                            ),
                        latitude:
                            Number(
                                formData.latitude
                            )
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const updatedStore =
                response.data.store;

            setStore(updatedStore);

            setFormData({
                name:
                    updatedStore.name || "",
                description:
                    updatedStore.description ||
                    "",
                category:
                    updatedStore.category || "",
                address:
                    updatedStore.address || "",
                phone:
                    updatedStore.phone || "",
                longitude:
                    updatedStore.location
                        ?.coordinates?.[0] ??
                    "",
                latitude:
                    updatedStore.location
                        ?.coordinates?.[1] ??
                    ""
            });

            setEditing(false);

            setSuccess(
                response.data.message ||
                "Store updated successfully"
            );

        } catch (error) {
            console.log(
                "Update store error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update store"
            );

        } finally {
            setSaving(false);
        }
    };


    // =====================================================
    // TOGGLE STORE
    // =====================================================

    const handleToggleStore = async () => {
        if (!store) {
            return;
        }

        const newStatus =
            !store.isActive;

        const confirmationMessage =
            newStatus
                ? "Open this store for customers?"
                : "Close this store? Customers will no longer see it.";

        const confirmed =
            window.confirm(
                confirmationMessage
            );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");
        setToggling(true);

        try {
            const token =
                localStorage.getItem("token");

            const response =
                await API.put(
                    `/stores/${store._id}`,
                    {
                        isActive: newStatus
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setStore(
                response.data.store
            );

            setSuccess(
                newStatus
                    ? "Store is now open."
                    : "Store is now closed."
            );

        } catch (error) {
            console.log(
                "Toggle store error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update store status"
            );

        } finally {
            setToggling(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

                <div className="mx-auto max-w-6xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center shadow-xl">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100/70 text-4xl">
                            🏪
                        </div>

                        <div className="mx-auto mt-7 h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Loading your store...
                        </p>

                    </div>

                </div>
            </div>
        );
    }


    // =====================================================
    // NO STORE / ERROR
    // =====================================================

    if (error && !store) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center shadow-xl">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-100/70 text-5xl">
                            🏪
                        </div>

                        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                            Owner Panel
                        </p>

                        <h1 className="mt-2 text-3xl font-black text-gray-900">
                            Store Not Found
                        </h1>

                        <p className="mt-3 text-sm text-gray-500">
                            {error}
                        </p>

                        <Link
                            to="/owner"
                            className="glass-orange mt-7 inline-flex rounded-xl px-7 py-3 font-black"
                        >
                            ← Owner Dashboard
                        </Link>

                    </div>

                </div>
            </div>
        );
    }


    if (!store) {
        return null;
    }


    const longitude =
        store.location?.coordinates?.[0];

    const latitude =
        store.location?.coordinates?.[1];


    // =====================================================
    // MAIN
    // =====================================================

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* BACKGROUND BLOBS */}

            <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-400/15 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 top-[25rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-200/10 blur-3xl" />


            <main className="mx-auto max-w-6xl px-4 py-7 md:py-10">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="glass-strong rounded-[2rem] p-6 shadow-xl md:p-8">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl">
                                🏪
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Owner Panel
                                </p>

                                <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                                    Store Management
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    View and manage your
                                    store information.
                                </p>

                            </div>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <Link
                                to="/owner"
                                className="glass-button inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-black text-gray-700"
                            >
                                ← Dashboard
                            </Link>

                            {!editing && (
                                <button
                                    type="button"
                                    onClick={
                                        handleEdit
                                    }
                                    className="glass-orange rounded-xl px-5 py-3 text-sm font-black"
                                >
                                    ✏️ Edit Store
                                </button>
                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {success && (

                    <div className="glass mt-6 rounded-2xl border border-green-200/70 bg-green-50/60 p-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100/80 font-black text-green-700">
                                ✓
                            </div>

                            <div>

                                <p className="font-black text-green-800">
                                    Success
                                </p>

                                <p className="text-sm text-green-700">
                                    {success}
                                </p>

                            </div>

                        </div>

                    </div>
                )}


                {error && store && (

                    <div className="glass mt-6 rounded-2xl border border-red-200/70 bg-red-50/60 p-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100/80">
                                ⚠️
                            </div>

                            <p className="text-sm font-semibold text-red-700">
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* =================================================
                    EDIT FORM
                ================================================= */}

                {editing ? (

                    <form
                        onSubmit={handleSubmit}
                        className="glass-strong mt-6 rounded-[2rem] p-6 shadow-xl md:p-8"
                    >

                        <div className="mb-7 flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                ✏️
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                                    Store Details
                                </p>

                                <h2 className="text-2xl font-black text-gray-900">
                                    Edit Store
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update your store
                                    information below.
                                </p>

                            </div>

                        </div>


                        <div className="grid gap-5 sm:grid-cols-2">


                            {/* NAME */}

                            <div className="sm:col-span-2">

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Store Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="Store name"
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="sm:col-span-2">

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Tell customers about your store..."
                                    className="glass-input w-full resize-none rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* CATEGORY */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="Restaurant"
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* PHONE */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Phone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Phone number"
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* ADDRESS */}

                            <div className="sm:col-span-2">

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="3"
                                    required
                                    placeholder="Full store address"
                                    className="glass-input w-full resize-none rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* LONGITUDE */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Longitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={
                                        formData.longitude
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    min="-180"
                                    max="180"
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                                <p className="mt-1.5 text-xs text-gray-400">
                                    Range: -180 to 180
                                </p>

                            </div>


                            {/* LATITUDE */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Latitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={
                                        formData.latitude
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    min="-90"
                                    max="90"
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                                <p className="mt-1.5 text-xs text-gray-400">
                                    Range: -90 to 90
                                </p>

                            </div>

                        </div>


                        {/* FORM BUTTONS */}

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    handleCancel
                                }
                                disabled={saving}
                                className="glass-button rounded-xl px-6 py-3 font-black text-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="glass-orange rounded-xl px-6 py-3 font-black disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : "✓ Save Changes"}
                            </button>

                        </div>

                    </form>

                ) : (

                    <div className="mt-6 space-y-6">


                        {/* =================================================
                            STORE HERO
                        ================================================= */}

                        <div className="glass-strong overflow-hidden rounded-[2rem] shadow-xl">

                            <div className="bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-transparent p-6 md:p-8">

                                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                                    <div className="flex items-center gap-5">

                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border border-white/70 bg-white/60 text-4xl shadow-lg backdrop-blur-xl">
                                            🍽️
                                        </div>

                                        <div>

                                            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                                                Your Store
                                            </p>

                                            <h2 className="mt-1 text-3xl font-black text-gray-900">
                                                {store.name}
                                            </h2>

                                            <p className="mt-1 font-semibold text-gray-500">
                                                {store.category ||
                                                    "Store"}
                                            </p>

                                        </div>

                                    </div>


                                    <div
                                        className={`w-fit rounded-full border px-5 py-2.5 text-sm font-black backdrop-blur-xl ${
                                            store.isActive
                                                ? "border-green-200/70 bg-green-50/80 text-green-700"
                                                : "border-red-200/70 bg-red-50/80 text-red-700"
                                        }`}
                                    >
                                        {store.isActive
                                            ? "● Open"
                                            : "● Closed"}
                                    </div>

                                </div>

                            </div>


                            {/* STORE DETAILS */}

                            <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">


                                {/* DESCRIPTION */}

                                <div className="glass rounded-2xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70">
                                            📝
                                        </div>

                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Description
                                        </p>

                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-gray-700">
                                        {store.description ||
                                            "No description added."}
                                    </p>

                                </div>


                                {/* CATEGORY */}

                                <div className="glass rounded-2xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70">
                                            🏷️
                                        </div>

                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Category
                                        </p>

                                    </div>

                                    <p className="mt-4 text-lg font-black text-gray-900">
                                        {store.category ||
                                            "Not specified"}
                                    </p>

                                </div>


                                {/* ADDRESS */}

                                <div className="glass rounded-2xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70">
                                            📍
                                        </div>

                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Address
                                        </p>

                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-gray-700">
                                        {store.address ||
                                            "No address added."}
                                    </p>

                                </div>


                                {/* PHONE */}

                                <div className="glass rounded-2xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70">
                                            📞
                                        </div>

                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Phone
                                        </p>

                                    </div>

                                    <p className="mt-4 text-lg font-black text-gray-900">
                                        {store.phone ||
                                            "No phone number"}
                                    </p>

                                </div>


                                {/* LONGITUDE */}

                                <div className="glass rounded-2xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70">
                                            🌐
                                        </div>

                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Longitude
                                        </p>

                                    </div>

                                    <p className="mt-4 font-black text-gray-900">
                                        {longitude ??
                                            "Not available"}
                                    </p>

                                </div>


                                {/* LATITUDE */}

                                <div className="glass rounded-2xl p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70">
                                            🌐
                                        </div>

                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Latitude
                                        </p>

                                    </div>

                                    <p className="mt-4 font-black text-gray-900">
                                        {latitude ??
                                            "Not available"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            STORE STATUS
                        ================================================= */}

                        <div className="glass-strong rounded-[2rem] p-6 shadow-xl md:p-8">

                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                                <div className="flex items-start gap-4">

                                    <div
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                                            store.isActive
                                                ? "bg-green-100/70"
                                                : "bg-red-100/70"
                                        }`}
                                    >
                                        {store.isActive
                                            ? "🟢"
                                            : "🔴"}
                                    </div>

                                    <div>

                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                            Store Status
                                        </p>

                                        <h3 className="mt-1 text-2xl font-black text-gray-900">
                                            {store.isActive
                                                ? "Your store is open"
                                                : "Your store is closed"}
                                        </h3>

                                        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                                            {store.isActive
                                                ? "Your store is currently visible to customers and can receive orders."
                                                : "Your store is currently hidden from customers."}
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        handleToggleStore
                                    }
                                    disabled={
                                        toggling
                                    }
                                    className={`rounded-xl px-6 py-3.5 font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        store.isActive
                                            ? "border border-red-200/70 bg-red-50/70 text-red-700 hover:bg-red-100/80"
                                            : "border border-green-200/70 bg-green-50/70 text-green-700 hover:bg-green-100/80"
                                    }`}
                                >
                                    {toggling
                                        ? "Updating..."
                                        : store.isActive
                                            ? "🔴 Close Store"
                                            : "🟢 Open Store"}
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            QUICK ACTIONS
                        ================================================= */}

                        <div className="grid gap-4 sm:grid-cols-2">

                            <Link
                                to="/owner/products"
                                className="glass glass-hover group rounded-2xl p-6 shadow-lg transition hover:-translate-y-1"
                            >

                                <div className="flex items-center justify-between">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                        🍽️
                                    </div>

                                    <span className="text-xl transition-transform group-hover:translate-x-1">
                                        →
                                    </span>

                                </div>

                                <h3 className="mt-5 text-lg font-black text-gray-900">
                                    Manage Products
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Add, edit and manage
                                    your menu items.
                                </p>

                            </Link>


                            <Link
                                to="/owner/orders"
                                className="glass glass-hover group rounded-2xl p-6 shadow-lg transition hover:-translate-y-1"
                            >

                                <div className="flex items-center justify-between">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                        📦
                                    </div>

                                    <span className="text-xl transition-transform group-hover:translate-x-1">
                                        →
                                    </span>

                                </div>

                                <h3 className="mt-5 text-lg font-black text-gray-900">
                                    Manage Orders
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    View and process
                                    customer orders.
                                </p>

                            </Link>

                        </div>


                        {/* =================================================
                            BOTTOM NAV
                        ================================================= */}

                        <div className="flex justify-center pt-2">

                            <Link
                                to="/owner"
                                className="glass-button inline-flex rounded-xl px-7 py-3.5 font-black text-gray-700"
                            >
                                ← Back to Owner Dashboard
                            </Link>

                        </div>

                    </div>
                )}

            </main>

        </div>
    );
}

export default OwnerStore;