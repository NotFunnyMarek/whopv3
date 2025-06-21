// src/pages/WhopDashboard/handleRequestWaitlist.js

/**
 * Send a waitlist request for a given Whop, including answers.
 *
 * @param {number} whopId       ID of the Whop.
 * @param {string[]} answers    Array of user‐entered answers to the waitlist questions.
 * @returns {Promise<object>}   Parsed JSON response from the server.
 * @throws {Error}              If the server responds with an error or non‐JSON.
 */
export default async function handleRequestWaitlist(whopId, answers) {
  // 1) Build request payload – posíláme pole "answers", ne "answers_json"
  const payload = {
    whop_id: whopId,
    answers: answers,
  };

  // 2) Send to the PHP endpoint
  const res = await fetch(
    "https://app.byxbot.com/php/request_waitlist.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  // 3) Read the response text
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Server nevrátil platný JSON.");
  }

  // 4) Handle conflict (already requested) or explicit error
  if (res.status === 409 || json.status === "error") {
    throw new Error(json.message || "Konflikt při žádosti.");
  }

  // 5) Handle any other non‑OK status
  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }

  // 6) Return the parsed JSON on success
  return json;
}
