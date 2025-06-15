// src/pages/WhopDashboard/handleExpireCampaign.js

export default async function handleExpireCampaign(
  campaignId,
  showConfirm,
  showNotification,
  whopData,
  fetchCampaigns
) {
  try {
    await showConfirm("Opravdu označit kampaň jako EXPIRED a refundovat zbývající budget?");
  } catch {
    return; // uživatel zrušil
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
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    // Po úspěšném označení refreshneme seznam kampaní
    if (whopData && typeof fetchCampaigns === "function") {
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
    showNotification({
      type: "error",
      message: "Chyba při expirování kampaně: " + err.message,
    });
  }
}
