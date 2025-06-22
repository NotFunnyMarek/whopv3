// src/pages/WhopDashboard/handleFeatureImageUpload.js

export default async function handleFeatureImageUpload(
  id,
  file,
  setEditFeatures,
  showNotification
) {
  if (!file) return;
  const maxSize = 5 * 1024 * 1024; // 5 MB limit
  if (file.size > maxSize) {
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, error: "Max file size is 5 MB.", isUploading: false }
          : f
      )
    );
    return;
  }
  if (!file.type.startsWith("image/")) {
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, error: "Please select an image file.", isUploading: false }
          : f
      )
    );
    return;
  }

  // Mark as uploading and clear previous error
  setEditFeatures((prev) =>
    prev.map((f) =>
      f.id === id ? { ...f, isUploading: true, error: "" } : f
    )
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_profile_avatars");

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dv6igcvz8/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) throw new Error(`Cloudinary error: ${res.status}`);
    const data = await res.json();
    if (!data.secure_url) throw new Error("Missing secure_url.");

    // Update the specific feature's image URL
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, imageUrl: data.secure_url, isUploading: false, error: "" }
          : f
      )
    );
    showNotification({ type: "success", message: "Feature image uploaded." });
  } catch (err) {
    console.error("Feature image upload error:", err);
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, imageUrl: "", isUploading: false, error: "Upload failed." }
          : f
      )
    );
    showNotification({
      type: "error",
      message: "Failed to upload feature image.",
    });
  }
}
