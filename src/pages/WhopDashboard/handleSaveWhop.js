// src/pages/WhopDashboard/handleSaveWhop.js

export default async function handleSaveWhop(
  whopData,
  editName,
  editDescription,
  editBannerUrl,
  editFeatures,
  editPricingPlans,
  showNotification,
  setError,
  setEditName,
  setEditDescription,
  setEditBannerUrl,
  setEditFeatures,
  setEditPricingPlans,
  setSlugError,
  fetchCampaigns,
  setWhopData,
  setEditLongDescription,
  setEditAboutBio,
  setEditWebsiteUrl,
  setEditSocials,
  setEditWhoFor,
  setEditFaq,
  setEditLandingTexts,
  setEditModules,
  setEditCourseSteps,
  setEditAffiliatePercent,
  setEditAffiliateRecurring,
  waitlistEnabled,         // new parameter
  waitlistQuestions,       // new parameter
  editLongDescription,
  editAboutBio,
  editWebsiteUrl,
  editSocials,
  editWhoFor,
  editFaq,
  editLandingTexts,
  editModules,
  editCourseSteps,
  editAffiliatePercent,
  editAffiliateRecurring
) {
  // 1) Validate name and description
  if (!editName.trim() || !editDescription.trim()) {
    setError("Name and description cannot be empty.");
    return;
  }
  // 2) Validate number of features
  const validFeatures = editFeatures.filter(f => f.title.trim() && f.imageUrl);
  if (validFeatures.length < 2) {
    setError("At least 2 valid features are required.");
    return;
  }

  // 3) Build payload
  const payload = {
    slug:               whopData.slug,
    name:               editName.trim(),
    description:        editDescription.trim(),
    bannerUrl:          editBannerUrl.trim(),
    price:              parseFloat(whopData.price) || 0.0,
    currency:           whopData.currency || "USD",
    is_recurring:       whopData.is_recurring || 0,
    billing_period:     whopData.billing_period || "",
    features:           validFeatures.map(f => ({
                          title:     f.title.trim(),
                          subtitle:  f.subtitle.trim(),
                          imageUrl:  f.imageUrl,
                        })),
    // added for waitlist
    waitlist_enabled:   waitlistEnabled ? 1 : 0,
    waitlist_questions: waitlistEnabled
                           ? waitlistQuestions.filter(q => q.trim() !== "")
                           : [],
    long_description:   editLongDescription.trim(),
    about_bio:          editAboutBio.trim(),
    website_url:        editWebsiteUrl.trim(),
    socials:            editSocials,
    who_for:            editWhoFor,
    faq:                editFaq,
    landing_texts:      editLandingTexts,
    modules:            editModules,
    pricing_plans:     editPricingPlans.map((p, idx) => ({
                          id: p.id,
                          plan_name: p.plan_name,
                          price: parseFloat(p.price) || 0,
                          currency: p.currency || whopData.currency,
                          billing_period: p.billing_period,
                          sort_order: idx,
                        })),
    affiliate_default_percent: parseFloat(editAffiliatePercent) || 0,
    affiliate_recurring: editAffiliateRecurring ? 1 : 0,
    course_steps:       editCourseSteps.map(s => ({
                          title: s.title.trim(),
                          content: s.content.trim(),
                          file_url: s.fileUrl || "",
                          file_type: s.fileType || "",
                        })),
  };

  try {
    // 4) Send to server
    const res = await fetch("https://app.byxbot.com/php/update_whop.php", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify(payload),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      setError("Server error.");
      return;
    }

    if (!res.ok || json.status !== "success") {
      setError(json.message || "Failed to save changes.");
      return;
    }

    showNotification({ type: "success", message: "Whop saved successfully." });

    // 5) Reload current data
    const refreshRes = await fetch(
      `https://app.byxbot.com/php/get_whop.php?slug=${encodeURIComponent(
        whopData.slug
      )}`,
      { method: "GET", credentials: "include" }
    );
    const refreshText = await refreshRes.text();
    let refreshJson;
    try {
      refreshJson = JSON.parse(refreshText);
    } catch {
      return;
    }
    if (refreshRes.ok && refreshJson.status === "success") {
      const data = refreshJson.data;
      setWhopData(data);
      setEditName(data.name);
      setEditDescription(data.description);
      setEditBannerUrl(data.banner_url || "");

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
          discord_access: false,
          course: false,
          text: true,
        }
      );
      setEditAffiliatePercent(
        data.affiliate_default_percent !== undefined
          ? parseFloat(data.affiliate_default_percent)
          : 30
      );
      setEditAffiliateRecurring(Boolean(data.affiliate_recurring));

      // Rebuild features state
      const newFeatures = data.features.map((f, idx) => ({
        id:          idx + 1,
        title:       f.title,
        subtitle:    f.subtitle,
        imageUrl:    f.image_url,
        isUploading: false,
        error:       "",
      }));
      setEditFeatures(newFeatures);

      setEditPricingPlans(
        Array.isArray(data.pricing_plans)
          ? data.pricing_plans.map(p => ({
              id: p.id,
              plan_name: p.plan_name || "",
              price: p.price,
              billing_period: p.billing_period,
              currency: p.currency || data.currency,
            }))
          : []
      );

      setEditCourseSteps(
        Array.isArray(data.course_steps) && data.course_steps.length
          ? data.course_steps.map((s, i) => ({
              id: i + 1,
              title: s.title || "",
              content: s.content || "",
              fileUrl: s.file_url || s.video_url || "",
              fileType: s.file_type || (s.video_url ? "video/mp4" : ""),
              isUploading: false,
              error: "",
            }))
          : [
              {
                id: 1,
                title: "",
                content: "",
                fileUrl: "",
                fileType: "",
                isUploading: false,
                error: "",
              },
            ]
      );

      setError("");
      setSlugError("");
      // waitlist_enabled and waitlist_questions will be handled by the parent hook
    }
  } catch (err) {
    console.error("Network error while saving Whop:", err);
    setError("Network error.");
    showNotification({
      type: "error",
      message: "Network error while saving Whop.",
    });
  }
}
