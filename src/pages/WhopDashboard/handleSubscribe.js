// src/pages/WhopDashboard/handleSubscribe.js

/**
 * Pokud je whopData.price ≤ 0, zavolá handleJoinFree, jinak spustí placený flow.
 *
 * @param {object} whopData              - data o Whopu (obsahují id, price, currency, is_recurring, billing_period, slug)
 * @param {function} showConfirm         - funkce pro zobrazení confirm modalu (vrací promise)
 * @param {function} setOverlayVisible   - setter pro zobrazení fullscreen overlayu
 * @param {function} setOverlayFading    - setter pro fade‐out efekt overlayu
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

  // Pokud je zdarma (price ≤ 0), přesměrujeme do free‐flow
  if (!whopData.price || parseFloat(whopData.price) <= 0) {
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

  // Placený flow: nejprve potvrzení od uživatele
  const price = parseFloat(whopData.price).toFixed(2);
  const period = whopData.is_recurring
    ? `opakuje se každých ${whopData.billing_period}`
    : "jednorázově";
  const confirmMessage = `Tento Whop stojí ${whopData.currency}${price} ${period}.\nChcete pokračovat?`;

  try {
    await showConfirm(confirmMessage);
  } catch {
    // Uživatel zrušil → ukončíme
    return;
  }

  // Zobrazíme fullscreen overlay
  setOverlayVisible(true);
  setOverlayFading(false);
  setMemberLoading(true);
  const resizeListener = () => setOverlayFading(false);
  window.addEventListener("resize", resizeListener);

  try {
    // Pošleme POST požadavek na PHP
    const payload = { whop_id: whopData.id };
    const res = await fetch("https://app.byxbot.com/php/subscribe_whop.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // Nejprve si vyzvedneme čisté textové tělo (pro případ, že to nebude validní JSON)
    const rawText = await res.text();
    console.log("🔸 [handleSubscribe] HTTP status:", res.status);
    console.log("🔸 [handleSubscribe] Raw response text:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      throw new Error(
        `Server nevrátil platné JSON (HTTP ${res.status}):\n${rawText}`
      );
    }

    if (!res.ok || data.status !== "success") {
      // API vrátilo chybu (např. 400 nebo 401, nebo {status:"error"})
      const msg = data.message || `Chyba HTTP ${res.status}`;
      showNotification({ type: "error", message: msg });
    } else {
      // Úspěšné přihlášení → refresh whopData + kampaně
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
        showNotification({ type: "success", message: data.message || "Úspěšně přihlášeno." });
      }
    }
  } catch (err) {
    console.error("⚠️ [handleSubscribe] Chyba při subscribe:", err);
    showNotification({ type: "error", message: err.message || "Síťová chyba při přihlašování." });
  } finally {
    // Fade‐out overlay po 2 sekundách
    setTimeout(() => setOverlayFading(true), 2000);
    setMemberLoading(false);
    window.removeEventListener("resize", resizeListener);
  }
}
