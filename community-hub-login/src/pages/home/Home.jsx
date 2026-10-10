import React from "react";
import WelcomeStats from "../../components/WelcomeStats";
import AboutBarangay from "../../components/AboutBarangay";
import QuickActions from "../../components/QuickActions";
import EmergencyHotline from "../../components/EmergencyHotline";
import FindFriendsWidget from "../../components/friends/FindFriendsWidget";
import "./Home.css";

export default function Home() {
  return (
    <div className="page home-page">
      <WelcomeStats />
      <QuickActions />
      <FindFriendsWidget limit={6} showHeader={true} />
      <AboutBarangay />
      <EmergencyHotline />
    </div>
  );
}
