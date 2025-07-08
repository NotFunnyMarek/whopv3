import React from "react";
import Modal from "../../../components/Modal";
import DiscordSetupSection from "./DiscordSetupSection";

export default function DiscordSetupModal({ isOpen, onClose, whopId }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <DiscordSetupSection isEditing={true} whopId={whopId} />
    </Modal>
  );
}
