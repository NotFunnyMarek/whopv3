// src/pages/WhopDashboard/fetchWhopData.js

export default async function fetchWhopData(
  slugToFetch,
  setLoading,
  setError,
  setWhopData,
  setEditName,
  setEditDescription,
  setEditBannerUrl,
  setNewSlugValue,
  setEditFeatures,
  fetchCampaigns,        // bound version
  setWaitlistEnabled,    // newly added
  setWaitlistQuestions,  // newly added
  setEditLongDescription,
  setEditAboutBio,
  setEditWebsiteUrl,
  setEditSocials,
  setEditWhoFor,
  setEditFaq,
  setEditLandingTexts,
  setEditModules
) {
  setLoading(true);
  setError("");

  try {
    const res = await fetch(
      `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(slugToFetch)}`,
      { method: "GET", credentials: "include" }
    );
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      setError("Error: invalid JSON.");
      setLoading(false);
      return;
    }
    if (!res.ok || json.status !== "success") {
      setError(json.message || "Failed to load Whop.");
      setLoading(false);
      return;
    }

    const data = json.data;
    setWhopData(data);

    // If owner, prepare editing state:
    if (data.is_owner) {
      setEditName(data.name);
      setEditDescription(data.description);
      setEditBannerUrl(data.banner_url || "");
      setNewSlugValue(data.slug);

      setEditFeatures(
        data.features.map((f, idx) => ({
          id: idx + 1,
          title: f.title,
          subtitle: f.subtitle,
          imageUrl: f.image_url,
          isUploading: false,
          error: "",
        }))
      );

      setEditLongDescription(data.long_description || "");
      setEditAboutBio(data.about_bio || "");
      setEditWebsiteUrl(data.website_url || "");
      setEditSocials({
        instagram: data.socials?.instagram || "",
        discord: data.socials?.discord || "",
      });
      setEditWhoFor(
        Array.isArray(data.who_for) && data.who_for.length
          ? data.who_for
          : [{ title: "", description: "" }]
      );
      setEditFaq(
        Array.isArray(data.faq) && data.faq.length
          ? data.faq
          : [{ question: "", answer: "" }]
      );
      setEditLandingTexts(data.landing_texts || {
        reviews_title: "",
        features_title: "",
        about_title: "",
        faq_title: "",
      });
      setEditModules(
        data.modules || {
          chat: false,
          earn: false,
          discord: false,
          course: false,
          text: true,
        }
      );

      // ** Waitlist state **
      setWaitlistEnabled(Boolean(data.waitlist_enabled));
      setWaitlistQuestions(
        Array.isArray(data.waitlist_questions) && data.waitlist_questions.length
          ? data.waitlist_questions
          : ["", "", "", "", ""]
      );

      await fetchCampaigns(data.id);
    }

    // If member (but not owner), load campaigns:
    if (data.is_member && !data.is_owner) {
      await fetchCampaigns(data.id);
    }
  } catch (err) {
    setError("Network error: " + err.message);
  } finally {
    setLoading(false);
  }
}
