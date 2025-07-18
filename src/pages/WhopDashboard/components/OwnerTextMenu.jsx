import React from "react";
import "../../../styles/whop-dashboard/_owner.scss";

export default function OwnerTextMenu({
  editLongDescription,
  setEditLongDescription,
  editAboutBio,
  setEditAboutBio,
  editWebsiteUrl,
  setEditWebsiteUrl,
  editSocials,
  setEditSocials,
  editWhoFor,
  setEditWhoFor,
  editFaq,
  setEditFaq,
  editLandingTexts,
  setEditLandingTexts,
  isMobileOpen,
}) {
  const handleSocialChange = (key, value) => {
    setEditSocials((prev) => ({ ...prev, [key]: value }));
  };
  const addWhoFor = () =>
    setEditWhoFor((prev) => [...prev, { title: "", description: "" }]);
  const removeWhoFor = (i) => {
    if (editWhoFor.length <= 1) return;
    setEditWhoFor((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleWhoForChange = (i, field, v) => {
    setEditWhoFor((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: v } : item))
    );
  };
  const addFaq = () => setEditFaq((prev) => [...prev, { question: "", answer: "" }]);
  const removeFaq = (i) => {
    if (editFaq.length <= 1) return;
    setEditFaq((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleFaqChange = (i, field, v) => {
    setEditFaq((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: v } : item))
    );
  };
  const handleLandingTextChange = (field, value) => {
    setEditLandingTexts((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`owner-text-menu${isMobileOpen ? "" : " closed"}`}>
      <h3>Edit Text Content</h3>
      <textarea
        className="otm-textarea"
        placeholder="Long description"
        value={editLongDescription}
        onChange={(e) => setEditLongDescription(e.target.value)}
        rows={3}
      />
      <textarea
        className="otm-textarea"
        placeholder="About bio"
        value={editAboutBio}
        onChange={(e) => setEditAboutBio(e.target.value)}
        rows={3}
      />
      <input
        type="text"
        className="otm-input"
        placeholder="Website URL"
        value={editWebsiteUrl}
        onChange={(e) => setEditWebsiteUrl(e.target.value)}
      />
      <input
        type="text"
        className="otm-input"
        placeholder="Instagram URL"
        value={editSocials.instagram}
        onChange={(e) => handleSocialChange("instagram", e.target.value)}
      />
      <input
        type="text"
        className="otm-input"
        placeholder="Discord URL"
        value={editSocials.discord}
        onChange={(e) => handleSocialChange("discord", e.target.value)}
      />
      <div className="otm-section">
        <h4>Who this is for</h4>
        {editWhoFor.map((item, i) => (
          <div key={i} className="otm-subgroup">
            <input
              type="text"
              className="otm-input"
              placeholder="Title"
              value={item.title}
              onChange={(e) => handleWhoForChange(i, "title", e.target.value)}
            />
            <textarea
              className="otm-textarea"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleWhoForChange(i, "description", e.target.value)}
              rows={2}
            />
            {editWhoFor.length > 1 && (
              <button className="otm-remove" onClick={() => removeWhoFor(i)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button className="otm-add" onClick={addWhoFor}>
          + Add
        </button>
      </div>
      <div className="otm-section">
        <h4>FAQ</h4>
        {editFaq.map((item, i) => (
          <div key={i} className="otm-subgroup">
            <input
              type="text"
              className="otm-input"
              placeholder="Question"
              value={item.question}
              onChange={(e) => handleFaqChange(i, "question", e.target.value)}
            />
            <textarea
              className="otm-textarea"
              placeholder="Answer"
              value={item.answer}
              onChange={(e) => handleFaqChange(i, "answer", e.target.value)}
              rows={2}
            />
            {editFaq.length > 1 && (
              <button className="otm-remove" onClick={() => removeFaq(i)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button className="otm-add" onClick={addFaq}>
          + Add FAQ
        </button>
      </div>
      <div className="otm-section">
        <h4>Section Titles</h4>
        <input
          type="text"
          className="otm-input"
          placeholder="Reviews title"
          value={editLandingTexts.reviews_title || ""}
          onChange={(e) => handleLandingTextChange("reviews_title", e.target.value)}
        />
        <input
          type="text"
          className="otm-input"
          placeholder="Features title"
          value={editLandingTexts.features_title || ""}
          onChange={(e) => handleLandingTextChange("features_title", e.target.value)}
        />
        <input
          type="text"
          className="otm-input"
          placeholder="About title"
          value={editLandingTexts.about_title || ""}
          onChange={(e) => handleLandingTextChange("about_title", e.target.value)}
        />
        <input
          type="text"
          className="otm-input"
          placeholder="FAQ title"
          value={editLandingTexts.faq_title || ""}
          onChange={(e) => handleLandingTextChange("faq_title", e.target.value)}
        />
      </div>
    </div>
  );
}
