// src/pages/WhopDashboard/handleDeleteWhop.js

export default async function handleDeleteWhop(
  whopData,
  showConfirm,
  showNotification,
  navigate,
  setError
) {
  try {
    await showConfirm("Opravdu smazat Whop?");
  } catch {
    return;
  }

  try {
    const payload = { slug: whopData.slug };
    const res = await fetch("https://app.byxbot.com/php/delete_whop.php", {
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
      setError("Chyba mazání.");
      return;
    }
    if (!res.ok || json.status !== "success") {
      setError(json.message || "Nepodařilo se smazat.");
      showNotification({
        type: "error",
        message: json.message || "Nepodařilo se smazat.",
      });
      return;
    }
    showNotification({ type: "success", message: "Whop smazán." });
    navigate("/onboarding");
  } catch (err) {
    console.error(err);
    setError("Síťová chyba.");
    showNotification({
      type: "error",
      message: "Síťová chyba při mazání Whopu.",
    });
  }
}
