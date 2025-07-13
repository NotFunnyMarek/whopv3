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
    setLinks(json.data);
  } catch (err) {
    setError("Unable to load affiliates: " + err.message);
  } finally {
    setLoading(false);
  }
}
