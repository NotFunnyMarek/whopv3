// src/pages/WhopDashboard/handleCourseFileUpload.js

export default async function handleCourseFileUpload(
  id,
  file,
  setEditCourseSteps,
  showNotification
) {
  if (!file) return;
  const maxSize = 100 * 1024 * 1024; // 100 MB limit
  if (file.size > maxSize) {
    setEditCourseSteps(prev =>
      (Array.isArray(prev) ? prev : []).map(s =>
        s.id === id ? { ...s, error: "Max file size is 100 MB.", isUploading: false } : s
      )
    );
    return;
  }

  setEditCourseSteps(prev =>
    (Array.isArray(prev) ? prev : []).map(s =>
      s.id === id ? { ...s, isUploading: true, error: "" } : s
    )
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_profile_avatars");

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dv6igcvz8/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) throw new Error(`Cloudinary error: ${res.status}`);
    const data = await res.json();
    if (!data.secure_url) throw new Error("Missing secure_url.");

    setEditCourseSteps(prev =>
      (Array.isArray(prev) ? prev : []).map(s =>
        s.id === id
          ? { ...s, fileUrl: data.secure_url, fileType: file.type, isUploading: false, error: "" }
          : s
      )
    );
    showNotification({ type: "success", message: "File uploaded." });
  } catch (err) {
    console.error("Course file upload error:", err);
    setEditCourseSteps(prev =>
      (Array.isArray(prev) ? prev : []).map(s =>
        s.id === id
          ? { ...s, fileUrl: "", fileType: "", isUploading: false, error: "Upload failed." }
          : s
      )
    );
    showNotification({ type: "error", message: "Failed to upload file." });
  }
}
