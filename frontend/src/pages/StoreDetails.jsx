import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

function StoreDetails() {
    const { storeId } = useParams();
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);

    const [error, setError] = useState("");
    const [productsError, setProductsError] = useState("");

    const [addingProduct, setAddingProduct] = useState(null);
    const [cartMessage, setCartMessage] = useState(null);

    const token = localStorage.getItem("token");


    // ==========================================
    // LOAD STORE
    // ==========================================

    useEffect(() => {
        const fetchStore = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `/stores/${storeId}`
                );

                setStore(response.data.store);
            } catch (error) {
                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load store"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [storeId]);


    // ==========================================
    // LOAD PRODUCTS
    // ==========================================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setProductsLoading(true);
                setProductsError("");

                const response = await API.get(
                    `/products/store/${storeId}`
                );

                setProducts(
                    response.data.products || []
                );
            } catch (error) {
                console.log(error);

                setProductsError(
                    error.response?.data?.message ||
                    "Unable to load products"
                );
            } finally {
                setProductsLoading(false);
            }
        };

        fetchProducts();
    }, [storeId]);


    // ==========================================
    // ADD TO CART
    // ==========================================

    const addToCart = async (productId) => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setAddingProduct(productId);
            setCartMessage(null);

            const response = await API.post(
                "/cart",
                {
                    productId,
                    quantity: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Cart response:",
                response.data
            );

            setCartMessage({
                type: "success",
                text: "Product added to cart successfully!"
            });

            setTimeout(() => {
                setCartMessage(null);
            }, 3000);

        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setCartMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Unable to add product to cart"
            });

        } finally {
            setAddingProduct(null);
        }
    };


    // ==========================================
    // LOADING STORE
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-32 top-32 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-32 top-80 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

                <div className="mx-auto max-w-7xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/50 text-3xl shadow-sm">
                            🏪
                        </div>

                        <div className="mx-auto mt-6 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Loading store...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // STORE ERROR
    // ==========================================

    if (error) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none fixed -left-32 top-32 -z-10 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none fixed -right-32 bottom-20 -z-10 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

                <div className="mx-auto max-w-2xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center">

                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/50 text-5xl shadow-sm">
                            😕
                        </div>

                        <h1 className="mt-6 text-3xl font-black text-gray-900">
                            Store not found
                        </h1>

                        <p className="mt-3 text-gray-500">
                            {error}
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="glass-orange mt-7 rounded-xl px-7 py-3.5 font-bold shadow-lg"
                        >
                            ← Back to Stores
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    if (!store) {
        return null;
    }


    // ==========================================
    // MAIN
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* ==========================================
                BACKGROUND EFFECTS
            ========================================== */}

            <div className="pointer-events-none fixed -left-40 top-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-400/15 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 top-[35rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-[25rem] w-[25rem] rounded-full bg-amber-200/10 blur-3xl" />


            {/* ==========================================
                BACK BUTTON
            ========================================== */}

            <div className="mx-auto max-w-7xl px-4 pt-6">

                <Link
                    to="/"
                    className="glass-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-gray-700 shadow-sm"
                >
                    ← Back to stores
                </Link>

            </div>


            {/* ==========================================
                STORE HERO
            ========================================== */}

            <section className="mx-auto max-w-7xl px-4 py-6">

                <div className="glass-strong overflow-hidden rounded-[2rem] shadow-xl">

                    {/* Cover */}

                    <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-200/70 via-orange-100/50 to-white/30 md:h-80">

                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

                        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-white/40 bg-white/10" />

                        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full border border-orange-200/30 bg-orange-200/10" />

                        <div className="relative text-8xl drop-shadow-lg transition duration-300 hover:scale-110 md:text-9xl">
                            🏪
                        </div>


                        {store.category && (
                            <span className="absolute right-5 top-5 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-sm font-black text-orange-700 shadow-lg backdrop-blur-xl">
                                {store.category}
                            </span>
                        )}

                    </div>


                    {/* Store Information */}

                    <div className="p-6 md:p-8">

                        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">

                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-3">

                                    <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                                        {store.name}
                                    </h1>

                                    {store.category && (
                                        <span className="rounded-full border border-orange-200/70 bg-orange-50/70 px-4 py-1.5 text-sm font-bold text-orange-700 backdrop-blur-xl">
                                            {store.category}
                                        </span>
                                    )}

                                </div>


                                {store.description && (
                                    <p className="mt-4 max-w-2xl leading-7 text-gray-600">
                                        {store.description}
                                    </p>
                                )}


                                <div className="mt-5 space-y-3 text-sm text-gray-500">

                                    {store.address && (
                                        <p className="flex items-start gap-3">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/60 shadow-sm">
                                                📍
                                            </span>

                                            <span className="pt-1">
                                                {store.address}
                                            </span>
                                        </p>
                                    )}


                                    {store.phone && (
                                        <p className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/60 shadow-sm">
                                                📞
                                            </span>

                                            <span>
                                                {store.phone}
                                            </span>
                                        </p>
                                    )}

                                </div>

                            </div>


                            {/* Rating */}

                            <div className="glass-orange min-w-[160px] rounded-2xl px-6 py-5 text-center shadow-lg">

                                <div className="text-3xl font-black">
                                    ⭐ 4.5
                                </div>

                                <p className="mt-1 text-sm font-bold opacity-80">
                                    Store Rating
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                STORE CONTENT
            ========================================== */}

            <section className="mx-auto max-w-7xl px-4">

                <div className="grid gap-7 lg:grid-cols-3">


                    {/* ==========================================
                        ABOUT
                    ========================================== */}

                    <div className="lg:col-span-2">

                        <div className="glass rounded-[1.5rem] p-6 shadow-lg md:p-7">

                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-xl shadow-sm">
                                    🏪
                                </div>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                                        About
                                    </p>

                                    <h2 className="text-2xl font-black text-gray-900">
                                        About this store
                                    </h2>
                                </div>

                            </div>

                            <p className="mt-5 leading-7 text-gray-600">
                                {store.description ||
                                    "Discover products and offers available at this store."}
                            </p>

                        </div>

                    </div>


                    {/* ==========================================
                        STORE INFORMATION
                    ========================================== */}

                    <div>

                        <div className="glass rounded-[1.5rem] p-6 shadow-lg">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 shadow-sm">
                                    ℹ️
                                </div>

                                <h2 className="text-xl font-black text-gray-900">
                                    Store Information
                                </h2>

                            </div>


                            <div className="mt-6 space-y-5 text-sm">

                                <div className="glass rounded-xl p-4">

                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                        Category
                                    </p>

                                    <p className="mt-1.5 font-bold text-gray-900">
                                        {store.category ||
                                            "Not available"}
                                    </p>

                                </div>


                                <div className="glass rounded-xl p-4">

                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                        Address
                                    </p>

                                    <p className="mt-1.5 font-bold leading-6 text-gray-900">
                                        {store.address ||
                                            "Not available"}
                                    </p>

                                </div>


                                <div className="glass rounded-xl p-4">

                                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                                        Phone
                                    </p>

                                    <p className="mt-1.5 font-bold text-gray-900">
                                        {store.phone ||
                                            "Not available"}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    PRODUCTS
                ========================================== */}

                <div className="mt-10">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                Explore Menu
                            </p>

                            <h2 className="mt-1 text-3xl font-black text-gray-900">
                                Menu & Products
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Browse products available at this store.
                            </p>

                        </div>


                        <Link
                            to="/cart"
                            className="glass-orange rounded-xl px-6 py-3 text-center font-black shadow-lg"
                        >
                            🛒 View Cart
                        </Link>

                    </div>


                    {/* ==========================================
                        CART MESSAGE
                    ========================================== */}

                    {cartMessage && (

                        <div
                            className={`mt-5 flex items-center justify-between rounded-2xl border px-5 py-4 text-sm font-bold shadow-sm backdrop-blur-xl ${
                                cartMessage.type === "success"
                                    ? "border-green-200/70 bg-green-50/70 text-green-700"
                                    : "border-red-200/70 bg-red-50/70 text-red-700"
                            }`}
                        >

                            <span className="flex items-center gap-2">

                                <span className="text-lg">
                                    {cartMessage.type === "success"
                                        ? "✓"
                                        : "⚠️"}
                                </span>

                                {cartMessage.text}

                            </span>


                            <button
                                type="button"
                                onClick={() =>
                                    setCartMessage(null)
                                }
                                className="ml-4 text-xl opacity-60 transition hover:opacity-100"
                            >
                                ×
                            </button>

                        </div>

                    )}


                    {/* ==========================================
                        PRODUCTS LOADING
                    ========================================== */}

                    {productsLoading && (

                        <div className="glass mt-6 rounded-[1.5rem] p-14 text-center shadow-lg">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/50 text-2xl shadow-sm">
                                🍔
                            </div>

                            <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                            <p className="mt-5 font-bold text-gray-500">
                                Loading products...
                            </p>

                        </div>

                    )}


                    {/* ==========================================
                        PRODUCTS ERROR
                    ========================================== */}

                    {!productsLoading &&
                        productsError && (

                            <div className="glass mt-6 rounded-[1.5rem] border border-red-200/70 bg-red-50/60 p-8 text-center shadow-lg">

                                <div className="text-4xl">
                                    ⚠️
                                </div>

                                <p className="mt-4 font-bold text-red-600">
                                    {productsError}
                                </p>

                            </div>
                        )}


                    {/* ==========================================
                        NO PRODUCTS
                    ========================================== */}

                    {!productsLoading &&
                        !productsError &&
                        products.length === 0 && (

                            <div className="glass mt-6 rounded-[1.5rem] p-14 text-center shadow-lg">

                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/50 text-4xl shadow-sm">
                                    🛍️
                                </div>

                                <h3 className="mt-6 text-2xl font-black text-gray-900">
                                    No products available
                                </h3>

                                <p className="mt-2 text-gray-500">
                                    This store currently has no
                                    available products.
                                </p>

                            </div>
                        )}


                    {/* ==========================================
                        PRODUCT GRID
                    ========================================== */}

                    {!productsLoading &&
                        !productsError &&
                        products.length > 0 && (

                            <div className="mt-6 grid gap-6 md:grid-cols-2">

                                {products.map((product) => (

                                    <div
                                        key={product._id}
                                        className="glass glass-hover group overflow-hidden rounded-[1.5rem] shadow-lg"
                                    >

                                        {/* ==========================================
                                            PRODUCT IMAGE
                                        ========================================== */}

                                        {product.image ? (

                                            <div className="relative h-56 overflow-hidden">

                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                                                {product.category && (
                                                    <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-xs font-black text-gray-700 shadow-sm backdrop-blur-xl">
                                                        {product.category}
                                                    </span>
                                                )}

                                            </div>

                                        ) : (

                                            <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100/80 via-white/40 to-orange-50/50">

                                                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-white/50 bg-white/20" />

                                                <div className="absolute -bottom-12 -right-8 h-36 w-36 rounded-full border border-orange-200/30 bg-orange-200/10" />

                                                <div className="relative text-7xl transition duration-300 group-hover:scale-110">
                                                    🍔
                                                </div>

                                            </div>

                                        )}


                                        {/* ==========================================
                                            PRODUCT DETAILS
                                        ========================================== */}

                                        <div className="p-5">

                                            <div className="flex items-start justify-between gap-4">

                                                <div className="min-w-0">

                                                    <h3 className="truncate text-xl font-black text-gray-900">
                                                        {product.name}
                                                    </h3>

                                                    {product.category && (
                                                        <span className="mt-2 inline-block rounded-full border border-white/70 bg-white/50 px-3 py-1 text-xs font-bold text-gray-600 backdrop-blur-xl">
                                                            {product.category}
                                                        </span>
                                                    )}

                                                </div>


                                                <p className="whitespace-nowrap text-xl font-black text-orange-600">
                                                    ₹{product.price}
                                                </p>

                                            </div>


                                            {/* Description */}

                                            {product.description && (
                                                <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                                                    {product.description}
                                                </p>
                                            )}


                                            {/* Add To Cart */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addToCart(
                                                        product._id
                                                    )
                                                }
                                                disabled={
                                                    addingProduct ===
                                                    product._id
                                                }
                                                className="glass-orange mt-5 w-full rounded-xl py-3.5 font-black shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {addingProduct ===
                                                product._id
                                                    ? "Adding..."
                                                    : "+ Add to Cart"}
                                            </button>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                </div>

            </section>

        </div>
    );
}

export default StoreDetails;