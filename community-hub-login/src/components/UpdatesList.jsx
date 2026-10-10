import React from "react";
import { updates } from "../constants/hubConfig";
import "./UpdatesSection.css";

export default function UpdatesList() {
  return (
    <section className="updates-list" aria-labelledby="updates-list-heading">
      <div className="updates-list__head">
        <h2 id="updates-list-heading">Updates</h2>
        <button type="button" className="updates-list__view-all">
          View all
        </button>
      </div>
      <ul>
        {updates.map((item) => (
          <li key={item.id} className="updates-list__item">
            <span className="updates-list__thumb" aria-hidden="true" />
            <div className="updates-list__body">
              <p className="updates-list__title">{item.title}</p>
              <p className="updates-list__meta">{item.meta}</p>
            </div>
            <span className="updates-list__time">{item.time}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
