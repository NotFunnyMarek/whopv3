// src/pages/WhopDashboard/fetchCampaigns.js

export default async function fetchCampaigns(
  whopId,
  setCampaigns,
  setCampaignsLoading,
  setCampaignsError
) {
  setCampaignsLoading(true);
  setCampaignsError("");
  try {
    const res = await fetch(
      `https://app.byxbot.com/php/campaign.php?whop_id=${whopId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setCampaigns(data);
  } catch (err) {
    setCampaignsError("Unable to load campaigns: " + err.message);
  } finally {
    setCampaignsLoading(false);
  }
}
