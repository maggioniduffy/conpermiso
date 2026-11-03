"use client";

import { useState } from "react";
import styles from "@/app/welcome/welcome.module.css";

const BANDS = [
  { sentence: "Solo baños públicos.", consequence: "Filtro Tipo: Públicos. Llevan la etiqueta PÚBLICO bajo el marcador.", bg: "#dbe9f9" },
  { sentence: "Solo los gratis.", consequence: "Filtro Precio: Gratis. Quedan los Sin cargo; Con consumición y Precio se ocultan.", bg: "#7ed6a3" },
  { sentence: "Guardá los que te sirven.", consequence: "Quedan en Mis Guardados, en tu perfil, junto a los que agregaste vos.", bg: "#b7d3f3" },
  { sentence: "En español o en inglés.", consequence: "Cambiá el idioma cuando quieras desde Configuración.", bg: "#ccefda" },
];

export default function FilterBands() {
  const [on, setOn] = useState([true, true, false, false]);

  const toggle = (i: number) =>
    setOn((prev) => prev.map((v, j) => (j === i ? !v : v)));

  return (
    <div className={styles.bands}>
      {BANDS.map((b, i) => {
        const active = on[i];
        return (
          <div className={styles.band} key={b.sentence} style={{ background: active ? b.bg : "#f7f9fc" }}>
            <div>
              <h3 style={{ color: active ? "#1f1f1f" : "#5c5c5c" }}>{b.sentence}</h3>
              {active && <p>{b.consequence}</p>}
            </div>
            <button
              type="button"
              className={styles.sw}
              role="switch"
              aria-checked={active}
              aria-label={b.sentence}
              onClick={() => toggle(i)}
              style={{ background: active ? "#081d34" : "#c4ccd6" }}
            >
              <span style={{ transform: `translateX(${active ? "36px" : "0px"})` }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
