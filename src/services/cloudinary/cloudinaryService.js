import cloudinaryAxios from "./cloudinaryAxios";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../config/runtime";

export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("File is required");
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration is missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await cloudinaryAxios.post(
      `/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return res.data.secure_url;
  } catch (error) {
    console.error("Upload Cloudinary failed:", error.response?.data || error);
    throw new Error("Cloudinary upload failed");
  }
};
