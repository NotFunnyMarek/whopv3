// src/pages/WhopDashboard/handleSaveWhop.js

export default async function handleSaveWhop(
  whopData,
  editName,
  editDescription,
  editBannerUrl,
  editFeatures,
  showNotification,
  setError,
  setEditName,
  setEditDescription,
  setEditBannerUrl,
  setEditFeatures,
  setSlugError,
  fetchCampaigns,
  setWhopData,
  waitlistEnabled,         // new parameter
  waitlistQuestions        // new parameter
) {
  // 1) Validate name and description
  if (!editName.trim() || !editDescription.trim()) {
    setError("Name and description cannot be empty.");
    return;
  }
  // 2) Validate number of features
  const validFeatures = editFeatures.filter(f => f.title.trim() && f.imageUrl);
  if (validFeatures.length < 2) {
    setError("At least 2 valid features are required.");
    return;
  }

  // 3) Build payload
  const payload = {
    slug:               whopData.slug,
    name:               editName.trim(),
    description:        editDescription.trim(),
    bannerUrl:          editBannerUrl.trim(),
    price:              parseFloat(whopData.price) || 0.0,
    currency:           whopData.currency || "USD",
    is_recurring:       whopData.is_recurring || 0,
    billing_period:     whopData.billing_period || "",
    features:           validFeatures.map(f => ({
                          title:     f.title.trim(),
                          subtitle:  f.subtitle.trim(),
                          image_url: f.imageUrl,
                        })),
    // added for waitlist
    waitlist_enabled:   waitlistEnabled ? 1 : 0,
    waitlist_questions: waitlistEnabled
                           ? waitlistQuestions.filter(q => q.trim() !== "")
                           : [],
  };

  try {
    // 4) Send to server
    const res = await fetch("https://app.byxbot.com/php/update_whop.php", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify(payload),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      setError("Server error.");
      return;
    }

    if (!res.ok || json.status !== "success") {
      setError(json.message || "Failed to save changes.");
      return;
    }

    showNotification({ type: "success", message: "Whop saved successfully." });

    // 5) Reload current data
    const refreshRes = await fetch(
      `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
        whopData.slug
      )}`,
      { method: "GET", credentials: "include" }
    );
    const refreshText = await refreshRes.text();
    let refreshJson;
    try {
      refreshJson = JSON.parse(refreshText);
    } catch {
      return;
    }
    if (refreshRes.ok && refreshJson.status === "success") {
      const data = refreshJson.data;
      setWhopData(data);
      setEditName(data.name);
      setEditDescription(data.description);
      setEditBannerUrl(data.banner_url || "");

      // Rebuild features state
      const newFeatures = data.features.map((f, idx) => ({
        id:          idx + 1,
        title:       f.title,
        subtitle:    f.subtitle,
        imageUrl:    f.image_url,
        isUploading: false,
        error:       "",
      }));
      setEditFeatures(newFeatures);

      setError("");
      setSlugError("");
      // waitlist_enabled and waitlist_questions will be handled by the parent hook
    }
  } catch (err) {
    console.error("Network error while saving Whop:", err);
    setError("Network error.");
    showNotification({
      type: "error",
      message: "Network error while saving Whop.",
    });
  }
}
