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
  setWhopData
) {
  if (!editName.trim() || !editDescription.trim()) {
    setError("Název i popis nesmí být prázdné.");
    return;
  }
  const validFeats = editFeatures.filter((f) => f.title.trim() && f.imageUrl);
  if (validFeats.length < 2) {
    setError("Minimálně 2 platné features.");
    return;
  }

  const payload = {
    slug: whopData.slug,
    name: editName.trim(),
    description: editDescription.trim(),
    bannerUrl: editBannerUrl.trim(),
    price: parseFloat(whopData.price) || 0.0,
    currency: whopData.currency || "USD",
    is_recurring: whopData.is_recurring || 0,
    billing_period: whopData.billing_period || "",
    features: validFeats.map((f) => ({
      title: f.title.trim(),
      subtitle: f.subtitle.trim(),
      image_url: f.imageUrl,
    })),
  };

  try {
    const res = await fetch("https://app.byxbot.com/php/update_whop.php", {
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
      setError("Chyba serveru.");
      return;
    }
    if (!res.ok || json.status !== "success") {
      setError(json.message || "Nepovedlo se uložit.");
      return;
    }

    showNotification({ type: "success", message: "Whop úspěšně uložen." });

    // Uložíme do stavu a re‐fetch whopData
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
      setWhopData(refreshJson.data);
      setEditName(refreshJson.data.name);
      setEditDescription(refreshJson.data.description);
      setEditBannerUrl(refreshJson.data.banner_url || "");
      const newFeatArr = refreshJson.data.features.map((f, idx) => ({
        id: idx + 1,
        title: f.title,
        subtitle: f.subtitle,
        imageUrl: f.image_url,
        isUploading: false,
        error: "",
      }));
      setEditFeatures(newFeatArr);
      setError("");
      setSlugError("");
    }
  } catch (err) {
    console.error(err);
    setError("Síťová chyba.");
    showNotification({
      type: "error",
      message: "Síťová chyba při ukládání Whopu.",
    });
  }
}
