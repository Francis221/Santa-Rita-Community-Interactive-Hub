import React from "react";
import WelcomeStats from "../components/WelcomeStats";
import AboutBarangay from "../components/AboutBarangay";
import QuickActions from "../components/QuickActions";
import EmergencyHotline from "../components/EmergencyHotline";
import FindFriendsWidget from "../components/friends/FindFriendsWidget";

export default function Home() {
  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <WelcomeStats />
      <QuickActions />
      <FindFriendsWidget limit={6} showHeader={true} />
      <AboutBarangay />
      <EmergencyHotline />
    </div>
  );
}
