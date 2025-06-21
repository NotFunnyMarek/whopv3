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
  waitlistEnabled,         // nový parametr
  waitlistQuestions        // nový parametr
) {
  // 1) Validace názvu a popisu
  if (!editName.trim() || !editDescription.trim()) {
    setError("Název i popis nesmí být prázdné.");
    return;
  }
  // 2) Validace počtu features
  const validFeats = editFeatures.filter((f) => f.title.trim() && f.imageUrl);
  if (validFeats.length < 2) {
    setError("Minimálně 2 platné features.");
    return;
  }

  // 3) Sestavení payloadu
  const payload = {
    slug:               whopData.slug,
    name:               editName.trim(),
    description:        editDescription.trim(),
    bannerUrl:          editBannerUrl.trim(),
    price:              parseFloat(whopData.price) || 0.0,
    currency:           whopData.currency || "USD",
    is_recurring:       whopData.is_recurring || 0,
    billing_period:     whopData.billing_period || "",
    features:           validFeats.map((f) => ({
                          title:     f.title.trim(),
                          subtitle:  f.subtitle.trim(),
                          image_url: f.imageUrl,
                        })),
    // přidáno pro waitlist
    waitlist_enabled:   waitlistEnabled ? 1 : 0,
    waitlist_questions: waitlistEnabled
                           ? waitlistQuestions.filter((q) => q.trim() !== "")
                           : [],
  };

  try {
    // 4) Odeslání data na server
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
      setError("Chyba serveru.");
      return;
    }

    if (!res.ok || json.status !== "success") {
      setError(json.message || "Nepovedlo se uložit.");
      return;
    }

    showNotification({ type: "success", message: "Whop úspěšně uložen." });

    // 5) Znovunačtení aktuálních dat
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

      // znovu připravíme features
      const newFeatArr = data.features.map((f, idx) => ({
        id:          idx + 1,
        title:       f.title,
        subtitle:    f.subtitle,
        imageUrl:    f.image_url,
        isUploading: false,
        error:       "",
      }));
      setEditFeatures(newFeatArr);
      setError("");
      setSlugError("");
      // waitlist_enabled a waitlist_questions se do stavu načtou přes parent
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
