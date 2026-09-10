const MAX_IMAGE_BYTES = 1_500_000;
const MAX_REMOTE_URL_LENGTH = 2048;

class ImageValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ImageValidationError";
    }
}

const normalizeImage = (value) => {
    if (value === undefined || value === null) {
        return "";
    }

    if (typeof value !== "string") {
        throw new ImageValidationError(
            "Image must be an uploaded JPEG, PNG or WebP file, or an image URL"
        );
    }

    const image = value.trim();

    if (!image) {
        return "";
    }

    if (/^https?:\/\//i.test(image)) {
        if (image.length > MAX_REMOTE_URL_LENGTH) {
            throw new ImageValidationError("Image URL is too long");
        }

        try {
            const url = new URL(image);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("Unsupported protocol");
            }
        } catch {
            throw new ImageValidationError("Please provide a valid image URL");
        }

        return image;
    }

    const dataUrlMatch = image.match(
        /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i
    );

    if (!dataUrlMatch) {
        throw new ImageValidationError(
            "Only JPEG, PNG and WebP images are supported"
        );
    }

    const decodedBytes = Buffer.from(
        dataUrlMatch[2],
        "base64"
    ).length;

    if (!decodedBytes) {
        throw new ImageValidationError("Image data is empty");
    }

    if (decodedBytes > MAX_IMAGE_BYTES) {
        throw new ImageValidationError(
            "Image is too large. Please use an image smaller than 1.5 MB"
        );
    }

    return image;
};

module.exports = {
    ImageValidationError,
    MAX_IMAGE_BYTES,
    normalizeImage
};
