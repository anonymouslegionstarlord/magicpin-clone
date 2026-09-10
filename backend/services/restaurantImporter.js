const Coupon = require("../models/Coupon");
const Product = require("../models/Product");
const Store = require("../models/Store");

const DEFAULT_OVERPASS_URL =
    "https://overpass-api.de/api/interpreter";
const OSM_LICENSE_URL =
    "https://www.openstreetmap.org/copyright";

const toFiniteNumber = (value, fieldName) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        throw new Error(`${fieldName} must be a valid number`);
    }

    return number;
};

const validateScanOptions = ({
    latitude,
    longitude,
    radius,
    maxRestaurants
}) => {
    const parsedLatitude = toFiniteNumber(latitude, "latitude");
    const parsedLongitude = toFiniteNumber(longitude, "longitude");
    const parsedRadius = toFiniteNumber(radius, "radius");
    const parsedMaximum = toFiniteNumber(
        maxRestaurants,
        "maxRestaurants"
    );

    if (parsedLatitude < -90 || parsedLatitude > 90) {
        throw new Error("latitude must be between -90 and 90");
    }

    if (parsedLongitude < -180 || parsedLongitude > 180) {
        throw new Error("longitude must be between -180 and 180");
    }

    if (parsedRadius < 100 || parsedRadius > 25000) {
        throw new Error("radius must be between 100 and 25000 metres");
    }

    if (parsedMaximum < 1 || parsedMaximum > 200) {
        throw new Error("maxRestaurants must be between 1 and 200");
    }

    return {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        radius: Math.round(parsedRadius),
        maxRestaurants: Math.round(parsedMaximum)
    };
};

const buildOverpassQuery = ({ latitude, longitude, radius }) => `
[out:json][timeout:25];
(
  nwr(around:${radius},${latitude},${longitude})[amenity~"^(restaurant|fast_food|cafe)$"];
);
out center tags;
`;

const fetchJson = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(
                `Remote source returned HTTP ${response.status}`
            );
        }

        const contentLength = Number(
            response.headers.get("content-length") || 0
        );

        if (contentLength > 5 * 1024 * 1024) {
            throw new Error("Remote feed is larger than 5 MB");
        }

        return response.json();
    } finally {
        clearTimeout(timeout);
    }
};

const fetchNearbyRestaurants = async ({
    latitude,
    longitude,
    radius,
    overpassUrl = process.env.OVERPASS_API_URL ||
        DEFAULT_OVERPASS_URL
}) => {
    const query = buildOverpassQuery({
        latitude,
        longitude,
        radius
    });

    const data = await fetchJson(overpassUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "FoodieHub-RestaurantImporter/1.0"
        },
        body: new URLSearchParams({ data: query }).toString()
    });

    return Array.isArray(data.elements) ? data.elements : [];
};

const titleCase = (value) =>
    value
        .split(/[_;,]/)
        .filter(Boolean)
        .map(
            (part) =>
                part.charAt(0).toUpperCase() +
                part.slice(1).replaceAll("_", " ")
        )
        .join(", ");

const buildAddress = (tags) => {
    if (tags["addr:full"]) {
        return tags["addr:full"];
    }

    const street = [
        tags["addr:housenumber"],
        tags["addr:street"]
    ]
        .filter(Boolean)
        .join(" ");

    const address = [
        street,
        tags["addr:suburb"],
        tags["addr:city"] || tags["addr:town"],
        tags["addr:postcode"]
    ]
        .filter(Boolean)
        .join(", ");

    return address || "Location mapped on OpenStreetMap";
};

const normalizeRestaurant = (element) => {
    const tags = element.tags || {};
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;

    if (
        !tags.name ||
        !Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude))
    ) {
        return null;
    }

    const externalId = `${element.type}/${element.id}`;
    const cuisine = tags.cuisine
        ? titleCase(tags.cuisine)
        : "";

    const category = cuisine ||
        (tags.amenity === "fast_food"
            ? "Fast Food"
            : tags.amenity === "cafe"
                ? "Cafe"
                : "Restaurant");

    return {
        externalId,
        name: tags.name.trim(),
        description: cuisine
            ? `${cuisine} restaurant discovered via OpenStreetMap.`
            : "Restaurant discovered via OpenStreetMap.",
        category,
        address: buildAddress(tags),
        phone: tags.phone || tags["contact:phone"] || "",
        latitude: Number(latitude),
        longitude: Number(longitude),
        sourceUrl: `https://www.openstreetmap.org/${externalId}`,
        menuUrl: tags.menu || tags["contact:menu"] || ""
    };
};

