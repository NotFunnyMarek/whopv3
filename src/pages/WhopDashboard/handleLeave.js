// src/pages/WhopDashboard/handleLeave.js

export default async function handleLeave(
  whopData,
  showConfirm,
  setMemberLoading,
  showNotification,
  fetchCampaigns,
  setWhopData,
  navigate
) {
  if (!whopData) return;

  // potvrzení
  try {
    await showConfirm("Chcete okamžitě opustit tento Whop a ztratit přístup?");
  } catch {
    return;
  }

  setMemberLoading(true);

  // pokud price > 0 → placené
  if (whopData.price && parseFloat(whopData.price) > 0) {
    try {
      const res = await fetch(
        "https://app.byxbot.com/php/cancel_membership.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ whop_id: whopData.id }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Nepodařilo se zrušit předplatné.");
      }
      showNotification({ type: "success", message: json.message });
    } catch (err) {
      console.error("Chyba při cancel_membership:", err);
      showNotification({ type: "error", message: err.message });
    } finally {
      // refresh dat
      const slug = whopData.slug;
      const ref = await fetch(
        `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(slug)}`,
        { credentials: "include" }
      );
      const j = await ref.json();
      if (ref.ok && j.status === "success") setWhopData(j.data);
      setMemberLoading(false);
    }
    return;
  }

  // free → leave_whop
  try {
    const res = await fetch(
      "https://app.byxbot.com/php/leave_whop.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ whop_id: whopData.id }),
      }
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Nepodařilo se opustit.");
    }
    showNotification({ type: "success", message: json.message });
  } catch (err) {
    console.error("Chyba při leave_whop:", err);
    showNotification({ type: "error", message: err.message });
  } finally {
    // refresh dat
    const slug = whopData.slug;
    const ref = await fetch(
      `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(slug)}`,
      { credentials: "include" }
    );
    const j = await ref.json();
    if (ref.ok && j.status === "success") setWhopData(j.data);
    setMemberLoading(false);
  }
}
