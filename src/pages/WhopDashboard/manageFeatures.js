// src/pages/WhopDashboard/manageFeatures.js

export default function manageFeatures(editFeatures, setEditFeatures, showNotification) {
  const addFeature = () => {
    if (editFeatures.length >= 6) return;
    const newId =
      editFeatures.length > 0
        ? Math.max(...editFeatures.map((f) => f.id)) + 1
        : 1;
    setEditFeatures((prev) => [
      ...prev,
      { id: newId, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
    ]);
    showNotification({
      type: "info",
      message: "Přidána nová feature (vyplňte údaje).",
    });
  };

  const removeFeature = (id) => {
    if (editFeatures.length <= 2) {
      showNotification({ type: "error", message: "Minimálně 2 features musí zůstat." });
      return;
    }
    setEditFeatures((prev) => prev.filter((f) => f.id !== id));
    showNotification({ type: "info", message: "Feature odstraněna." });
  };

  const handleFeatChange = (id, field, value) => {
    setEditFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  return { addFeature, removeFeature, handleFeatChange };
}
