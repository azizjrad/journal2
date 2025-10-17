import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Upload an image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder name (e.g., 'articles', 'profiles')
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = "uploads"
) {
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${
        Buffer.isBuffer(file) ? file.toString("base64") : file
      }`,
      {
        folder: `akhbarna/${folder}`,
        resource_type: "auto",
        transformation: [
          {
            quality: "auto:good",
            fetch_format: "auto",
          },
        ],
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - The public ID of the image
 * @param transformations - Optional transformations object
 */
export function getOptimizedImageUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        quality: transformations?.quality || "auto:good",
        fetch_format: "auto",
        width: transformations?.width,
        height: transformations?.height,
        crop: transformations?.crop || "limit",
      },
    ],
  });
}
