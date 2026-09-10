import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { prepareImage } from "../utils/imageUpload";

const emptyStoreForm = {
    name: "",
    description: "",
    category: "Restaurant",
    address: "",
    phone: "",
    image: "",
    longitude: "",
    latitude: ""
};

const getStoreFormData = (store) => ({
    name: store?.name || "",
    description: store?.description || "",
    category: store?.category || "Restaurant",
    address: store?.address || "",
    phone: store?.phone || "",
    image: store?.image || "",
    longitude: store?.location?.coordinates?.[0] ?? "",
    latitude: store?.location?.coordinates?.[1] ?? ""
});

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
});

const getLocationErrorMessage = (error) => {
    if (error?.code === 1) {
        return "Location permission was denied. Allow location access in your browser and try again.";
    }

    if (error?.code === 2) {
        return "Your current location could not be determined.";
    }

    if (error?.code === 3) {
        return "Getting your location took too long. Please try again.";
    }

    return error?.message || "Unable to get your current location.";
};

const requestBrowserLocation = () =>
    new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(
                new Error("Geolocation is not supported by this browser.")
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }),
            reject,
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 300000
            }
        );
    });

function OwnerStore() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [formMode, setFormMode] = useState("");
    const [formData, setFormData] = useState(emptyStoreForm);
    const [saving, setSaving] = useState(false);
    const [processingImage, setProcessingImage] = useState(false);
    const [removingStore, setRemovingStore] = useState(false);
    const [removingProduct, setRemovingProduct] = useState("");
    const [togglingStore, setTogglingStore] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [finderRadius, setFinderRadius] = useState("5000");
    const [finderLimit, setFinderLimit] = useState("20");
    const [finderCoordinates, setFinderCoordinates] = useState(null);
    const [finderResults, setFinderResults] = useState([]);
    const [findingNearby, setFindingNearby] = useState(false);
    const [importingNearby, setImportingNearby] = useState(false);
    const [finderError, setFinderError] = useState("");

    const selectedStore = stores.find(
        (item) => item._id === selectedStoreId
    ) || null;

    const refreshStores = useCallback(
        async (preferredStoreId = "") => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return [];
            }

            const response = await API.get("/stores/my", {
                headers: getAuthHeaders()
            });
            const nextStores = response.data.stores || [];

            setStores(nextStores);
            setSelectedStoreId((currentStoreId) => {
                const requestedId = preferredStoreId || currentStoreId;
                const requestedStoreExists = nextStores.some(
                    (item) => item._id === requestedId
                );

                if (requestedStoreExists) {
                    return requestedId;
                }

                return nextStores[0]?._id || "";
            });

            return nextStores;
        },
        [navigate]
    );

    useEffect(() => {
        const loadStores = async () => {
            try {
                setError("");
                await refreshStores();
            } catch (requestError) {
                console.log("Load restaurants error:", requestError);
                setError(
                    requestError.response?.data?.message ||
                    "Failed to load restaurants"
                );
            } finally {
                setLoading(false);
            }
        };

        loadStores();
    }, [refreshStores]);

    useEffect(() => {
        const loadProducts = async () => {
            if (!selectedStoreId) {
                setProducts([]);
                return;
            }

            try {
                setLoadingProducts(true);
                const response = await API.get(
                    `/products/store/${selectedStoreId}/manage`,
                    { headers: getAuthHeaders() }
                );

                setProducts(response.data.products || []);
            } catch (requestError) {
                console.log("Load restaurant menu error:", requestError);
                setProducts([]);
                setError(
                    requestError.response?.data?.message ||
                    "Failed to load restaurant menu"
                );
            } finally {
                setLoadingProducts(false);
            }
        };

        loadProducts();
    }, [selectedStoreId]);

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    const startCreate = () => {
        clearMessages();
        setFormMode("create");
        setFormData({
            ...emptyStoreForm,
            longitude: finderCoordinates?.longitude ?? "",
            latitude: finderCoordinates?.latitude ?? ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const startEdit = () => {
        if (!selectedStore) {
            return;
        }

        clearMessages();
        setFormMode("edit");
        setFormData(getStoreFormData(selectedStore));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelForm = () => {
        setFormMode("");
        setFormData(
            selectedStore
                ? getStoreFormData(selectedStore)
                : emptyStoreForm
        );
        clearMessages();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleImageSelection = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        try {
            setProcessingImage(true);
            clearMessages();

            const image = await prepareImage(file, {
                maxWidth: 1600,
                maxHeight: 1000
            });

            setFormData((current) => ({ ...current, image }));
        } catch (imageError) {
            setError(imageError.message);
        } finally {
            setProcessingImage(false);
        }
    };

    const useCurrentLocationInForm = async () => {
        try {
            clearMessages();
            const coordinates = await requestBrowserLocation();

            setFinderCoordinates(coordinates);
            setFormData((current) => ({
                ...current,
                latitude: coordinates.latitude.toFixed(6),
                longitude: coordinates.longitude.toFixed(6)
            }));
            setSuccess("Current location added to the restaurant form.");
        } catch (locationError) {
            setError(getLocationErrorMessage(locationError));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        clearMessages();

        if (
            !formData.name.trim() ||
            !formData.category.trim() ||
            !formData.address.trim()
        ) {
            setError("Restaurant name, category and address are required.");
            return;
        }

        const longitude = Number(formData.longitude);
        const latitude = Number(formData.latitude);

        if (
            !Number.isFinite(longitude) ||
            longitude < -180 ||
            longitude > 180 ||
            !Number.isFinite(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            setError("Please provide valid restaurant coordinates.");
            return;
        }

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            category: formData.category.trim(),
            address: formData.address.trim(),
            phone: formData.phone.trim(),
            image: formData.image.trim(),
            longitude,
            latitude
        };

        try {
            setSaving(true);

            if (formMode === "create") {
                const response = await API.post("/stores", payload, {
                    headers: getAuthHeaders()
                });
                const createdStore = response.data.store;

                await refreshStores(createdStore._id);
                setSuccess("Restaurant added successfully.");
            } else {
                const response = await API.put(
                    `/stores/${selectedStoreId}`,
                    payload,
                    { headers: getAuthHeaders() }
                );
                const updatedStore = response.data.store;

                setStores((current) =>
                    current.map((item) =>
                        item._id === updatedStore._id
                            ? updatedStore
                            : item
                    )
                );
                setSuccess("Restaurant updated successfully.");
            }

            setFormMode("");
        } catch (requestError) {
            console.log("Save restaurant error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Failed to save restaurant"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveStore = async () => {
        if (!selectedStore) {
            return;
        }

        const confirmed = window.confirm(
            `Remove ${selectedStore.name}? It will disappear from FoodieHub, but existing order history will be preserved.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingStore(true);
            clearMessages();

            const response = await API.delete(
                `/stores/${selectedStore._id}`,
                { headers: getAuthHeaders() }
            );
            const remainingStores = stores.filter(
                (item) => item._id !== selectedStore._id
            );

            setStores(remainingStores);
            setSelectedStoreId(remainingStores[0]?._id || "");
            setFormMode("");
            setSuccess(response.data.message);
        } catch (requestError) {
            console.log("Remove restaurant error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Failed to remove restaurant"
            );
        } finally {
            setRemovingStore(false);
        }
    };

    const handleToggleStore = async () => {
        if (!selectedStore) {
            return;
        }

        try {
            setTogglingStore(true);
            clearMessages();
            const response = await API.put(
                `/stores/${selectedStore._id}`,
                { isActive: !selectedStore.isActive },
                { headers: getAuthHeaders() }
            );
            const updatedStore = response.data.store;

            setStores((current) =>
                current.map((item) =>
                    item._id === updatedStore._id
                        ? updatedStore
                        : item
                )
            );
            setSuccess(
                updatedStore.isActive
                    ? "Restaurant is now visible to customers."
                    : "Restaurant is now closed to customers."
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Failed to update restaurant status"
            );
        } finally {
            setTogglingStore(false);
        }
    };

    const handleRemoveProduct = async (product) => {
        const confirmed = window.confirm(
            `Remove ${product.name} from this restaurant menu?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingProduct(product._id);
            clearMessages();
            const response = await API.delete(
                `/products/${product._id}`,
                { headers: getAuthHeaders() }
            );

            setProducts((current) =>
                current.filter((item) => item._id !== product._id)
            );
            setSuccess(response.data.message);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Failed to remove food item"
            );
        } finally {
            setRemovingProduct("");
        }
    };

    const handleFindNearby = async () => {
        try {
            setFindingNearby(true);
            setFinderError("");
            setFinderResults([]);

            const coordinates = await requestBrowserLocation();
            setFinderCoordinates(coordinates);

            const response = await API.post(
                "/import/restaurants",
                {
                    ...coordinates,
                    radius: Number(finderRadius),
                    maxRestaurants: Number(finderLimit),
                    dryRun: true
                },
                { headers: getAuthHeaders() }
            );

            setFinderResults(response.data.result?.restaurants || []);
        } catch (requestError) {
            console.log("Find nearby restaurants error:", requestError);
            setFinderError(
                requestError.response?.data?.message ||
                getLocationErrorMessage(requestError)
            );
        } finally {
            setFindingNearby(false);
        }
    };

    const handleImportNearby = async () => {
        if (!finderCoordinates || finderResults.length === 0) {
            return;
        }

        try {
            setImportingNearby(true);
            setFinderError("");
            clearMessages();

            const response = await API.post(
                "/import/restaurants",
                {
                    ...finderCoordinates,
                    radius: Number(finderRadius),
                    maxRestaurants: Number(finderLimit),
                    dryRun: false
                },
                { headers: getAuthHeaders() }
            );
            const result = response.data.result || {};

            await refreshStores();
            setSuccess(
                `${result.storesImported || 0} nearby restaurants added or refreshed. ${result.productsImported || 0} authorized menu items imported.`
            );
        } catch (requestError) {
            console.log("Import nearby restaurants error:", requestError);
            setFinderError(
                requestError.response?.data?.message ||
                "Failed to import nearby restaurants"
            );
        } finally {
            setImportingNearby(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="glass-strong rounded-[2rem] p-12 text-center">
                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
                    <p className="mt-5 font-bold text-gray-500">
                        Loading restaurants...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">
            <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-400/15 blur-3xl" />
            <div className="pointer-events-none fixed -right-40 top-[28rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-orange-300/10 blur-3xl" />

            <main className="mx-auto max-w-7xl px-4 py-7 md:py-10">
                <section className="glass-strong rounded-[2rem] p-6 shadow-xl md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl">
                                🏪
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Atlas Admin
                                </p>
                                <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                                    Manage Restaurants
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                    Add or remove restaurants, update their details, and manage every restaurant menu.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/owner"
                                className="glass-button rounded-xl px-5 py-3 text-sm font-black text-gray-700"
                            >
                                ← Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={startCreate}
                                className="glass-orange rounded-xl px-5 py-3 text-sm font-black"
                            >
                                + Add Restaurant
                            </button>
                        </div>
                    </div>
                </section>

                <section className="glass-strong mt-6 rounded-[2rem] p-6 shadow-xl md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                Geolocation Finder
                            </p>
                            <h2 className="mt-1 text-2xl font-black text-gray-900">
                                Find Nearby Restaurants
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Click the finder and choose Allow when your browser asks for location. FoodieHub uses the coordinates only to preview nearby OpenStreetMap restaurants. Review the list before importing it.
                            </p>
                        </div>

                        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
                            <label className="text-sm font-bold text-gray-700">
                                Search radius
                                <select
                                    value={finderRadius}
                                    onChange={(event) => {
                                        setFinderRadius(event.target.value);
                                        setFinderResults([]);
                                    }}
                                    className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-gray-800"
                                >
                                    <option value="1000">1 km</option>
                                    <option value="3000">3 km</option>
                                    <option value="5000">5 km</option>
                                    <option value="10000">10 km</option>
                                    <option value="25000">25 km</option>
                                </select>
                            </label>

                            <label className="text-sm font-bold text-gray-700">
                                Maximum results
                                <select
                                    value={finderLimit}
                                    onChange={(event) => {
                                        setFinderLimit(event.target.value);
                                        setFinderResults([]);
                                    }}
                                    className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-gray-800"
                                >
                                    <option value="10">10 restaurants</option>
                                    <option value="20">20 restaurants</option>
                                    <option value="50">50 restaurants</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleFindNearby}
                            disabled={findingNearby || importingNearby}
                            className="glass-orange rounded-xl px-5 py-3 text-sm font-black disabled:opacity-50"
                        >
                            {findingNearby
                                ? "📍 Finding restaurants..."
                                : "📍 Use My Location & Preview"}
                        </button>
                        <button
                            type="button"
                            onClick={handleImportNearby}
                            disabled={
                                importingNearby ||
                                findingNearby ||
                                finderResults.length === 0
                            }
                            className="glass-button rounded-xl px-5 py-3 text-sm font-black text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {importingNearby
                                ? "Importing..."
                                : `Import ${finderResults.length || "Previewed"} Restaurants`}
                        </button>
                    </div>

                    {finderCoordinates && (
                        <p className="mt-3 text-xs font-bold text-green-700">
                            ✓ Location detected: {finderCoordinates.latitude.toFixed(4)}, {finderCoordinates.longitude.toFixed(4)}
                        </p>
                    )}

                    {finderError && (
                        <p className="mt-4 rounded-xl border border-red-200/70 bg-red-50/70 p-4 text-sm font-bold text-red-700">
                            ⚠️ {finderError}
                        </p>
                    )}

                    {finderResults.length > 0 && (
                        <div className="mt-6">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="font-black text-gray-900">
                                    Preview: {finderResults.length} restaurants
                                </h3>
                                <span className="text-xs text-gray-500">
                                    © OpenStreetMap contributors
                                </span>
                            </div>
                            <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                                {finderResults.map((restaurant) => (
                                    <div
                                        key={restaurant.externalId}
                                        className="glass rounded-2xl p-4"
                                    >
                                        <p className="font-black text-gray-900">
                                            {restaurant.name}
                                        </p>
                                        <p className="mt-1 text-xs font-bold text-orange-600">
                                            {restaurant.category}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {restaurant.address}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {error && (
                    <div className="mt-6 rounded-2xl border border-red-200/70 bg-red-50/70 p-5 font-bold text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-2xl border border-green-200/70 bg-green-50/70 p-5 font-bold text-green-700">
                        ✓ {success}
                    </div>
                )}

                {formMode && (
                    <form
                        onSubmit={handleSubmit}
                        className="glass-strong mt-6 rounded-[2rem] p-6 shadow-xl md:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                    Restaurant Form
                                </p>
                                <h2 className="mt-1 text-2xl font-black text-gray-900">
                                    {formMode === "create"
                                        ? "Add Restaurant"
                                        : `Edit ${selectedStore?.name}`}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="glass-button flex h-10 w-10 items-center justify-center rounded-xl font-black text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            <label className="text-sm font-black text-gray-700">
                                Restaurant Name *
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Restaurant name"
                                />
                            </label>

                            <label className="text-sm font-black text-gray-700">
                                Category *
                                <input
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Restaurant, Cafe, Fast Food..."
                                />
                            </label>

                            <label className="text-sm font-black text-gray-700 md:col-span-2">
                                Description
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="glass-input mt-2 w-full resize-none rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Tell customers about this restaurant"
                                />
                            </label>

                            <label className="text-sm font-black text-gray-700">
                                Phone
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Restaurant phone"
                                />
                            </label>

                            <label className="text-sm font-black text-gray-700 md:col-span-2">
                                Address *
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    rows="2"
                                    className="glass-input mt-2 w-full resize-none rounded-xl px-4 py-3 text-gray-800"
                                    placeholder="Full restaurant address"
                                />
                            </label>

                            <div className="md:col-span-2">
                                <p className="text-sm font-black text-gray-700">
                                    Restaurant Picture
                                </p>
                                <div className="mt-2 grid gap-3 sm:grid-cols-[auto_1fr]">
                                    <label className="glass-button flex cursor-pointer items-center justify-center rounded-xl px-5 py-3 text-sm font-black text-gray-700">
                                        {processingImage
                                            ? "Processing..."
                                            : "📷 Choose Image"}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageSelection}
                                            disabled={processingImage || saving}
                                            className="sr-only"
                                        />
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={
                                            formData.image.startsWith("data:image/")
                                                ? ""
                                                : formData.image
                                        }
                                        onChange={handleChange}
                                        className="glass-input w-full rounded-xl px-4 py-3 text-gray-800"
                                        placeholder={
                                            formData.image.startsWith("data:image/")
                                                ? "Uploaded image selected"
                                                : "Or paste an image URL"
                                        }
                                    />
                                </div>

                                {formData.image && (
                                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/70 bg-white/40 p-3">
                                        <img
                                            src={formData.image}
                                            alt="Restaurant preview"
                                            className="h-56 w-full rounded-xl object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((current) => ({
                                                    ...current,
                                                    image: ""
                                                }))
                                            }
                                            className="mt-3 w-full rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-2.5 text-sm font-black text-red-600"
                                        >
                                            Remove Picture
                                        </button>
                                    </div>
                                )}
                            </div>

                            <label className="text-sm font-black text-gray-700">
                                Longitude *
                                <input
                                    type="number"
                                    step="any"
                                    min="-180"
                                    max="180"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    required
                                    className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-gray-800"
                                />
                            </label>

                            <label className="text-sm font-black text-gray-700">
                                Latitude *
                                <input
                                    type="number"
                                    step="any"
                                    min="-90"
                                    max="90"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    required
                                    className="glass-input mt-2 w-full rounded-xl px-4 py-3 text-gray-800"
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={useCurrentLocationInForm}
                                className="glass-button rounded-xl px-5 py-3 text-sm font-black text-gray-700"
                            >
                                📍 Use Current Coordinates
                            </button>
                            <button
                                type="button"
                                onClick={cancelForm}
                                disabled={saving}
                                className="glass-button rounded-xl px-5 py-3 text-sm font-black text-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || processingImage}
                                className="glass-orange rounded-xl px-6 py-3 text-sm font-black disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : formMode === "create"
                                        ? "+ Add Restaurant"
                                        : "✓ Save Changes"}
                            </button>
                        </div>
                    </form>
                )}

                {stores.length > 0 && !formMode && (
                    <section className="glass-strong mt-6 rounded-2xl p-5 shadow-lg">
                        <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-400">
                            Restaurant to manage
                        </label>
                        <select
                            value={selectedStoreId}
                            onChange={(event) => {
                                setSelectedStoreId(event.target.value);
                                clearMessages();
                            }}
                            className="glass-input w-full rounded-xl px-4 py-3 font-bold text-gray-800"
                        >
                            {stores.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name} — {item.category}
                                </option>
                            ))}
                        </select>
                    </section>
                )}

                {!selectedStore && !formMode && (
                    <section className="glass-strong mt-6 rounded-[2rem] p-10 text-center shadow-xl">
                        <div className="text-5xl">🏪</div>
                        <h2 className="mt-5 text-2xl font-black text-gray-900">
                            No restaurants yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                            Add one manually or use the geolocation finder above to preview and import nearby restaurants.
                        </p>
                        <button
                            type="button"
                            onClick={startCreate}
                            className="glass-orange mt-6 rounded-xl px-6 py-3 font-black"
                        >
                            + Add First Restaurant
                        </button>
                    </section>
                )}

                {selectedStore && !formMode && (
                    <>
                        <section className="glass-strong mt-6 overflow-hidden rounded-[2rem] shadow-xl">
                            <div className="relative h-64 bg-gradient-to-br from-orange-100/80 to-amber-50/70 md:h-80">
                                <div className="flex h-full items-center justify-center text-8xl">
                                    🏪
                                </div>
                                {selectedStore.image && (
                                    <img
                                        src={selectedStore.image}
                                        alt={selectedStore.name}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}
                                <span
                                    className={`absolute right-5 top-5 rounded-full border px-4 py-2 text-sm font-black backdrop-blur-xl ${
                                        selectedStore.isActive
                                            ? "border-green-200/70 bg-green-50/80 text-green-700"
                                            : "border-red-200/70 bg-red-50/80 text-red-700"
                                    }`}
                                >
                                    {selectedStore.isActive ? "● Open" : "● Closed"}
                                </span>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <p className="text-sm font-black text-orange-600">
                                            {selectedStore.category}
                                        </p>
                                        <h2 className="mt-1 text-3xl font-black text-gray-900">
                                            {selectedStore.name}
                                        </h2>
                                        <p className="mt-3 max-w-3xl leading-7 text-gray-600">
                                            {selectedStore.description || "No description added."}
                                        </p>
                                        <p className="mt-3 text-sm text-gray-500">
                                            📍 {selectedStore.address}
                                        </p>
                                        {selectedStore.phone && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                📞 {selectedStore.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
                                        <button
                                            type="button"
                                            onClick={startEdit}
                                            className="glass-button rounded-xl px-4 py-2.5 text-sm font-black text-gray-700"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleToggleStore}
                                            disabled={togglingStore}
                                            className="glass-button rounded-xl px-4 py-2.5 text-sm font-black text-gray-700 disabled:opacity-50"
                                        >
                                            {togglingStore
                                                ? "Updating..."
                                                : selectedStore.isActive
                                                    ? "Close Restaurant"
                                                    : "Open Restaurant"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemoveStore}
                                            disabled={removingStore}
                                            className="rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-2.5 text-sm font-black text-red-600 disabled:opacity-50"
                                        >
                                            {removingStore
                                                ? "Removing..."
                                                : "🗑 Remove Restaurant"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="glass-strong mt-6 rounded-[2rem] p-6 shadow-xl md:p-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                                        Restaurant Menu
                                    </p>
                                    <h2 className="mt-1 text-2xl font-black text-gray-900">
                                        Food Items ({products.length})
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        to={`/owner/products?store=${selectedStore._id}`}
                                        className="glass-button rounded-xl px-4 py-2.5 text-sm font-black text-gray-700"
                                    >
                                        Manage Full Menu
                                    </Link>
                                    <Link
                                        to={`/owner/products?store=${selectedStore._id}&action=add`}
                                        className="glass-orange rounded-xl px-4 py-2.5 text-sm font-black"
                                    >
                                        + Add Food Item
                                    </Link>
                                </div>
                            </div>

                            {loadingProducts ? (
                                <p className="mt-6 text-sm font-bold text-gray-500">
                                    Loading menu items...
                                </p>
                            ) : products.length === 0 ? (
                                <div className="mt-6 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">
                                    <div className="text-4xl">🍽️</div>
                                    <p className="mt-3 font-black text-gray-900">
                                        No food items in this restaurant
                                    </p>
                                    <Link
                                        to={`/owner/products?store=${selectedStore._id}&action=add`}
                                        className="mt-4 inline-flex font-black text-orange-600"
                                    >
                                        Add the first food item →
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {products.map((product) => (
                                        <article
                                            key={product._id}
                                            className="glass overflow-hidden rounded-2xl"
                                        >
                                            <div className="relative flex h-36 items-center justify-center bg-orange-50/70 text-5xl">
                                                🍽️
                                                {product.image && (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="absolute inset-0 h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-black text-gray-900">
                                                            {product.name}
                                                        </h3>
                                                        <p className="mt-1 text-xs font-bold text-orange-600">
                                                            {product.category}
                                                        </p>
                                                    </div>
                                                    <p className="font-black text-gray-900">
                                                        ₹{Number(product.price || 0).toFixed(0)}
                                                    </p>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <span className={`text-xs font-black ${
                                                        product.isAvailable
                                                            ? "text-green-700"
                                                            : "text-red-600"
                                                    }`}>
                                                        {product.isAvailable
                                                            ? "Available"
                                                            : "Unavailable"}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProduct(product)}
                                                        disabled={removingProduct === product._id}
                                                        className="rounded-lg border border-red-200/70 bg-red-50/70 px-3 py-2 text-xs font-black text-red-600 disabled:opacity-50"
                                                    >
                                                        {removingProduct === product._id
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default OwnerStore;
