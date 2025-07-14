// src/pages/WhopDashboard/handleUpdateAffiliateLink.js
export default async function handleUpdateAffiliateLink(
  linkId,
  payout,
  del,
  showNotification,
  fetchLinks,
  whopId
) {
  try {
    const res = await fetch("https://app.byxbot.com/php/update_affiliate_link.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_id: linkId,
        payout_percent: payout,
        delete: del,
      }),
    });
    const json = await res.json();
    if (!res.ok || json.status !== "success") {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
    showNotification("Saved");
    await fetchLinks(whopId);
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}
