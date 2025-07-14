// src/pages/WhopDashboard/fetchAffiliateCode.js
export default async function fetchAffiliateCode(
  whopId,
  setData,
  setError
) {
  setError("");
  try {
    const res = await fetch("https://app.byxbot.com/php/create_affiliate_link.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whop_id: whopId }),
    });
    const json = await res.json();
    if (!res.ok || json.status !== "success") {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
    setData(json);
  } catch (err) {
    setError("Failed to get link: " + err.message);
  }
}
