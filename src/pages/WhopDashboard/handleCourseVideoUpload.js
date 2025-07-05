// src/pages/WhopDashboard/handleCourseVideoUpload.js

export default async function handleCourseVideoUpload(
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
  if (!file.type.startsWith("video/")) {
    setEditCourseSteps(prev =>
      (Array.isArray(prev) ? prev : []).map(s =>
        s.id === id ? { ...s, error: "Please select a video file.", isUploading: false } : s
      )
    );
    return;
  }

  setEditCourseSteps(prev =>
    (Array.isArray(prev) ? prev : []).map(s => (s.id === id ? { ...s, isUploading: true, error: "" } : s))
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

    setEditCourseSteps(prev =>
      (Array.isArray(prev) ? prev : []).map(s =>
        s.id === id
          ? { ...s, videoUrl: data.secure_url, isUploading: false, error: "" }
          : s
      )
    );
    showNotification({ type: "success", message: "Video uploaded." });
  } catch (err) {
    console.error("Course video upload error:", err);
    setEditCourseSteps(prev =>
      (Array.isArray(prev) ? prev : []).map(s =>
        s.id === id
          ? { ...s, videoUrl: "", isUploading: false, error: "Upload failed." }
          : s
      )
    );
    showNotification({ type: "error", message: "Failed to upload video." });
  }
}
