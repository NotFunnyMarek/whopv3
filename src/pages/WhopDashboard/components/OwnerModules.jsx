import React from "react";

export default function OwnerModules({ editModules, setEditModules, isEditing }) {
  if (!isEditing) return null;
  const toggle = (key) => {
    setEditModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const labels = {
    chat: "Chat",
    earn: "Earn",
    discord: "Discord Access",
    course: "Course",
    text: "Text Features",
  };
  return (
    <div className="owner-modules-section">
      <h2>Modules</h2>
      {Object.keys(labels).map((key) => (
        <label key={key} className="module-toggle">
          <input
            type="checkbox"
            checked={editModules[key]}
            onChange={() => toggle(key)}
          />
          {labels[key]}
        </label>
      ))}
    </div>
  );
}
