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
  if (!trimmed) {
    setSlugError("Slug nesmí být prázdný.");
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    setSlugError("Pouze písmena, čísla, pomlčky, podtržítka.");
    return;
  }
  try {
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
      setSlugError("Chyba při parsování.");
      return;
    }
    if (!res.ok || json.status !== "success") {
      setSlugError(json.message || "Nepovedlo se.");
      return;
    }
    showNotification({ type: "success", message: "Slug úspěšně změněn." });
    navigate(`/c/${trimmed}`);
  } catch (err) {
    console.error(err);
    setSlugError("Síťová chyba.");
  }
}
