// src/components/ConfirmModal.jsx

import React from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-buttons">
          <button className="btn-confirm-ok" onClick={onConfirm}>
            Continue
          </button>
          <button className="btn-confirm-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
