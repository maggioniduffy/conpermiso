"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/app/welcome/welcome.module.css";

const STAGES = [
  { name: "Abrí", clause: "Primero, abrí el mapa.", desc: "Desde la app de iPhone o desde el navegador. Buscá una dirección o mirá lo que tenés alrededor.", img: "/screenshots/map.webp", alt: "Mapa con marcadores de baños" },
  { name: "Filtrá", clause: "Después, filtrá.", desc: "Tipo: Todos, Públicos o Comercios. Precio: Todos, Gratis o Pago.", img: "/screenshots/filters.webp", alt: "Panel de filtros por tipo y precio" },
  { name: "Mirá", clause: "Luego, mirá la ficha.", desc: "Costo, dirección, horarios y valoraciones, con Abrir en Google Maps para llegar.", img: "/screenshots/spot-detail.webp", alt: "Ficha de un baño público" },
  { name: "Sumá", clause: "Al final, sumá uno.", desc: "Nombre, ubicación en el mapa, costo, tipo, si requiere código y horarios. Un admin lo revisa.", img: "/screenshots/new-spot.webp", alt: "Formulario Nuevo Spot" },
];

export default function HowItWorks() {
  const [index, setIndex] = useState(0);
  const stage = STAGES[index];

  return (
    <section id="como" className={styles.split} aria-labelledby="como-t">
      <div className={styles["split-l"]}>
        <div>
          <h2 id="como-t" className={styles.h2}>{stage.clause}</h2>
          <p className={styles.lead} style={{ marginTop: 24 }}>{stage.desc}</p>
        </div>
        <div>
          <input
            className={styles["stage-range"]}
            type="range"
            min={0}
            max={3}
            step={1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label="Paso"
            aria-valuetext={stage.name}
          />
          <div className={styles.stages}>
            {STAGES.map((s, i) => (
              <button type="button" key={s.name} aria-pressed={i === index} onClick={() => setIndex(i)}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles["split-r"]}>
        <Image src={stage.img} alt={stage.alt} width={739} height={1600} sizes="(max-width: 760px) 100vw, 360px" />
      </div>
    </section>
  );
}
