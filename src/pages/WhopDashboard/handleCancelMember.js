// src/pages/WhopDashboard/handleCancelMember.js

export default async function handleCancelMember(
  memberUserId,
  whopData,
  showConfirm,
  showNotification,
  fetchMembers
) {
  try {
    await showConfirm("Opravdu zrušit toto předplatné?");
  } catch {
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
      showNotification({
        type: "error",
        message: json.message || "Nepodařilo se zrušit předplatné.",
      });
    } else {
      showNotification({ type: "success", message: "Předplatné zrušeno." });
      await fetchMembers(
        whopData.id,
        () => {},
        () => {},
        () => {}
      );
    }
  } catch (err) {
    console.error("Chyba při rušení členství:", err);
    showNotification({ type: "error", message: "Chyba při rušení členství." });
  }
}
