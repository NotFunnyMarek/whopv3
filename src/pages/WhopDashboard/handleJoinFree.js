// src/pages/WhopDashboard/handleJoinFree.js

/**
 * Handles joining a free Whop (when price ≤ 0).
 *
 * @param {object} whopData              - Whop details (includes id, slug, etc.)
 * @param {function} setOverlayVisible   - setter to show the full‐screen overlay
 * @param {function} setOverlayFading    - setter to trigger the fade‐out effect of the overlay
 * @param {function} setMemberLoading    - setter for the "member loading" state
 * @param {{width:number, height:number}} windowSize - object with the viewport dimensions
 * @param {function} navigate            - react‐router navigation function
 * @param {function} showNotification    - function to display a toast notification
 * @param {function} fetchCampaigns      - bound function to fetch campaigns (takes whopId)
 * @param {function} setWhopData         - setter for updated whopData
 */
export default async function handleJoinFree(
  whopData,
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

  // Show the joining overlay
  setOverlayVisible(true);
  setOverlayFading(false);
  setMemberLoading(true);

  // Dummy resize listener to keep overlay state up-to-date
  const resizeListener = () => setOverlayFading(false);
  window.addEventListener("resize", resizeListener);

  try {
    // Send join request
    const res = await fetch("https://app.byxbot.com/php/join_whop.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ whop_id: whopData.id }),
    });
    const json = await res.json();

    if (res.status === 401) {
      showNotification({ type: "error", message: "Please log in to continue." });
      navigate("/login");
    } else if (!res.ok) {
      // If joining failed, show error notification
      showNotification({
        type: "error",
        message: json.message || "Failed to join.",
      });
    } else {
      // On success, refresh whopData and campaigns
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
        showNotification({
          type: "success",
          message: "Successfully joined for free.",
        });
      }
    }
  } catch (err) {
    console.error("Error joining free Whop:", err);
    showNotification({
      type: "error",
      message: "Network error while joining for free.",
    });
  } finally {
    // Trigger fade-out after 2 seconds, hide loading spinner
    setTimeout(() => {
      setOverlayFading(true);
    }, 2000);
    setMemberLoading(false);
    window.removeEventListener("resize", resizeListener);
  }
}
