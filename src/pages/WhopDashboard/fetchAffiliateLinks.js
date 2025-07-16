// src/pages/WhopDashboard/fetchAffiliateLinks.js
export default async function fetchAffiliateLinks(
  whopId,
  setLoading,
  setError,
  setLinks
) {
  setLoading(true);
  setError("");
  try {
    const res = await fetch(
      `https://app.byxbot.com/php/get_affiliate_links.php?whop_id=${whopId}`,
      { method: "GET", credentials: "include" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== "success") throw new Error(json.message || "Error");
    const parsed = json.data.map((row) => ({
      ...row,
      payout_percent: parseFloat(row.payout_percent),
      payout_recurring: Number(row.payout_recurring) === 1 ? 1 : 0,
    }));
    setLinks(parsed);
  } catch (err) {
    setError("Unable to load affiliates: " + err.message);
  } finally {
    setLoading(false);
  }
}
