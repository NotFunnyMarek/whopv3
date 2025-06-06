// src/components/WithdrawModal.jsx

import React, { useState } from 'react';
import WithdrawForm from './WithdrawForm';
import '../styles/deposit-modal.scss'; // můžeme použít stejný styl jako DepositModal

export default function WithdrawModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Jednoduchý overlay/modal stejný jako u DepositModal
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2>Withdraw Funds</h2>
        <WithdrawForm onSuccess={onClose} />
      </div>
    </div>
  );
}
