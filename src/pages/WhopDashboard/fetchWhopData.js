// src/pages/WhopDashboard/fetchWhopData.js

export default async function fetchWhopData(
  slugToFetch,
  setLoading,
  setError,
  setWhopData,
  setEditName,
  setEditDescription,
  setEditBannerUrl,
  setNewSlugValue,
  setEditFeatures,
  fetchCampaigns,        // bound verze
  setWaitlistEnabled,    // nově
  setWaitlistQuestions   // nově
) {
  setLoading(true);
  setError("");

  try {
    const res = await fetch(
      `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(slugToFetch)}`,
      { method: "GET", credentials: "include" }
    );
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      setError("Chyba: neplatný JSON.");
      setLoading(false);
      return;
    }
    if (!res.ok || json.status !== "success") {
      setError(json.message || "Nepodařilo se načíst Whop.");
      setLoading(false);
      return;
    }

    const data = json.data;
    setWhopData(data);

    // Pokud je owner, připravíme editovací stavy:
    if (data.is_owner) {
      setEditName(data.name);
      setEditDescription(data.description);
      setEditBannerUrl(data.banner_url || "");
      setNewSlugValue(data.slug);

      setEditFeatures(
        data.features.map((f, idx) => ({
          id: idx + 1,
          title: f.title,
          subtitle: f.subtitle,
          imageUrl: f.image_url,
          isUploading: false,
          error: "",
        }))
      );

      // ** Waitlist stavy **
      setWaitlistEnabled(Boolean(data.waitlist_enabled));
      setWaitlistQuestions(
        Array.isArray(data.waitlist_questions) && data.waitlist_questions.length
          ? data.waitlist_questions
          : ["", "", "", "", ""]
      );

      await fetchCampaigns(data.id);
    }

    // Pokud je member (ale ne owner), načteme kampaně:
    if (data.is_member && !data.is_owner) {
      await fetchCampaigns(data.id);
    }
  } catch (err) {
    setError("Síťová chyba: " + err.message);
  } finally {
    setLoading(false);
  }
}
