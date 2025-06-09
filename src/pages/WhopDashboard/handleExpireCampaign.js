// src/pages/WhopDashboard/handleExpireCampaign.js

export default async function handleExpireCampaign(
  campaignId,
  showConfirm,
  showNotification,
  whopData,
  fetchCampaigns
) {
  try {
    await showConfirm("Označit kampaň jako EXPIRY?");
  } catch {
    return;
  }
  try {
    const res = await fetch("https://app.byxbot.com/php/expire_campaign.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign_id: campaignId }),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotification({
        type: "error",
        message: data.error || "Nepodařilo se expirovat kampaň",
      });
      return;
    }
    if (whopData) {
      await fetchCampaigns(
        whopData.id,
        () => {},
        () => {},
        () => {}
      );
    }
    showNotification({ type: "success", message: "Kampaň označena jako EXPIRED." });
  } catch (err) {
    console.error(err);
    showNotification({ type: "error", message: "Chyba při expirování kampaně." });
  }
}
