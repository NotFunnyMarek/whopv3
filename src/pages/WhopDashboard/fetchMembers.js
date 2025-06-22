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
    // Expect json.members to be an array of members with type 'paid' or 'free'
    if (json.status === "success" || json.members) {
      setMembershipsList(json.members || []);
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (err) {
    setMembersError("Error loading Whop members: " + err.message);
  } finally {
    setMembersLoading(false);
  }
}
