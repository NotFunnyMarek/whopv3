// src/pages/WhopDashboard/handleCancelMember.js

export default async function handleCancelMember(
  memberUserId,
  whopData,
  showConfirm,
  showNotification,
  fetchMembers
) {
  try {
    // Ask for confirmation before cancelling
    await showConfirm("Are you sure you want to cancel this subscription?");
  } catch {
    // User declined confirmation
    return;
  }

  try {
    const payload = { whop_id: whopData.id, user_id: memberUserId };
    const res = await fetch("https://app.byxbot.com/php/cancel_membership.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      // Show error notification if cancellation failed
      showNotification({
        type: "error",
        message: json.message || "Failed to cancel the subscription.",
      });
    } else {
      // Success!
      showNotification({ type: "success", message: "Subscription cancelled." });
      // Refresh the members list
      await fetchMembers(
        whopData.id,
        () => {}, // setMembersLoading
        () => {}, // setMembersError
        () => {}  // setMembershipsList
      );
    }
  } catch (err) {
    console.error("Error cancelling membership:", err);
    showNotification({ type: "error", message: "Error cancelling membership." });
  }
}
