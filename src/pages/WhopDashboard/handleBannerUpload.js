// src/pages/WhopDashboard/handleBannerUpload.js

export default async function handleBannerUpload(
  file,
  setEditBannerUrl,
  setBannerError,
  setIsUploadingBanner,
  showNotification
) {
  if (!file) return;
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    setBannerError("Max 5 MB.");
    return;
  }
  if (!file.type.startsWith("image/")) {
    setBannerError("Vyberte obrázek.");
    return;
  }
  setIsUploadingBanner(true);
  setBannerError("");
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
    if (!res.ok) throw new Error(`Cloudinary chybička: ${res.status}`);
    const data = await res.json();
    if (!data.secure_url) throw new Error("Chyba URL.");
    setEditBannerUrl(data.secure_url);
    setBannerError("");
    showNotification({ type: "success", message: "Banner úspěšně nahrán." });
  } catch (err) {
    console.error(err);
    setBannerError("Nepodařilo se nahrát banner.");
    setEditBannerUrl("");
    showNotification({ type: "error", message: "Nepodařilo se nahrát banner." });
  } finally {
    setIsUploadingBanner(false);
  }
}
