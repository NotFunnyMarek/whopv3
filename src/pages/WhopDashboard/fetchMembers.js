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
      `https://app.byxbot.com/php/get_whop_members.php?whop_id=${whopId}`,
      { method: "GET", credentials: "include" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setMembershipsList(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Chyba při načítání členů Whopu:", err);
    setMembersError("Nepodařilo se načíst členy Whopu.");
    setMembershipsList([]);
  } finally {
    setMembersLoading(false);
  }
}
