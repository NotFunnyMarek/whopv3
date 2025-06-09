// src/pages/WhopDashboard/handleFeatureImageUpload.js

export default async function handleFeatureImageUpload(
  id,
  file,
  setEditFeatures,
  showNotification
) {
  if (!file) return;
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, error: "Max 5 MB.", isUploading: false } : f
      )
    );
    return;
  }
  if (!file.type.startsWith("image/")) {
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, error: "Vyberte obrázek.", isUploading: false } : f
      )
    );
    return;
  }
  setEditFeatures((prev) =>
    prev.map((f) => (f.id === id ? { ...f, isUploading: true, error: "" } : f))
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
    if (!res.ok) throw new Error(`Cloudinary: ${res.status}`);
    const data = await res.json();
    if (!data.secure_url) throw new Error("Žádné secure_url.");
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, imageUrl: data.secure_url, isUploading: false, error: "" }
          : f
      )
    );
    showNotification({ type: "success", message: "Feature obrázek nahrán." });
  } catch (err) {
    console.error(err);
    setEditFeatures((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, imageUrl: "", isUploading: false, error: "Nepodařilo se." }
          : f
      )
    );
    showNotification({
      type: "error",
      message: "Nepodařilo se nahrát obrázek feature.",
    });
  }
}
