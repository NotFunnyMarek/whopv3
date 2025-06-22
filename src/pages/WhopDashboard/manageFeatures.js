// src/pages/WhopDashboard/manageFeatures.js

/**
 * Utility to manage the features list in the Whop editor.
 *
 * @param {Array} editFeatures             - current features state array
 * @param {function} setEditFeatures       - setter to update features state
 * @param {function} showNotification      - function to display toast notifications
 * @returns {object}                       - handlers: addFeature, removeFeature, handleFeatChange
 */
export default function manageFeatures(editFeatures, setEditFeatures, showNotification) {
  /**
   * Adds a new empty feature card, up to a maximum of 6.
   */
  const addFeature = () => {
    if (editFeatures.length >= 6) return;
    const newId =
      editFeatures.length > 0
        ? Math.max(...editFeatures.map(f => f.id)) + 1
        : 1;
    setEditFeatures(prev => [
      ...prev,
      { id: newId, title: "", subtitle: "", imageUrl: "", isUploading: false, error: "" },
    ]);
    showNotification({
      type: "info",
      message: "New feature added. Please fill in the details.",
    });
  };

  /**
   * Removes a feature by id, ensuring at least 2 remain.
   */
  const removeFeature = (id) => {
    if (editFeatures.length <= 2) {
      showNotification({
        type: "error",
        message: "At least 2 features must remain.",
      });
      return;
    }
    setEditFeatures(prev => prev.filter(f => f.id !== id));
    showNotification({
      type: "info",
      message: "Feature removed.",
    });
  };

  /**
   * Updates a specific field on a feature.
   *
   * @param {number} id      - feature id
   * @param {string} field   - name of the field to update ('title' or 'subtitle')
   * @param {string} value   - new value for the field
   */
  const handleFeatChange = (id, field, value) => {
    setEditFeatures(prev =>
      prev.map(f => f.id === id ? { ...f, [field]: value } : f)
    );
  };

  return { addFeature, removeFeature, handleFeatChange };
}
