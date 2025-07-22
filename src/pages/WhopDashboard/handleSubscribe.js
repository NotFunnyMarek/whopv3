// src/pages/WhopDashboard/handleSubscribe.js

/**
 * If whopData.price ≤ 0, delegates to the free join flow; otherwise redirects
 * the user to the payment page.
 *
 * @param {object} whopData              - Whop details (contains id, price, currency, is_recurring, billing_period, slug)
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

  // If free (price ≤ 0), join directly
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

  // Paid – redirect to the payment page
  const url = planId
    ? `/pay/${whopData.slug}?plan=${planId}`
    : `/pay/${whopData.slug}`;
  navigate(url);
}
