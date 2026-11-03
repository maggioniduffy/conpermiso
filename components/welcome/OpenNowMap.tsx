"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/app/welcome/welcome.module.css";

type Status = "open" | "closed" | "unknown";

interface Spot {
  id: string;
  name: string;
  left: string;
  top: string;
  open: number | null;
  close: number | null;
  pub: boolean;
  cost: string;
  hours: string;
}

const SPOTS: Spot[] = [
  { id: "museo", name: "Museo de Bellas Artes", left: "30%", top: "30%", open: 10, close: 19, pub: true, cost: "Sin cargo", hours: "Mar a dom, 10:00 a 19:00" },
  { id: "plaza", name: "Baño de la plaza", left: "17%", top: "66%", open: null, close: null, pub: true, cost: "Sin cargo", hours: "Indefinido / Desconocido" },
  { id: "estacion", name: "Estación de trenes", left: "52%", top: "50%", open: 5.5, close: 24, pub: false, cost: "Precio", hours: "Todos los días, 5:30 a 24:00" },
  { id: "parque", name: "Baño del parque", left: "76%", top: "20%", open: 9, close: 21, pub: true, cost: "Sin cargo", hours: "Todos los días, 9:00 a 21:00" },
  { id: "cafe", name: "Cafetería de la esquina", left: "64%", top: "44%", open: 8, close: 20, pub: false, cost: "Con consumición", hours: "Lun a sáb, 8:00 a 20:00" },
  { id: "mercado", name: "Mercado municipal", left: "38%", top: "72%", open: 7.5, close: 15, pub: false, cost: "Con consumición", hours: "Lun a sáb, 7:30 a 15:00" },
  { id: "shopping", name: "Centro comercial", left: "84%", top: "60%", open: 10, close: 22, pub: false, cost: "Sin cargo", hours: "Todos los días, 10:00 a 22:00" },
];

const MARKERS: Record<`${Status}${"" | "Pub"}`, string> = {
  open: "/markers/spot-open@2x.png",
  closed: "/markers/spot-closed@2x.png",
  unknown: "/markers/spot-unknown@2x.png",
  openPub: "/markers/spot-open-public@2x.png",
  closedPub: "/markers/spot-closed-public@2x.png",
  unknownPub: "/markers/spot-unknown-public@2x.png",
};

const LOOK: Record<Status, { text: string; chipBg: string; chipInk: string }> = {
  open: { text: "Abierto ahora", chipBg: "#ccefda", chipInk: "#21683e" },
  closed: { text: "Cerrado ahora", chipBg: "#fbe1e1", chipInk: "#9b1c1c" },
  unknown: { text: "Sin horario", chipBg: "#e4e7ec", chipInk: "#3d434b" },
};

function statusOf(sp: Spot, h: number): Status {
  if (sp.open === null || sp.close === null) return "unknown";
  return h >= sp.open && h < sp.close ? "open" : "closed";
}

function formatHour(h: number): string {
  const hh = Math.floor(h);
  const mm = h % 1 ? "30" : "00";
  return `${hh === 24 ? "00" : hh}:${mm}`;
}

const AREAS = [
  { label: "Parque", left: "62%", top: "9%" },
  { label: "Centro", left: "22%", top: "30%" },
  { label: "Plaza", left: "8%", top: "62%" },
];

const PARKS = [
  { left: "58%", top: "6%", width: "34%", height: "22%" },
  { left: "6%", top: "60%", width: "20%", height: "14%" },
];

const STREETS = [
  { left: "0", top: "38%", width: "100%", height: "14px", transform: "rotate(4deg)" },
  { left: "46%", top: "0", width: "14px", height: "100%", transform: "rotate(-6deg)" },
  { left: "10%", top: "58%", width: "80%", height: "12px", transform: "rotate(-16deg)" },
  { left: "72%", top: "18%", width: "12px", height: "70%", transform: "rotate(12deg)" },
  { left: "18%", top: "0", width: "10px", height: "60%", transform: "rotate(8deg)" },
];

