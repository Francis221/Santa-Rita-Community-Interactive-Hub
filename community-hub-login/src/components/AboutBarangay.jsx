import React from "react";
import { aboutBarangay } from "../constants/hubConfig";
import "./AboutBarangay.css";

export default function AboutBarangay() {
  return (
    <section className="about-card card">
      <div className="about-card__media">
        <img style={{ width: 500, height: 500, objectFit: "cover", borderRadius: "20px", padding: "10px", margin: "10px", display: "flex", justifyContent: "center", alignItems: "center" }} src={aboutBarangay.image} alt={aboutBarangay.heading} loading="lazy" />
        <div className="about-card__overlay" />
      </div>
      <div className="about-card__content">
        <h2 className="about-card__title">{aboutBarangay.heading}</h2>
        <p className="about-card__body">{aboutBarangay.body}</p>
      </div>
    </section>
  );
}
