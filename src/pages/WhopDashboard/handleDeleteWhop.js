// src/pages/WhopDashboard/handleDeleteWhop.js

export default async function handleDeleteWhop(
  whopData,
  showConfirm,
  showNotification,
  navigate,
  setError
) {
  try {
    // Ask for confirmation before deleting the Whop
    await showConfirm("Are you sure you want to delete this Whop?");
  } catch {
    // User canceled the confirmation dialog
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
      setError("Error deleting.");
      return;
    }
    if (!res.ok || json.status !== "success") {
      const msg = json.message || "Failed to delete.";
      setError(msg);
      showNotification({
        type: "error",
        message: msg,
      });
      return;
    }
    // Success notification and redirect to onboarding
    showNotification({ type: "success", message: "Whop deleted." });
    navigate("/onboarding");
  } catch (err) {
    console.error("Network error during Whop deletion:", err);
    setError("Network error.");
    showNotification({
      type: "error",
      message: "Network error while deleting Whop.",
    });
  }
}
