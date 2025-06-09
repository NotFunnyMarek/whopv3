// src/pages/WhopDashboard/handleJoinFree.js

/**
 * Zpracuje join zdarma (pokud price ≤ 0).
 *
 * @param {object} whopData              - data o Whopu (obsahují id, slug atp.)
 * @param {function} setOverlayVisible   - setter pro zobrazení fullscreen overlayu
 * @param {function} setOverlayFading    - setter pro fade‐out efekt overlayu
 * @param {function} setMemberLoading    - setter pro stav načítání „člena“
 * @param {{width:number, height:number}} windowSize - objekt s rozměry obrazovky
 * @param {function} navigate            - react‐router funkce pro navigaci
 * @param {function} showNotification    - funkce pro zobrazení toast notifikace
 * @param {function} fetchCampaigns      - bound verze funkce, která načte kampaně (bere whopId)
 * @param {function} setWhopData         - setter pro nové whopData
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

  setOverlayVisible(true);
  setOverlayFading(false);
  setMemberLoading(true);

  const resizeListener = () =>
    setOverlayFading(false) /* dummy */; // nepotřebujeme víc
  window.addEventListener("resize", resizeListener);

  try {
    const res = await fetch("https://app.byxbot.com/php/join_whop.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ whop_id: whopData.id }),
    });
    const json = await res.json();

    if (!res.ok) {
      showNotification({
        type: "error",
        message: json.message || "Nepodařilo se připojit.",
      });
    } else {
      // On success: re‐fetch whopData & kampaně
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
          message: "Úspěšně připojeno zdarma.",
        });
      }
    }
  } catch (err) {
    console.error("Chyba při join free:", err);
    showNotification({
      type: "error",
      message: "Síťová chyba při připojování zdarma.",
    });
  } finally {
    setTimeout(() => {
      setOverlayFading(true);
    }, 2000);
    setMemberLoading(false);
    window.removeEventListener("resize", resizeListener);
  }
}