const loadAuthorizedMenuFeed = async (feedUrl) => {
    if (!feedUrl) {
        return null;
    }

    const parsedUrl = new URL(feedUrl);

    if (parsedUrl.protocol !== "https:") {
        throw new Error("MERCHANT_MENU_FEED_URL must use HTTPS");
    }

    const feed = await fetchJson(parsedUrl.toString(), {
        headers: {
            Accept: "application/json",
            "User-Agent": "FoodieHub-MenuImporter/1.0"
        }
    });

    if (feed.authorized !== true) {
        throw new Error(
            "Menu feed must declare authorized: true before import"
        );
    }

    if (!Array.isArray(feed.restaurants)) {
        throw new Error("Menu feed must contain a restaurants array");
    }

    return feed;
};

const validateMenuItem = (item) => {
    const price = Number(item.price);

    return Boolean(
        item &&
        item.externalId &&
        item.name &&
        item.category &&
        Number.isFinite(price) &&
        price >= 0
    );
};

const importMenuForStore = async ({
    store,
    restaurantFeed,
    feed
}) => {
    const now = new Date();
    const productIdsByExternalId = new Map();
    let productsImported = 0;
    let couponsImported = 0;

    for (const item of restaurantFeed.menu || []) {
        if (!validateMenuItem(item)) {
            throw new Error(
                `Invalid menu item in ${restaurantFeed.externalRestaurantId}`
            );
        }

        const product = await Product.findOneAndUpdate(
            {
                store: store._id,
                "source.provider": "merchant_feed",
                "source.externalId": String(item.externalId)
            },
            {
                $set: {
                    name: item.name.trim(),
                    description: item.description?.trim() || "",
                    price: Number(item.price),
                    category: item.category.trim(),
                    image: item.image?.trim() || "",
                    isAvailable: item.isAvailable !== false,
                    "source.lastSyncedAt": now
                },
                $setOnInsert: {
                    store: store._id,
                    "source.provider": "merchant_feed",
                    "source.externalId": String(item.externalId)
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        productIdsByExternalId.set(
            String(item.externalId),
            product._id
        );
        productsImported += 1;
    }

    if (restaurantFeed.replaceMenu === true) {
        await Product.updateMany(
            {
                store: store._id,
                "source.provider": "merchant_feed",
                "source.externalId": {
                    $nin: Array.from(productIdsByExternalId.keys())
                }
            },
            {
                $set: { isAvailable: false }
            }
        );
    }

    for (const offer of restaurantFeed.coupons || []) {
        const type = offer.type;
        const value = Number(offer.value || 0);
        const validType = [
            "percentage",
            "fixed_amount",
            "free_delivery"
        ].includes(type);

        if (
            !offer.code ||
            !offer.title ||
            !validType ||
            (type === "percentage" && (value <= 0 || value > 100)) ||
            (type === "fixed_amount" && value <= 0)
        ) {
            throw new Error(
                `Invalid coupon in ${restaurantFeed.externalRestaurantId}`
            );
        }

        const productIds = (offer.productExternalIds || []).map(
            (externalId) => {
                const productId = productIdsByExternalId.get(
                    String(externalId)
                );

                if (!productId) {
                    throw new Error(
                        `Coupon ${offer.code} references an unknown menu item`
                    );
                }

                return productId;
            }
        );

        await Coupon.findOneAndUpdate(
            {
                store: store._id,
                code: offer.code.trim().toUpperCase()
            },
            {
                $set: {
                    title: offer.title.trim(),
                    description: offer.description?.trim() || "",
                    type,
                    value,
                    minOrderAmount: Number(
                        offer.minOrderAmount || 0
                    ),
                    maxDiscount:
                        offer.maxDiscount === null ||
                        offer.maxDiscount === undefined
                            ? null
                            : Number(offer.maxDiscount),
                    products: productIds,
                    startsAt: offer.startsAt
                        ? new Date(offer.startsAt)
                        : now,
                    endsAt: offer.endsAt
                        ? new Date(offer.endsAt)
                        : null,
                    isActive: offer.isActive !== false,
                    "source.provider": offer.fundedBy === "platform"
                        ? "platform"
                        : "merchant_feed",
                    "source.externalId": offer.externalId
                        ? String(offer.externalId)
                        : offer.code.trim().toUpperCase(),
                    "source.lastSyncedAt": now
                },
                $setOnInsert: {
                    store: store._id,
                    code: offer.code.trim().toUpperCase()
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        couponsImported += 1;
    }

    store.deliveryFee = Number.isFinite(
        Number(restaurantFeed.deliveryFee)
    )
        ? Number(restaurantFeed.deliveryFee)
        : store.deliveryFee;
    store.freeDeliveryAbove = Number.isFinite(
        Number(restaurantFeed.freeDeliveryAbove)
    )
        ? Number(restaurantFeed.freeDeliveryAbove)
        : store.freeDeliveryAbove;
    store.menuSource = {
        name: feed.sourceName || "Authorized merchant feed",
        authorized: true,
        sourceUrl: feed.publicSourceUrl || "",
        lastSyncedAt: now
    };
    await store.save();

    return {
        productsImported,
        couponsImported
    };
};

const importNearbyRestaurants = async ({
    ownerId,
    latitude,
    longitude,
    radius = 5000,
    maxRestaurants = 50,
    menuFeedUrl = process.env.MERCHANT_MENU_FEED_URL,
    dryRun = false
}) => {
    if (!ownerId) {
        throw new Error("An admin owner ID is required");
    }

    const scanOptions = validateScanOptions({
        latitude,
        longitude,
        radius,
        maxRestaurants
    });

    const [elements, menuFeed] = await Promise.all([
        fetchNearbyRestaurants(scanOptions),
        loadAuthorizedMenuFeed(menuFeedUrl)
    ]);

    const restaurants = elements
        .map(normalizeRestaurant)
        .filter(Boolean)
        .slice(0, scanOptions.maxRestaurants);

    if (dryRun) {
        return {
            dryRun: true,
            discovered: restaurants.length,
            restaurants,
            menuFeedLoaded: Boolean(menuFeed)
        };
    }

    const feedByRestaurantId = new Map(
        (menuFeed?.restaurants || []).map((entry) => [
            String(entry.externalRestaurantId),
            entry
        ])
    );

    let storesImported = 0;
    let productsImported = 0;
    let couponsImported = 0;
    const now = new Date();

    for (const restaurant of restaurants) {
        const store = await Store.findOneAndUpdate(
            {
                "source.provider": "openstreetmap",
                "source.externalId": restaurant.externalId
            },
            {
                $set: {
                    name: restaurant.name,
                    description: restaurant.description,
                    category: restaurant.category,
                    address: restaurant.address,
                    phone: restaurant.phone,
                    location: {
                        type: "Point",
                        coordinates: [
                            restaurant.longitude,
                            restaurant.latitude
                        ]
                    },
                    "source.sourceUrl": restaurant.sourceUrl,
                    "source.license": "ODbL 1.0",
                    "source.lastSyncedAt": now
                },
                $setOnInsert: {
                    owner: ownerId,
                    isActive: true,
                    "source.provider": "openstreetmap",
                    "source.externalId": restaurant.externalId
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        storesImported += 1;

        const restaurantFeed = feedByRestaurantId.get(
            restaurant.externalId
        );

        if (restaurantFeed) {
            const menuResult = await importMenuForStore({
                store,
                restaurantFeed,
                feed: menuFeed
            });

            productsImported += menuResult.productsImported;
            couponsImported += menuResult.couponsImported;
        }
    }

    return {
        dryRun: false,
        discovered: restaurants.length,
        storesImported,
        productsImported,
        couponsImported,
        attribution: {
            text: "© OpenStreetMap contributors",
            licenseUrl: OSM_LICENSE_URL
        }
    };
};

module.exports = {
    OSM_LICENSE_URL,
    buildOverpassQuery,
    importNearbyRestaurants,
    normalizeRestaurant,
    validateScanOptions
};
