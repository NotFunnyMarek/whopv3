// src/pages/WhopDashboard/handleRequestWaitlist.js

/**
 * Send a waitlist request for a given Whop, including answers.
 *
 * @param {number} whopId       ID of the Whop.
 * @param {string[]} answers    Array of user‐entered answers to the waitlist questions.
 * @returns {Promise<object>}   Parsed JSON response from the server.
 * @throws {Error}              If the server responds with an error or non‐JSON.
 */
export default async function handleRequestWaitlist(whopId, answers, showNotification, navigate) {
  // Build the request payload – send "answers" array directly
  const payload = {
    whop_id: whopId,
    answers: answers,
  };

  // Send to the PHP endpoint
  const res = await fetch(
    "https://app.byxbot.com/php/request_waitlist.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  // Read the response text
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Server did not return valid JSON.");
  }

  if (res.status === 401) {
    if (showNotification) {
      showNotification({ type: "error", message: "Please log in to continue." });
    }
    if (navigate) navigate("/login");
    throw new Error("Unauthorized");
  }

  // Handle conflict (already requested) or explicit error
  if (res.status === 409 || json.status === "error") {
    throw new Error(json.message || "Conflict during waitlist request.");
  }

  // Handle any other non-OK status
  if (!res.ok) {
    throw new Error(json.message || `HTTP error ${res.status}`);
  }

  // Return the parsed JSON on success
  return json;
}
