// src/pages/WhopDashboard/handleLeave.js

export default async function handleLeave(
  whopData,
  showConfirm,
  setMemberLoading,
  showNotification,
  fetchCampaigns,
  setWhopData,
  navigate
) {
  if (!whopData) return;

  try {
    await showConfirm("Chcete okamžitě opustit tento Whop a ztratit přístup?");
  } catch {
    return;
  }

  setMemberLoading(true);

  // Pokud je placený (price > 0), cancel_membership
  if (whopData.price && parseFloat(whopData.price) > 0) {
    try {
      const payload = { whop_id: whopData.id };
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
        // Re‐fetch whopData (členství pryč)
        const refresh = await fetch(
          `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
            whopData.slug
          )}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const refreshed = await refresh.json();
        if (refresh.ok && refreshed.status === "success") {
          setWhopData(refreshed.data);
          setMemberLoading(false);
          showNotification({
            type: "success",
            message: "Úspěšně odebráno předplatné.",
          });
        }
      }
    } catch (err) {
      console.error("Chyba při cancel membership:", err);
      showNotification({
        type: "error",
        message: "Síťová chyba při rušení předplatného.",
      });
    } finally {
      setMemberLoading(false);
    }
    return;
  }

  // Jinak: free → leave_whop
  try {
    const res = await fetch("https://app.byxbot.com/php/leave_whop.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ whop_id: whopData.id }),
    });
    const json = await res.json();
    if (!res.ok) {
      showNotification({
        type: "error",
        message: json.message || "Nepodařilo se opustit.",
      });
    } else {
      // Re‐fetch whopData
      const refresh = await fetch(
        `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
          whopData.slug
        )}`,
        { method: "GET", credentials: "include" }
      );
      const refreshed = await refresh.json();
      if (refresh.ok && refreshed.status === "success") {
        setWhopData(refreshed.data);
        setMemberLoading(false);
        showNotification({ type: "success", message: "Úspěšně opuštěno." });
      }
    }
  } catch (err) {
    console.error("Chyba při leave free:", err);
    showNotification({
      type: "error",
      message: "Chyba při opuštění Whopu.",
    });
  } finally {
    setMemberLoading(false);
  }
}
