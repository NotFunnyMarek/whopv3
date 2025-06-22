// src/pages/WhopDashboard/components/ChatPanel.jsx

import React from "react";
import ChatWindow from "../../../components/Chat/ChatWindow";

export default function ChatPanel({ whopData }) {
  return (
    <div className="member-tab-content">
      <ChatWindow whopId={whopData.id} whopName={whopData.name} />
    </div>
  );
}
