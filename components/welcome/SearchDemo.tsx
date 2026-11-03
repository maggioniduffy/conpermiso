"use client";

import { useState } from "react";
import styles from "@/app/welcome/welcome.module.css";

type Row = readonly [src: string, cls: string, title: string, meta: string];

const EXAMPLES = ["Plaza Mayor", "Estación central", "Museo de Bellas Artes"];

const SETS: Record<string, Row[]> = {
  "Plaza Mayor": [
    ["Spot", "src-spot", "Baño público, Plaza Mayor", "Público · Sin cargo"],
    ["Lugar", "src-lugar", "Plaza Mayor", "Google · mover el mapa aquí"],
    ["Cerca de aquí", "src-cerca", "Cafetería en la plaza", "Comercio cercano"],
  ],
  "Estación central": [
    ["Spot", "src-spot", "Estación central, vestíbulo", "Comercio · Precio"],
    ["Lugar", "src-lugar", "Estación central", "Google · mover el mapa aquí"],
    ["Cerca de aquí", "src-cerca", "Centro comercial", "Punto de interés cercano"],
  ],
  "Museo de Bellas Artes": [
    ["Spot", "src-spot", "Museo de Bellas Artes", "Público · Sin cargo"],
    ["Lugar", "src-lugar", "Museo de Bellas Artes", "Google · mover el mapa aquí"],
    ["Cerca de aquí", "src-cerca", "Parque de la ciudad", "Punto de interés cercano"],
  ],
};

function rowsFor(q: string): Row[] {
  return (
    SETS[q] ?? [
      ["Spot", "src-spot", `Baños cerca de “${q}”`, "Spots de la comunidad y de OpenStreetMap"],
      ["Lugar", "src-lugar", q, "Google · mover el mapa aquí"],
      ["Cerca de aquí", "src-cerca", `Comercios cerca de “${q}”`, "Con tu ubicación compartida"],
    ]
  );
}

export default function SearchDemo() {
  const [query, setQuery] = useState("Plaza Mayor");
  const rows = rowsFor(query);

  return (
    <>
      <input
        className={styles.q}
        type="text"
        aria-label="Buscar una calle o un lugar"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className={styles.grid12} style={{ marginTop: 48 }}>
        <div style={{ gridColumn: "1 / span 7" }}>
          <div className={styles.results} data-testid="search-results">
            {rows.map(([src, cls, title, meta]) => (
              <div className={styles.row} key={src}>
                <span className={`${styles.src} ${styles[cls]}`}>{src}</span>
                <div>
                  <b>{title}</b>
                  <span className={styles.m}>{meta}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.ex} role="group" aria-label="Probá con">
            {EXAMPLES.map((label) => (
              <button type="button" key={label} onClick={() => setQuery(label)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.defs} style={{ gridColumn: "9 / span 4" }}>
          <div>
            <h3><i style={{ background: "#2273cf" }} />Spots</h3>
            <p>Baños cargados por la comunidad e importados de OpenStreetMap, con dirección, horario, valoración y costo.</p>
          </div>
          <div>
            <h3><i style={{ background: "#9aa3ae" }} />Lugares</h3>
            <p>Direcciones y localidades de todo el mundo, desde Google, para mover el mapa a otra zona antes de explorar.</p>
          </div>
          <div>
            <h3><i style={{ background: "#7ed6a3" }} />Cerca de aquí</h3>
            <p>Comercios y puntos de interés próximos: estaciones, shoppings, locales. Aparece cuando compartís tu ubicación.</p>
          </div>
        </div>
      </div>
    </>
  );
}
