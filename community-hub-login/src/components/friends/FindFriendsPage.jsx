import React, { useState } from "react";
import FindFriendsWidget from "./FindFriendsWidget";
import { Users, UserCheck, UserPlus, ShieldAlert } from "lucide-react";
import "./friends.css";

export default function FindFriendsPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="page friends-container">
      <div className="friends-header">
        <div>
          <h1>Find Friends &amp; Connect</h1>
          <p>Connect with your neighbors, barangay workers, and community members in Sta. Rita Central.</p>
        </div>
      </div>

      <FindFriendsWidget limit={0} showHeader={true} />
    </div>
  );
}
