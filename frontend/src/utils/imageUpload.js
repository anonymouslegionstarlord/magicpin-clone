const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

const loadImage = (file) =>
    new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("This image could not be opened"));
        };

        image.src = objectUrl;
    });

const canvasToBlob = (canvas, quality) =>
    new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                reject(new Error("This browser could not process the image"));
            },
            "image/webp",
            quality
        );
    });

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("The image could not be read"));
        reader.readAsDataURL(blob);
    });

export const prepareImage = async (
    file,
    {
        maxWidth = 1400,
        maxHeight = 1400,
        maxOutputBytes = 1_200_000,
        quality = 0.84
    } = {}
) => {
    if (!file) {
        throw new Error("Please choose an image");
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error("Please choose a JPEG, PNG or WebP image");
    }

    if (file.size > MAX_SOURCE_BYTES) {
        throw new Error("Please choose an image smaller than 10 MB");
    }

    const sourceImage = await loadImage(file);
    let scale = Math.min(
        1,
        maxWidth / sourceImage.naturalWidth,
        maxHeight / sourceImage.naturalHeight
    );
    let currentQuality = quality;

    for (let attempt = 0; attempt < 6; attempt += 1) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(
            1,
            Math.round(sourceImage.naturalWidth * scale)
        );
        canvas.height = Math.max(
            1,
            Math.round(sourceImage.naturalHeight * scale)
        );

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("This browser could not process the image");
        }

        context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

        const blob = await canvasToBlob(canvas, currentQuality);

        if (blob.size <= maxOutputBytes) {
            return blobToDataUrl(blob);
        }

        scale *= 0.78;
        currentQuality = Math.max(0.55, currentQuality - 0.07);
    }

    throw new Error("The image is still too large after compression");
};
