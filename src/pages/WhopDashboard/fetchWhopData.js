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
  fetchCampaigns // předaná bound verze
) {
  setLoading(true);
  setError("");
  try {
    const res = await fetch(
      `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
        slugToFetch
      )}`,
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

    setWhopData(json.data);

    // Pokud je owner, připravíme editovací stavy:
    if (json.data.is_owner) {
      setEditName(json.data.name);
      setEditDescription(json.data.description);
      setEditBannerUrl(json.data.banner_url || "");
      setNewSlugValue(json.data.slug);
      setEditFeatures(
        json.data.features.map((f, idx) => ({
          id: idx + 1,
          title: f.title,
          subtitle: f.subtitle,
          imageUrl: f.image_url,
          isUploading: false,
          error: "",
        }))
      );
      // Zavoláme bound verzi s id whopu:
      await fetchCampaigns(json.data.id);
    }

    // Pokud je member (ale ne owner), načteme kampaně:
    if (json.data.is_member && !json.data.is_owner) {
      await fetchCampaigns(json.data.id);
    }
  } catch (err) {
    setError("Síťová chyba: " + err.message);
  } finally {
    setLoading(false);
  }
}
