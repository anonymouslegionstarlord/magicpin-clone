import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    isAvailable: true
};

const OwnerProducts = () => {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState("");
    const [products, setProducts] = useState([]);

    const [loadingStores, setLoadingStores] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState(emptyForm);
    const [editingProduct, setEditingProduct] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [togglingProduct, setTogglingProduct] = useState(null);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");


    // =====================================================
    // LOAD OWNER STORES
    // =====================================================

    useEffect(() => {
        const loadStores = async () => {
            try {
                setLoadingStores(true);
                setError("");

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await API.get(
                    "/stores/my",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const allStores =
                    response.data.stores || [];

                // Get logged-in user ID from JWT
                const payload = JSON.parse(
                    atob(token.split(".")[1])
                );

                const userId =
                    payload.id ||
                    payload._id ||
                    payload.userId;

                const isAdmin =
                    payload.role === "admin";

                // Admins manage all stores; owners manage their own.
                const ownerStores =
                    isAdmin
                        ? allStores
                        : allStores.filter(
                            (store) =>
                                store.owner?._id?.toString() ===
                                    userId?.toString() ||
                                store.owner?.toString() ===
                                    userId?.toString()
                        );

                setStores(ownerStores);

                if (ownerStores.length > 0) {
                    setSelectedStore(
                        ownerStores[0]._id
                    );
                }

            } catch (error) {
                console.log(
                    "Load owner stores error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load your stores"
                );

            } finally {
                setLoadingStores(false);
            }
        };

        loadStores();
    }, [navigate]);


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    useEffect(() => {
        const loadProducts = async () => {
            if (!selectedStore) {
                setProducts([]);
                return;
            }

            try {
                setLoadingProducts(true);
                setError("");

                const response = await API.get(
                    `/products/store/${selectedStore}`
                );

                setProducts(
                    response.data.products || []
                );

            } catch (error) {
                console.log(
                    "Load products error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load products"
                );

            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, [selectedStore]);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };


    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {
        setForm(emptyForm);
        setEditingProduct(null);
        setShowForm(false);
        setError("");
    };


    // =====================================================
    // ADD FORM
    // =====================================================

    const openAddForm = () => {
        setForm(emptyForm);
        setEditingProduct(null);
        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =====================================================
    // EDIT FORM
    // =====================================================

    const openEditForm = (product) => {
        setForm({
            name: product.name || "",
            description:
                product.description || "",
            price: product.price ?? "",
            category: product.category || "",
            image: product.image || "",
            isAvailable:
                product.isAvailable !== false
        });

        setEditingProduct(product);
        setError("");
        setSuccess("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =====================================================
    // SAVE PRODUCT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStore) {
            setError(
                "Please select a store"
            );
            return;
        }

        if (!form.name.trim()) {
            setError(
                "Product name is required"
            );
            return;
        }

        if (!form.category.trim()) {
            setError(
                "Category is required"
            );
            return;
        }

        if (
            form.price === "" ||
            Number(form.price) < 0
        ) {
            setError(
                "Please enter a valid price"
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            const productData = {
                name: form.name.trim(),
                description:
                    form.description.trim(),
                price: Number(form.price),
                category:
                    form.category.trim(),
                image: form.image.trim(),
                isAvailable:
                    form.isAvailable
            };


            // ================================
            // EDIT
            // ================================

            if (editingProduct) {
                const response =
                    await API.put(
                        `/products/${editingProduct._id}`,
                        productData,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                setProducts(
                    (currentProducts) =>
                        currentProducts.map(
                            (product) =>
                                product._id ===
                                editingProduct._id
                                    ? response.data.product
                                    : product
                        )
                );

                setSuccess(
                    "Product updated successfully"
                );
            }


            // ================================
            // ADD
            // ================================

            else {
                const response =
                    await API.post(
                        "/products",
                        {
                            ...productData,
                            storeId:
                                selectedStore
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                setProducts(
                    (currentProducts) => [
                        response.data.product,
                        ...currentProducts
                    ]
                );

                setSuccess(
                    response.data.message ||
                    "Product added successfully"
                );
            }

            setForm(emptyForm);
            setEditingProduct(null);
            setShowForm(false);

        } catch (error) {
            console.log(
                "Save product error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save product"
            );

        } finally {
            setSubmitting(false);
        }
    };


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (
        productId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingProduct(productId);
            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            const response =
                await API.delete(
                    `/products/${productId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setProducts(
                (currentProducts) =>
                    currentProducts.filter(
                        (product) =>
                            product._id !==
                            productId
                    )
            );

            setSuccess(
                response.data.message ||
                "Product deleted successfully"
            );

        } catch (error) {
            console.log(
                "Delete product error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete product"
            );

        } finally {
            setDeletingProduct(null);
        }
    };


    // =====================================================
    // TOGGLE AVAILABILITY
    // =====================================================

    const toggleAvailability = async (
        productId
    ) => {
        try {
            setTogglingProduct(productId);
            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            const response =
                await API.patch(
                    `/products/${productId}/availability`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (product) =>
                            product._id ===
                            productId
                                ? response.data.product
                                : product
                    )
            );

            setSuccess(
                response.data.message ||
                "Product availability updated"
            );

        } catch (error) {
            console.log(
                "Toggle availability error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update availability"
            );

        } finally {
            setTogglingProduct(null);
        }
    };


    // =====================================================
    // CATEGORIES
    // =====================================================

    const categories = useMemo(() => {
        const values = products
            .map(
                (product) =>
                    product.category
            )
            .filter(Boolean);

        return [
            ...new Set(values)
        ];
    }, [products]);


    // =====================================================
    // FILTER PRODUCTS
    // =====================================================

    const filteredProducts =
        products.filter((product) => {
            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                product.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                product.category
                    ?.toLowerCase()
                    .includes(searchValue) ||
                product.description
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesCategory =
                categoryFilter === "all" ||
                product.category ===
                    categoryFilter;

            return (
                matchesSearch &&
                matchesCategory
            );
        });


    // =====================================================
    // STATISTICS
    // =====================================================

    const availableCount =
        products.filter(
            (product) =>
                product.isAvailable
        ).length;

    const unavailableCount =
        products.filter(
            (product) =>
                !product.isAvailable
        ).length;


    // =====================================================
    // STORE LOADING
    // =====================================================

    if (loadingStores) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

                <div className="mx-auto max-w-7xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100/70 text-4xl">
                            🏪
                        </div>

                        <div className="mx-auto mt-7 h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Loading your stores...
                        </p>

                    </div>

                </div>
            </div>
        );
    }


    // =====================================================
    // NO STORE
    // =====================================================

    if (stores.length === 0) {
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
                            No Store Found
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                            You need to own a store
                            before managing products.
                        </p>

                        {error && (
                            <div className="mt-5 rounded-xl border border-red-200/70 bg-red-50/70 p-4 text-sm font-semibold text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/")
                            }
                            className="glass-orange mt-7 rounded-xl px-7 py-3 font-black"
                        >
                            ← Back to Home
                        </button>

                    </div>

                </div>
            </div>
        );
    }


    // =====================================================
    // MAIN
    // =====================================================

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* BACKGROUND */}

            <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-400/15 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 top-[30rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-200/10 blur-3xl" />


            <main className="mx-auto max-w-7xl px-4 py-7 md:py-10">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="glass-strong rounded-[2rem] p-6 shadow-xl md:p-8">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl">
                                🍽️
                            </div>

                            <div>

                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Owner Panel
                                </p>

                                <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                                    Manage Products
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                                    Add, edit and manage
                                    everything on your
                                    store menu.
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

                            <button
                                type="button"
                                onClick={openAddForm}
                                className="glass-orange rounded-xl px-5 py-3 text-sm font-black"
                            >
                                + Add Product
                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

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


                {success && (

                    <div className="glass mt-6 rounded-2xl border border-green-200/70 bg-green-50/60 p-5">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100/70">
                                ✓
                            </div>

                            <div>

                                <p className="font-black text-green-800">
                                    Success
                                </p>

                                <p className="mt-1 text-sm text-green-700">
                                    {success}
                                </p>

                            </div>

                        </div>

                    </div>
                )}


                {/* =================================================
                    STORE SELECTOR
                ================================================= */}

                <div className="glass-strong mt-6 rounded-2xl p-5 shadow-lg">

                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                        <div className="flex-1">

                            <label
                                htmlFor="store"
                                className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400"
                            >
                                Your Store
                            </label>

                            <select
                                id="store"
                                value={selectedStore}
                                onChange={(e) =>
                                    setSelectedStore(
                                        e.target.value
                                    )
                                }
                                className="glass-input w-full rounded-xl px-4 py-3 font-bold text-gray-800 outline-none md:max-w-xl"
                            >

                                {stores.map(
                                    (store) => (
                                        <option
                                            key={
                                                store._id
                                            }
                                            value={
                                                store._id
                                            }
                                        >
                                            {
                                                store.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        <div className="flex gap-3">

                            <div className="glass rounded-xl px-4 py-3">

                                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    Products
                                </p>

                                <p className="mt-1 text-xl font-black text-gray-900">
                                    {products.length}
                                </p>

                            </div>

                            <div className="glass rounded-xl px-4 py-3">

                                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                    Available
                                </p>

                                <p className="mt-1 text-xl font-black text-green-600">
                                    {availableCount}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ADD / EDIT FORM
                ================================================= */}

                {showForm && (

                    <div className="glass-strong mt-6 rounded-[2rem] p-6 shadow-xl md:p-8">

                        <div className="mb-7 flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                    {editingProduct
                                        ? "✏️"
                                        : "➕"}
                                </div>

                                <div>

                                    <p className="text-xs font-black uppercase tracking-wider text-orange-500">
                                        Product
                                    </p>

                                    <h2 className="text-2xl font-black text-gray-900">
                                        {editingProduct
                                            ? "Edit Product"
                                            : "Add Product"}
                                    </h2>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={resetForm}
                                className="glass-button flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-gray-500"
                            >
                                ✕
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 md:grid-cols-2"
                        >

                            {/* NAME */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Product Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Paneer Tikka"
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* CATEGORY */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Category *
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    value={
                                        form.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Snacks"
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* PRICE */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Price *
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-orange-500">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        name="price"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder="199"
                                        className="glass-input w-full rounded-xl py-3 pl-9 pr-4 text-gray-800 outline-none"
                                    />

                                </div>

                            </div>


                            {/* IMAGE */}

                            <div>

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Image URL
                                </label>

                                <input
                                    type="text"
                                    name="image"
                                    value={
                                        form.image
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://..."
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="md:col-span-2">

                                <label className="mb-2 block text-sm font-black text-gray-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Describe your product..."
                                    className="glass-input w-full resize-none rounded-xl px-4 py-3 text-gray-800 outline-none"
                                />

                            </div>


                            {/* AVAILABILITY */}

                            <label className="glass flex cursor-pointer items-center gap-4 rounded-xl p-4">

                                <input
                                    id="isAvailable"
                                    type="checkbox"
                                    name="isAvailable"
                                    checked={
                                        form.isAvailable
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="h-5 w-5 accent-orange-600"
                                />

                                <div>

                                    <p className="font-black text-gray-800">
                                        Product is available
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Customers can
                                        order this
                                        product.
                                    </p>

                                </div>

                            </label>


                            {/* BUTTONS */}

                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end md:items-center">

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="glass-button rounded-xl px-6 py-3 font-black text-gray-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                    className="glass-orange rounded-xl px-6 py-3 font-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingProduct
                                            ? "✓ Update Product"
                                            : "+ Add Product"}
                                </button>

                            </div>

                        </form>

                    </div>
                )}


                {/* =================================================
                    FILTER / SEARCH
                ================================================= */}

                <div className="glass-strong mt-6 rounded-2xl p-5 shadow-lg">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex-1">

                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                                Search Products
                            </label>

                            <div className="relative">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Search by name, category or description..."
                                    className="glass-input w-full rounded-xl py-3 pl-11 pr-4 text-gray-800 outline-none"
                                />

                            </div>

                        </div>


                        <div className="lg:w-64">

                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                                Category
                            </label>

                            <select
                                value={
                                    categoryFilter
                                }
                                onChange={(e) =>
                                    setCategoryFilter(
                                        e.target.value
                                    )
                                }
                                className="glass-input w-full rounded-xl px-4 py-3 font-bold text-gray-800 outline-none"
                            >

                                <option value="all">
                                    All Categories
                                </option>

                                {categories.map(
                                    (category) => (
                                        <option
                                            key={
                                                category
                                            }
                                            value={
                                                category
                                            }
                                        >
                                            {category}
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    PRODUCT STATS
                ================================================= */}

                <div className="mt-6 grid gap-4 sm:grid-cols-3">

                    <div className="glass glass-hover rounded-2xl p-5 shadow-lg">

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                🍽️
                            </div>

                            <p className="text-2xl font-black text-gray-900">
                                {products.length}
                            </p>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            Total Products
                        </p>

                    </div>


                    <div className="glass glass-hover rounded-2xl p-5 shadow-lg">

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100/70 text-xl">
                                ✓
                            </div>

                            <p className="text-2xl font-black text-green-600">
                                {availableCount}
                            </p>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            Available
                        </p>

                    </div>


                    <div className="glass glass-hover rounded-2xl p-5 shadow-lg">

                        <div className="flex items-center justify-between">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100/70 text-xl">
                                ×
                            </div>

                            <p className="text-2xl font-black text-red-600">
                                {unavailableCount}
                            </p>

                        </div>

                        <p className="mt-4 text-sm font-black text-gray-700">
                            Unavailable
                        </p>

                    </div>

                </div>


                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div className="mt-6">

                    {loadingProducts ? (

                        <div className="glass-strong rounded-[2rem] p-14 text-center">

                            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                            <p className="mt-5 font-bold text-gray-500">
                                Loading products...
                            </p>

                        </div>

                    ) : filteredProducts.length === 0 ? (

                        <div className="glass-strong rounded-[2rem] p-12 text-center shadow-xl">

                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-100/70 text-5xl">
                                🍽️
                            </div>

                            <h2 className="mt-6 text-2xl font-black text-gray-900">
                                {products.length ===
                                0
                                    ? "No Products Yet"
                                    : "No Products Found"}
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                {products.length ===
                                0
                                    ? "Add your first product to start building your menu."
                                    : "Try changing your search or category filter."}
                            </p>

                            {products.length ===
                                0 && (
                                <button
                                    type="button"
                                    onClick={
                                        openAddForm
                                    }
                                    className="glass-orange mt-6 rounded-xl px-6 py-3 font-black"
                                >
                                    + Add First Product
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                            {filteredProducts.map(
                                (product) => {

                                    const isDeleting =
                                        deletingProduct ===
                                        product._id;

                                    const isToggling =
                                        togglingProduct ===
                                        product._id;

                                    return (

                                        <div
                                            key={
                                                product._id
                                            }
                                            className="glass-strong group overflow-hidden rounded-[2rem] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                        >

                                            {/* IMAGE */}

                                            <div className="relative overflow-hidden">

                                                {product.image ? (

                                                    <img
                                                        src={
                                                            product.image
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                                                        onError={(
                                                            e
                                                        ) => {
                                                            e.currentTarget.style.display =
                                                                "none";

                                                            const parent =
                                                                e.currentTarget.parentElement;

                                                            if (
                                                                parent
                                                            ) {
                                                                parent.classList.add(
                                                                    "product-image-fallback"
                                                                );
                                                            }
                                                        }}
                                                    />

                                                ) : (

                                                    <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-orange-100/80 to-amber-50/70 text-6xl">
                                                        🍽️
                                                    </div>

                                                )}


                                                <div className="absolute left-4 top-4">

                                                    <span
                                                        className={`rounded-full border px-3 py-1.5 text-xs font-black backdrop-blur-xl ${
                                                            product.isAvailable
                                                                ? "border-green-200/70 bg-green-50/80 text-green-700"
                                                                : "border-red-200/70 bg-red-50/80 text-red-700"
                                                        }`}
                                                    >
                                                        {product.isAvailable
                                                            ? "● Available"
                                                            : "● Unavailable"}
                                                    </span>

                                                </div>


                                                <div className="absolute right-4 top-4">

                                                    <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-black text-gray-700 shadow-sm backdrop-blur-xl">
                                                        {product.category ||
                                                            "General"}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* CONTENT */}

                                            <div className="p-5">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="min-w-0">

                                                        <h3 className="truncate text-xl font-black text-gray-900">
                                                            {
                                                                product.name
                                                            }
                                                        </h3>

                                                        <p className="mt-1 text-sm font-semibold text-orange-500">
                                                            {
                                                                product.category
                                                            }
                                                        </p>

                                                    </div>

                                                    <div className="shrink-0 rounded-xl bg-orange-50/70 px-3 py-2 text-right">

                                                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                                            Price
                                                        </p>

                                                        <p className="text-xl font-black text-orange-600">
                                                            ₹
                                                            {Number(
                                                                product.price ||
                                                                0
                                                            ).toFixed(
                                                                2
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>


                                                {product.description && (

                                                    <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-500">
                                                        {
                                                            product.description
                                                        }
                                                    </p>

                                                )}


                                                {!product.description && (

                                                    <p className="mt-4 min-h-[4.5rem] text-sm italic leading-6 text-gray-400">
                                                        No description added.
                                                    </p>

                                                )}


                                                {/* AVAILABILITY */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleAvailability(
                                                            product._id
                                                        )
                                                    }
                                                    disabled={
                                                        isToggling
                                                    }
                                                    className={`mt-5 w-full rounded-xl border px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        product.isAvailable
                                                            ? "border-yellow-200/70 bg-yellow-50/70 text-yellow-800 hover:bg-yellow-100/80"
                                                            : "border-green-200/70 bg-green-50/70 text-green-800 hover:bg-green-100/80"
                                                    }`}
                                                >
                                                    {isToggling
                                                        ? "Updating..."
                                                        : product.isAvailable
                                                            ? "● Mark Unavailable"
                                                            : "✓ Mark Available"}
                                                </button>


                                                {/* EDIT / DELETE */}

                                                <div className="mt-3 grid grid-cols-2 gap-3">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditForm(
                                                                product
                                                            )
                                                        }
                                                        className="glass-button rounded-xl px-4 py-3 text-sm font-black text-gray-700"
                                                    >
                                                        ✏️ Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                product._id
                                                            )
                                                        }
                                                        disabled={
                                                            isDeleting
                                                        }
                                                        className="rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100/80 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {isDeleting
                                                            ? "Deleting..."
                                                            : "🗑️ Delete"}
                                                    </button>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    BOTTOM NAVIGATION
                ================================================= */}

                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">

                    <Link
                        to="/owner"
                        className="glass-button inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-black text-gray-700"
                    >
                        ← Owner Dashboard
                    </Link>

                    <Link
                        to="/owner/orders"
                        className="glass-orange inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-black"
                    >
                        View Orders →
                    </Link>

                </div>

            </main>

        </div>
    );
};

export default OwnerProducts;
