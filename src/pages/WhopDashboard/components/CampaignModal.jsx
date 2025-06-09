// src/pages/WhopDashboard/components/CampaignModal.jsx

import React from "react";
import Modal from "../../../components/Modal";
import CardForm from "../../../components/CardForm";

export default function CampaignModal({ isOpen, onClose, whopId, fetchCampaigns }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CardForm
        whopId={whopId}
        onClose={onClose}
        onRefresh={() => fetchCampaigns(whopId)}
      />
    </Modal>
  );
}
