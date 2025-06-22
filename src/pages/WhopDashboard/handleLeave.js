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

  // confirmation
  try {
    await showConfirm("Do you want to immediately leave this Whop and lose access?");
  } catch {
    return;
  }

  setMemberLoading(true);

  // if price > 0 → paid Whop
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
        throw new Error(json.message || "Failed to cancel membership.");
      }
      showNotification({ type: "success", message: json.message });
    } catch (err) {
      console.error("Error in cancel_membership:", err);
      showNotification({ type: "error", message: err.message });
    } finally {
      // refresh data
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

  // free Whop → leave_whop
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
      throw new Error(json.message || "Failed to leave.");
    }
    showNotification({ type: "success", message: json.message });
  } catch (err) {
    console.error("Error in leave_whop:", err);
    showNotification({ type: "error", message: err.message });
  } finally {
    // refresh data
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
