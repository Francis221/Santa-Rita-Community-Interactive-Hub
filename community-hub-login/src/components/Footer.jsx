import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { barangay } from "../constants/hubConfig";
import "./Footer.css";

const quickLinks = ["Profile", "Announcements", "Projects", "Reports", "Request Document"];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__about">
          <div className="footer__brand">
            <div className="footer__logo" aria-hidden="true">
              <img src="./src/logo/community-c-logo-transparent.png" alt="Barangay Logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div>
              <p className="footer__brand-name">Barangay {barangay.name}</p>
              <p className="footer__brand-loc">{barangay.municipality}</p>
            </div>
          </div>
          <p className="footer__tagline">Official Barangay Community Portal</p>
        </div>

        <div>
          <p className="footer__heading">Quick Links</p>
          <ul className="footer__list">
            {quickLinks.map((label) => (
              <li key={label}>
                <a href="#top">
                  <span>{label}</span>
                  <span aria-hidden="true">›</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="footer__heading">Contact Us</p>
          <ul className="footer__contact">
            <li>
              <MapPin size={15} strokeWidth={1.8} />
              <span>{barangay.address}</span>
            </li>
            <li>
              <Mail size={15} strokeWidth={1.8} />
              <span>Email: {barangay.email}</span>
            </li>
            <li>
              <Phone size={15} strokeWidth={1.8} />
              <span>Phone: {barangay.phone}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2026 Barangay {barangay.name}. All Rights Reserved.</p>
        <div className="footer__legal">
          <a href="#top">Privacy</a>
          <a href="#top">Terms</a>
        </div>
      </div>
    </footer>
  );
}
