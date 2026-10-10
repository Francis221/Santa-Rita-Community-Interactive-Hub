import React from "react";
import { ArrowRight } from "lucide-react";
import { updateGallery } from "../constants/hubConfig";
import "./UpdatesSection.css";

export default function UpdateGallery() {
  return (
    <section className="gallery" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="gallery__heading">
        <span>Update</span>
      </h2>
      <div className="gallery__grid">
        {updateGallery.map((item) => (
          <figure className="gallery__card" key={item.id}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <figcaption>
              <p className="gallery__title">{item.title}</p>
              <p className="gallery__meta">{item.date}</p>
              <p className="gallery__meta">{item.place}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <button className="gallery__cta" type="button">
        View Events <ArrowRight size={15} strokeWidth={2} />
      </button>
    </section>
  );
}
