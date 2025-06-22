// src/pages/WhopDashboard/handleExpireCampaign.js

export default async function handleExpireCampaign(
  campaignId,
  showConfirm,
  showNotification,
  whopData,
  fetchCampaigns
) {
  try {
    // Ask for confirmation before marking as expired and refunding remaining budget
    await showConfirm(
      "Are you sure you want to mark this campaign as EXPIRED and refund the remaining budget?"
    );
  } catch {
    // User cancelled the confirmation dialog
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
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    // On success, refresh the campaigns list if possible
    if (whopData && typeof fetchCampaigns === "function") {
      await fetchCampaigns(
        whopData.id,
        () => {}, // setCampaigns
        () => {}, // setCampaignsLoading
        () => {}  // setCampaignsError
      );
    }

    showNotification({ type: "success", message: "Campaign marked as EXPIRED." });
  } catch (err) {
    console.error("Error expiring campaign:", err);
    showNotification({
      type: "error",
      message: "Error expiring campaign: " + err.message,
    });
  }
}