export default function OpenNowMap() {
  const [hour, setHour] = useState(13);
  const [selId, setSelId] = useState("museo");

  const statuses = SPOTS.map((sp) => statusOf(sp, hour));
  const openCount = statuses.filter((s) => s === "open").length;
  const curIdx = Math.max(0, SPOTS.findIndex((sp) => sp.id === selId));
  const cur = SPOTS[curIdx];
  const curLook = LOOK[statuses[curIdx]];
  const hourLabel = formatHour(hour);

  return (
    <section id="mapa" className={`${styles.sec} ${styles.dark} ${styles.wrap}`} aria-labelledby="mapa-t">
      <div className={styles.grid12} style={{ alignItems: "start" }}>
        <div style={{ gridColumn: "1 / span 5" }}>
          <h2 id="mapa-t" className={styles.h2}>Verde, abierto. Rojo, cerrado.</h2>
          <p className={styles.lead} style={{ marginTop: 24 }}>
            Cada marcador sigue el horario cargado de su baño. Mové la hora y mirá cómo cambia la ciudad.
          </p>
          <div className={styles.hour}>
            <output htmlFor="hora">{hourLabel}</output>
            <span>{openCount} de 7 abiertos</span>
          </div>
          <input
            id="hora"
            className={styles.range}
            type="range"
            min={6}
            max={23.5}
            step={0.5}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            aria-label="Hora del día"
            aria-valuetext={hourLabel}
          />
          <div className={styles.legend}>
            <div>
              <Image src={MARKERS.open} alt="" width={132} height={184} />
              <span><b>Brillo verde.</b> Abierto ahora; el marcador titila para que lo ubiques rápido.</span>
            </div>
            <div>
              <Image src={MARKERS.closed} alt="" width={132} height={184} />
              <span><b>Brillo rojo.</b> Cerrado ahora; la ficha sirve para planificar.</span>
            </div>
            <div>
              <Image src={MARKERS.unknown} alt="" width={132} height={184} />
              <span><b>Sin brillo.</b> Horario desconocido: todavía sin horario. Si lo sabés, sugerí una edición.</span>
            </div>
            <div>
              <span className={styles.tagdemo}>PÚBLICO</span>
              <span>Va debajo de los baños públicos, para distinguirlos de los de comercios.</span>
            </div>
          </div>
        </div>
        <div style={{ gridColumn: "7 / span 6" }}>
          <div className={styles.map} role="group" aria-label="Mapa de ejemplo con siete baños">
            {PARKS.map((p, i) => (
              <div key={i} className={styles.park} style={p} />
            ))}
            {STREETS.map((s, i) => (
              <div key={i} className={styles.st} style={s} />
            ))}
            {AREAS.map((a) => (
              <span key={a.label} className={styles.area} style={{ left: a.left, top: a.top }}>{a.label}</span>
            ))}
            {SPOTS.map((sp, i) => {
              const st = statuses[i];
              const selected = sp.id === cur.id;
              const cls = [styles.pin, st === "open" ? styles.open : "", selected ? styles.sel : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  type="button"
                  key={sp.id}
                  className={cls}
                  style={{ left: sp.left, top: sp.top }}
                  aria-label={`${sp.name}, ${LOOK[st].text.toLowerCase()}`}
                  aria-pressed={selected}
                  onClick={() => setSelId(sp.id)}
                >
                  <Image src={MARKERS[`${st}${sp.pub ? "Pub" : ""}`]} alt="" width={132} height={184} />
                </button>
              );
            })}
            <div className={styles.card} aria-live="polite" data-testid="spot-card">
              <div className={styles["card-head"]}>
                <h3>{cur.name}</h3>
                {cur.pub && <span className={styles.pub}>PÚBLICO</span>}
                <span className={styles.status} style={{ background: curLook.chipBg, color: curLook.chipInk }}>
                  {curLook.text}
                </span>
              </div>
              <dl>
                <dt>Costo</dt>
                <dd>{cur.cost}</dd>
                <dt>Horarios</dt>
                <dd>{cur.hours}</dd>
              </dl>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
