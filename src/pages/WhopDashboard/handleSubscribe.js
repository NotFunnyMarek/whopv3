// src/pages/WhopDashboard/handleSubscribe.js

/**
 * Pokud je whopData.price ≤ 0, zavolá handleJoinFree, jinak se pustí placený flow.
 *
 * @param {object} whopData              - data o Whopu (obsahují id, price, currency, is_recurring, atp.)
 * @param {function} showConfirm         - funkce pro zobrazení confirm modalu
 * @param {function} setOverlayVisible   - setter pro zobrazení fullscreen overlayu
 * @param {function} setOverlayFading    - setter pro fade‐out efekt overlaye
 * @param {function} setMemberLoading    - setter pro stav načítání „člena“
 * @param {{width:number, height:number}} windowSize - objekt s rozměry obrazovky
 * @param {function} navigate            - react‐router funkce pro navigaci
 * @param {function} showNotification    - funkce pro zobrazení toast notifikace
 * @param {function} fetchCampaigns      - bound verze funkce, která načte kampaně (bere whopId)
 * @param {function} setWhopData         - setter pro nové whopData
 */
export default async function handleSubscribe(
  whopData,
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

  // Pokud je zdarma (price ≤ 0)
  if (!whopData.price || parseFloat(whopData.price) <= 0) {
    // Přesměrujeme rovnou na free flow
    // Re‐exportujeme handleJoinFree jako "joinFree"
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

  // Placený flow: nejprve potvrzení
  const price = parseFloat(whopData.price).toFixed(2);
  const period = whopData.is_recurring
    ? `opakuje se každých ${whopData.billing_period}`
    : "jednorázově";
  const confirmMessage = `Tento Whop stojí ${whopData.currency}${price} ${period}.\nChcete pokračovat?`;

  try {
    await showConfirm(confirmMessage);
  } catch {
    // Uživatel zrušil → konec
    return;
  }

  // Zobrazíme fullscreen overlay
  setOverlayVisible(true);
  setOverlayFading(false);
  setMemberLoading(true);
  const resizeListener = () =>
    setOverlayFading(false) /* dummy */; // nepotřebujeme víc
  window.addEventListener("resize", resizeListener);

  try {
    const payload = { whop_id: whopData.id };
    const res = await fetch("https://app.byxbot.com/php/subscribe_whop.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      // Pokud API vrátí chybu
      showNotification({
        type: "error",
        message: json.message || "Nepodařilo se přihlásit.",
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
        showNotification({ type: "success", message: "Úspěšně přihlášeno." });
      }
    }
  } catch (err) {
    console.error("Chyba při subscribe:", err);
    showNotification({
      type: "error",
      message: "Síťová chyba při přihlašování.",
    });
  } finally {
    // Fade‐out overlay po 2 s
    setTimeout(() => {
      setOverlayFading(true);
    }, 2000);
    setMemberLoading(false);
    window.removeEventListener("resize", resizeListener);
  }
}
