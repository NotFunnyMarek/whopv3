// src/pages/WhopDashboard/handleSlugSave.js

export default async function handleSlugSave(
  whopData,
  newSlugValue,
  showNotification,
  setSlugError,
  navigate
) {
  setSlugError("");
  const trimmed = newSlugValue.trim();

  // 1) Slug must not be empty
  if (!trimmed) {
    setSlugError("Slug cannot be empty.");
    return;
  }
  // 2) Only letters, numbers, dashes, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    setSlugError("Only letters, numbers, dashes, and underscores are allowed.");
    return;
  }

  try {
    // 3) Send slug update request
    const payload = { oldSlug: whopData.slug, newSlug: trimmed };
    const res = await fetch("https://app.byxbot.com/php/update_whop_slug.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      setSlugError("Error parsing server response.");
      return;
    }

    // 4) Handle error status
    if (!res.ok || json.status !== "success") {
      setSlugError(json.message || "Failed to update slug.");
      return;
    }

    // 5) Success
    showNotification({ type: "success", message: "Slug updated successfully." });
    navigate(`/c/${trimmed}`);
  } catch (err) {
    console.error("Network error updating slug:", err);
    setSlugError("Network error.");
  }
}
