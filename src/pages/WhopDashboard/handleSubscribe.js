// src/pages/WhopDashboard/handleSubscribe.js

/**
 * If whopData.price ≤ 0, delegates to the free join flow; otherwise runs the paid subscription flow.
 *
 * @param {object} whopData              - Whop details (contains id, price, currency, is_recurring, billing_period, slug)
 * @param {function} showConfirm         - function to display a confirm modal (returns a Promise)
 * @param {function} setOverlayVisible   - setter to show the full-screen overlay
 * @param {function} setOverlayFading    - setter to trigger the fade-out effect of the overlay
 * @param {function} setMemberLoading    - setter for the "member loading" state
 * @param {{width:number, height:number}} windowSize - object with the window dimensions
 * @param {function} navigate            - react-router navigation function
 * @param {function} showNotification    - function to display a toast notification
 * @param {function} fetchCampaigns      - bound function that fetches campaigns (accepts whopId)
 * @param {function} setWhopData         - setter for updated whopData
 */
export default async function handleSubscribe(
  whopData,
  planId,
  showConfirm,
  setOverlayVisible,
  setOverlayFading,
  setMemberLoading,
  windowSize,
  navigate,
  showNotification,
  fetchCampaigns,
  setWhopData
) {
  if (!whopData) return;

  let plan = null;
  if (planId && Array.isArray(whopData.pricing_plans)) {
    plan = whopData.pricing_plans.find(p => p.id === planId) || null;
  }

  const priceVal = plan ? plan.price : whopData.price;

  // If free (price ≤ 0), redirect to the free join flow
  if (!priceVal || parseFloat(priceVal) <= 0) {
    const { default: joinFree } = await import("./handleJoinFree");
    await joinFree(
      whopData,
      setOverlayVisible,
      setOverlayFading,
      setMemberLoading,
      windowSize,
      navigate,
      showNotification,
      fetchCampaigns,
      setWhopData
    );
    return;
  }

  // Paid flow: first, get user confirmation
  const price = parseFloat(priceVal).toFixed(2);
  const billingPeriod = plan ? plan.billing_period : whopData.billing_period;
  const currency = plan ? plan.currency || whopData.currency : whopData.currency;
  const period = whopData.is_recurring
    ? `recurs every ${billingPeriod}`
    : "one-time";
  const confirmMessage = `This Whop costs ${currency}${price} ${period}.\nDo you want to continue?`;

  try {
    await showConfirm(confirmMessage);
  } catch {
    // User cancelled
    return;
  }

  // Show full-screen overlay
  setOverlayVisible(true);
  setOverlayFading(false);
  setMemberLoading(true);
  const resizeListener = () => setOverlayFading(false);
  window.addEventListener("resize", resizeListener);

  try {
    // Send subscription request to PHP
    const payload = { whop_id: whopData.id };
    if (planId) payload.plan_id = planId;
    const res = await fetch("https://app.byxbot.com/php/subscribe_whop.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // First fetch the raw text in case it's not valid JSON
    const rawText = await res.text();
    console.log("🔸 [handleSubscribe] HTTP status:", res.status);
    console.log("🔸 [handleSubscribe] Raw response text:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      throw new Error(
        `Server did not return valid JSON (HTTP ${res.status}):\n${rawText}`
      );
    }

    if (res.status === 401) {
      showNotification({ type: "error", message: "Please log in to continue." });
      navigate("/login");
    } else if (!res.ok || data.status !== "success") {
      // API returned an error (e.g. 400, 403, etc)
      const msg = data.message || `HTTP error ${res.status}`;
      showNotification({ type: "error", message: msg });
    } else {
      // Successful subscription → refresh whopData & campaigns
      const refresh = await fetch(
        `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
          whopData.slug
        )}`,
        { method: "GET", credentials: "include" }
      );
      const refreshed = await refresh.json();
      if (refresh.ok && refreshed.status === "success") {
        setWhopData(refreshed.data);
        await fetchCampaigns(refreshed.data.id);
        showNotification({ type: "success", message: data.message || "Subscribed successfully." });
      }
    }
  } catch (err) {
    console.error("⚠️ [handleSubscribe] Error during subscribe:", err);
    showNotification({ type: "error", message: err.message || "Network error during subscription." });
  } finally {
    // Fade-out the overlay after 2 seconds
    setTimeout(() => setOverlayFading(true), 2000);
    setMemberLoading(false);
    window.removeEventListener("resize", resizeListener);
  }
}
