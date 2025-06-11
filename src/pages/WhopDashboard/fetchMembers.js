// src/pages/WhopDashboard/fetchMembers.js

export default async function fetchMembers(
  whopId,
  setMembersLoading,
  setMembersError,
  setMembershipsList
) {
  setMembersLoading(true);
  setMembersError("");
  try {
    const res = await fetch(
      `https://app.byxbot.com/php/get_dashboard_data.php?whop_id=${encodeURIComponent(
        whopId
      )}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    // Očekáme, že json.members je pole členů s type 'paid' nebo 'free'
    if (json.status === "success" || json.members) {
      setMembershipsList(json.members || []);
    } else {
      throw new Error("Neplatná odpověď od serveru");
    }
  } catch (err) {
    setMembersError("Chyba při načítání členů Whopu: " + err.message);
  } finally {
    setMembersLoading(false);
  }
}
