import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function Home() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");

    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyDistance, setNearbyDistance] = useState("5000");


    // ==========================================
    // CALCULATE DISTANCE
    // ==========================================

    const calculateDistance = (
        userLatitude,
        userLongitude,
        storeLatitude,
        storeLongitude
    ) => {
        const earthRadius = 6371;

        const latDifference =
            ((storeLatitude - userLatitude) * Math.PI) / 180;

        const lonDifference =
            ((storeLongitude - userLongitude) * Math.PI) / 180;

        const lat1 =
            (userLatitude * Math.PI) / 180;

        const lat2 =
            (storeLatitude * Math.PI) / 180;

        const a =
            Math.sin(latDifference / 2) *
                Math.sin(latDifference / 2) +
            Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(lonDifference / 2) *
                Math.sin(lonDifference / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadius * c;
    };


    // ==========================================
    // LOAD ALL STORES
    // ==========================================

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get("/stores");

                setStores(response.data.stores || []);

            } catch (error) {
                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load stores"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);


    // ==========================================
    // SEARCH
    // ==========================================

    const handleSearch = async (e) => {
        e.preventDefault();

        const query = searchQuery.trim();

        if (!query) {
            try {
                setSearching(true);
                setError("");
                setSelectedCategory("");

                const response =
                    await API.get("/stores");

                setStores(
                    response.data.stores || []
                );

            } catch (error) {
                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load stores"
                );

            } finally {
                setSearching(false);
            }

            return;
        }

        try {
            setSearching(true);
            setError("");
            setSelectedCategory("");

            const response = await API.get(
                `/stores/search?query=${encodeURIComponent(query)}`
            );

            setStores(
                response.data.stores || []
            );

        } catch (error) {
            console.log(error);

            setError(
                error.response?.data?.message ||
                "Unable to search stores"
            );

            setStores([]);

        } finally {
            setSearching(false);
        }
    };


    // ==========================================
    // CLEAR SEARCH
    // ==========================================

    const clearSearch = async () => {
        setSearchQuery("");
        setSelectedCategory("");
        setError("");

        try {
            setSearching(true);

            const response =
                await API.get("/stores");

            setStores(
                response.data.stores || []
            );

        } catch (error) {
            console.log(error);

            setError(
                error.response?.data?.message ||
                "Unable to load stores"
            );

        } finally {
            setSearching(false);
        }
    };


    // ==========================================
    // CATEGORY
    // ==========================================

    const handleCategory = async (category) => {
        try {
            setSearching(true);
            setError("");

            setSelectedCategory(category);
            setSearchQuery("");

            const response = await API.get(
                `/stores/category/${encodeURIComponent(category)}`
            );

            setStores(
                response.data.stores || []
            );

        } catch (error) {
            console.log(error);

            setError(
                error.response?.data?.message ||
                "Unable to load category"
            );

            setStores([]);

        } finally {
            setSearching(false);
        }
    };


    // ==========================================
    // ALL STORES
    // ==========================================

    const handleAllStores = async () => {
        try {
            setSearching(true);
            setError("");

            setSelectedCategory("");
            setSearchQuery("");

            const response =
                await API.get("/stores");

            setStores(
                response.data.stores || []
            );

        } catch (error) {
            console.log(error);

            setError(
                error.response?.data?.message ||
                "Unable to load stores"
            );

        } finally {
            setSearching(false);
        }
    };


    // ==========================================
    // LOCATION
    // ==========================================

    const handleLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(
                "Geolocation is not supported by your browser."
            );

            return;
        }

        setLocationLoading(true);
        setLocationError("");
        setError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                setUserLocation({
                    latitude,
                    longitude
                });

                try {
                    const response = await API.get(
                        `/stores/nearby?latitude=${latitude}&longitude=${longitude}&distance=${nearbyDistance}`
                    );

                    setStores(
                        response.data.stores || []
                    );

                    setSearchQuery("");
                    setSelectedCategory("");

                } catch (error) {
                    console.log(error);

                    setLocationError(
                        error.response?.data?.message ||
                        "Unable to find nearby stores"
                    );

                } finally {
                    setLocationLoading(false);
                }
            },

            (error) => {
                console.log(error);

                setLocationLoading(false);

                if (error.code === 1) {
                    setLocationError(
                        "Location permission was denied."
                    );
                } else if (error.code === 2) {
                    setLocationError(
                        "Unable to determine your location."
                    );
                } else {
                    setLocationError(
                        "Unable to get your location."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 300000
            }
        );
    };


    // ==========================================
    // CATEGORIES
    // ==========================================

    const categories = [
        {
            name: "",
            label: "All",
            icon: "✨"
        },
        {
            name: "Food",
            label: "Food",
            icon: "🍔"
        },
        {
            name: "Cafe",
            label: "Cafe",
            icon: "☕"
        },
        {
            name: "Shopping",
            label: "Shopping",
            icon: "🛍️"
        },
        {
            name: "Salon",
            label: "Salon",
            icon: "💇"
        }
    ];


    // ==========================================
    // RETURN
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden">

            {/* ==========================================
                GLOBAL BACKGROUND GLOW
            ========================================== */}

            <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-400/15 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 top-[30rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-[25rem] w-[25rem] rounded-full bg-amber-200/10 blur-3xl" />


            {/* ==========================================
                HERO
            ========================================== */}

            <section className="relative px-4 pb-10 pt-8 sm:pb-14 sm:pt-12">

                <div className="mx-auto max-w-7xl">

                    <div className="glass-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-10 md:p-14">

                        {/* Decorative glass circles */}

                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/30 bg-white/10 blur-sm" />

                        <div className="pointer-events-none absolute -bottom-32 right-20 h-72 w-72 rounded-full border border-orange-200/20 bg-orange-300/10 blur-2xl" />

                        <div className="relative max-w-4xl">

                            {/* Badge */}

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-sm font-bold text-orange-700 shadow-sm backdrop-blur-xl">

                                <span>✨</span>

                                <span>
                                    Discover • Explore • Save
                                </span>

                            </div>


                            {/* Heading */}

                            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">

                                Discover amazing

                                <span className="mt-2 block bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                                    places near you
                                </span>

                            </h1>


                            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                                Find restaurants, cafes and local stores
                                around you — all in one place.
                            </p>


                            {/* SEARCH */}

                            <form
                                onSubmit={handleSearch}
                                className="glass mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl p-2 shadow-lg sm:flex-row"
                            >

                                <div className="flex min-w-0 flex-1 items-center">

                                    <span className="px-3 text-xl">
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search restaurants, cafes, stores..."
                                        className="w-full bg-transparent px-2 py-3.5 text-gray-800 outline-none placeholder:text-gray-400"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="glass-orange rounded-xl px-8 py-3.5 font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {searching
                                        ? "Searching..."
                                        : "Search"}
                                </button>

                            </form>


                            {/* LOCATION */}

                            <div className="mt-4 flex flex-wrap items-center gap-3">

                                <select
                                    value={nearbyDistance}
                                    onChange={(event) =>
                                        setNearbyDistance(event.target.value)
                                    }
                                    aria-label="Nearby restaurant distance"
                                    className="glass-input rounded-xl px-4 py-3 font-bold text-gray-700"
                                >
                                    <option value="1000">Within 1 km</option>
                                    <option value="3000">Within 3 km</option>
                                    <option value="5000">Within 5 km</option>
                                    <option value="10000">Within 10 km</option>
                                    <option value="25000">Within 25 km</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={handleLocation}
                                    disabled={locationLoading}
                                    className="glass-button rounded-xl px-5 py-3 font-bold text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {locationLoading
                                        ? "📍 Getting location..."
                                        : "📍 Use my location"}
                                </button>


                                {userLocation && (

                                    <span className="glass rounded-xl border border-green-200/70 bg-green-50/60 px-4 py-3 text-sm font-bold text-green-700">
                                        ✓ Location detected
                                    </span>

                                )}

                            </div>

                            <p className="mt-3 text-xs font-medium text-gray-500">
                                Choose a distance, click Use my location, then select Allow in your browser. Your coordinates are used only for this nearby search.
                            </p>


                            {locationError && (

                                <div className="glass mt-4 inline-flex rounded-xl border border-red-200/70 bg-red-50/60 px-4 py-3 text-sm font-medium text-red-600">
                                    ⚠️ {locationError}
                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                CATEGORIES
            ========================================== */}

            <section className="mx-auto max-w-7xl px-4 pb-8">

                <div className="glass rounded-[1.5rem] p-5 shadow-lg sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                Explore
                            </p>

                            <h2 className="mt-1 text-2xl font-black text-gray-900">
                                Categories
                            </h2>

                        </div>


                        <div className="flex gap-3 overflow-x-auto pb-1">

                            {categories.map((category) => (

                                <button
                                    key={
                                        category.name ||
                                        "all"
                                    }
                                    type="button"
                                    onClick={() => {

                                        if (category.name) {
                                            handleCategory(
                                                category.name
                                            );
                                        } else {
                                            handleAllStores();
                                        }

                                    }}
                                    className={`whitespace-nowrap rounded-full border px-5 py-3 text-sm font-bold shadow-sm backdrop-blur-xl transition ${
                                        selectedCategory ===
                                        category.name
                                            ? "border-orange-400 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                            : "border-white/70 bg-white/45 text-gray-700 hover:bg-white/75 hover:text-orange-600"
                                    }`}
                                >

                                    {category.icon}{" "}
                                    {category.label}

                                </button>

                            ))}

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                STORE SECTION
            ========================================== */}

            <section className="mx-auto max-w-7xl px-4 pb-20">

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                            Discover
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">

                            {searchQuery.trim()
                                ? `Search results for "${searchQuery}"`
                                : selectedCategory
                                ? `${selectedCategory} Stores`
                                : userLocation
                                ? "Stores near you"
                                : "Nearby Stores"}

                        </h2>

                    </div>


                    {searchQuery.trim() && (

                        <button
                            type="button"
                            onClick={clearSearch}
                            className="glass-button self-start rounded-xl px-5 py-2.5 text-sm font-bold text-orange-600"
                        >
                            Clear Search
                        </button>

                    )}

                </div>


                {/* ==========================================
                    LOADING
                ========================================== */}

                {loading && (

                    <div className="glass-strong rounded-[1.5rem] p-14 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100/70 text-2xl">
                            🏪
                        </div>

                        <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Loading stores...
                        </p>

                    </div>

                )}


                {/* ==========================================
                    SEARCHING
                ========================================== */}

                {searching && !loading && (

                    <div className="glass-strong rounded-[1.5rem] p-14 text-center">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-bold text-gray-500">
                            Finding stores...
                        </p>

                    </div>

                )}


                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (

                    <div className="glass rounded-2xl border border-red-200/70 bg-red-50/60 p-5 text-center backdrop-blur-xl">

                        <p className="font-bold text-red-600">
                            ⚠️ {error}
                        </p>

                    </div>

                )}


                {/* ==========================================
                    EMPTY
                ========================================== */}

                {!loading &&
                    !searching &&
                    !error &&
                    stores.length === 0 && (

                        <div className="glass-strong rounded-[2rem] p-14 text-center">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/50 text-4xl shadow-sm">
                                🔍
                            </div>

                            <h3 className="mt-6 text-2xl font-black text-gray-900">
                                No stores found
                            </h3>

                            <p className="mt-2 text-gray-500">
                                Try searching for something else.
                            </p>


                            {searchQuery.trim() && (

                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="glass-orange mt-6 rounded-xl px-7 py-3 font-bold"
                                >
                                    View All Stores
                                </button>

                            )}

                        </div>

                    )}


                {/* ==========================================
                    STORE GRID
                ========================================== */}

                {!loading &&
                    !searching &&
                    stores.length > 0 && (

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {stores.map((store) => {

                                let distance = null;


                                // MongoDB GeoJSON:
                                // coordinates[0] = longitude
                                // coordinates[1] = latitude

                                if (
                                    userLocation &&
                                    store.location &&
                                    Array.isArray(
                                        store.location.coordinates
                                    ) &&
                                    store.location.coordinates.length >= 2
                                ) {

                                    const storeLongitude =
                                        Number(
                                            store.location
                                                .coordinates[0]
                                        );

                                    const storeLatitude =
                                        Number(
                                            store.location
                                                .coordinates[1]
                                        );

                                    if (
                                        Number.isFinite(
                                            storeLatitude
                                        ) &&
                                        Number.isFinite(
                                            storeLongitude
                                        )
                                    ) {

                                        distance =
                                            calculateDistance(
                                                userLocation.latitude,
                                                userLocation.longitude,
                                                storeLatitude,
                                                storeLongitude
                                            );

                                    }
                                }


                                return (

                                    <div
                                        key={store._id}
                                        className="glass glass-hover group overflow-hidden rounded-[1.5rem] shadow-lg"
                                    >

                                        {/* STORE IMAGE */}

                                        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100/70 via-white/30 to-orange-50/40">

                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

                                            {/* Decorative circles */}

                                            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full border border-white/40 bg-white/10" />

                                            <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-orange-200/30 bg-orange-200/10" />

                                            <div className="relative text-7xl transition duration-300 group-hover:scale-110">
                                                🏪
                                            </div>

                                            {store.image && (
                                                <img
                                                    src={store.image}
                                                    alt={store.name}
                                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            )}


                                            {store.category && (

                                                <span className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-xs font-black text-orange-700 shadow-sm backdrop-blur-xl">
                                                    {store.category}
                                                </span>

                                            )}

                                        </div>


                                        {/* DETAILS */}

                                        <div className="p-5">

                                            <h3 className="truncate text-xl font-black text-gray-900">
                                                {store.name}
                                            </h3>


                                            {store.address && (

                                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                                                    📍 {store.address}
                                                </p>

                                            )}


                                            {distance !== null && (

                                                <div className="mt-3 inline-flex rounded-full border border-orange-200/70 bg-orange-50/60 px-3 py-1.5 text-sm font-bold text-orange-600 backdrop-blur-xl">
                                                    📏{" "}
                                                    {distance.toFixed(
                                                        1
                                                    )}{" "}
                                                    km away
                                                </div>

                                            )}


                                            <Link
                                                to={`/store/${store._id}`}
                                                className="glass-orange mt-5 block rounded-xl py-3.5 text-center font-black shadow-lg"
                                            >
                                                View Store →
                                            </Link>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

            </section>

        </div>
    );
}

export default Home;
