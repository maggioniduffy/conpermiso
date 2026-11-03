import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FeedbackButton from "@/components/ui/FeedbackButton";
import SearchDemo from "@/components/welcome/SearchDemo";
import OpenNowMap from "@/components/welcome/OpenNowMap";
import FilterBands from "@/components/welcome/FilterBands";
import HowItWorks from "@/components/welcome/HowItWorks";
import { APP_STORE_URL } from "@/lib/store";
import styles from "./welcome.module.css";

const title = "KKapp — Encontrá baños cerca tuyo";
const description =
  "KKapp es la app colaborativa para encontrar baños públicos y de comercios cerca tuyo, con horarios, costos y opiniones. Disponible en iPhone y en la web.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: ["/opengraph-image.png"],
  },
};

const LINKEDIN_URL = "https://www.linkedin.com/in/maggioniduffy/";
const PORTFOLIO_URL = "https://maggioniduffy.vercel.app/";

const APP_STORE_LABEL = "Descargar KKapp en el App Store";
const WEB_LABEL = "Abrir KKapp en la web";

export default function WelcomePage() {
  const year = new Date().getFullYear();

  return (
    <div className={styles.kk}>
      <header className={styles.nav}>
        <a className={styles.word} href="#top" aria-label="KKapp, inicio">
          KKapp
        </a>
        <nav className={styles.links} aria-label="Principal">
          <a className={styles.tl} href="#mapa">Mapa en vivo</a>
          <a className={styles.tl} href="#filtros">Filtros</a>
          <a className={styles.tl} href="#como">Cómo funciona</a>
          <Link className={`${styles.btn} ${styles["btn-blue"]}`} href="/">
            Abrir KKapp
          </Link>
        </nav>
      </header>

      <main>
        <section id="top" aria-labelledby="hero-title">
          <h1 id="hero-title" className={styles.h1}>
            <span className={styles.l1}>Un baño abierto,</span>
            <span className={styles.l2}>
              <span className={styles.slot}>
                <Image className={styles.bg} src="/screenshots/map.webp" alt="" width={739} height={1600} sizes="200px" />
                <Image className={styles.mk} src="/markers/spot-open@2x.png" alt="" width={132} height={184} />
              </span>
              cerca tuyo.
            </span>
          </h1>
          <div className={styles["hero-blue"]}>
            <div className={styles["hero-lede"]}>
              <p>
                KKapp es el mapa colaborativo de baños públicos y de comercios, en cualquier ciudad: cuáles están abiertos, cuánto cuestan y cómo llegar.
              </p>
              <div className={styles.acts}>
                <Link
                  className={`${styles.btn} ${styles["btn-white"]}`}
                  href="/"
                  aria-label={WEB_LABEL}
                >
                  Abrir en la web
                </Link>
                <a
                  className={`${styles.btn} ${styles["btn-deep"]}`}
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={APP_STORE_LABEL}
                >
                  Descargar para iPhone
                </a>
              </div>
            </div>
          </div>
          <div className={styles.stage}>
            <div className={`${styles.phone} ${styles.a}`}>
              <div className={styles.screen}>
                <Image src="/screenshots/filters.webp" alt="Pantalla de filtros: Tipo y Precio" width={739} height={1600} sizes="(max-width: 760px) 130px, 300px" priority />
              </div>
            </div>
            <div className={`${styles.phone} ${styles.mid} ${styles.b}`}>
              <div className={styles.screen}>
                <Image src="/screenshots/map.webp" alt="Mapa de KKapp con marcadores de baños y etiquetas PÚBLICO" width={739} height={1600} sizes="(max-width: 760px) 150px, 340px" priority />
              </div>
            </div>
            <div className={`${styles.phone} ${styles.c}`}>
              <div className={styles.screen}>
                <Image src="/screenshots/spot-detail.webp" alt="Ficha de un baño público con costo, dirección y horarios" width={739} height={1600} sizes="(max-width: 760px) 130px, 300px" priority />
              </div>
            </div>
          </div>
          <p className={styles.cap}>
            Filtros, mapa y ficha de un baño, tal como se ven en el iPhone.
          </p>
        </section>

        <section className={`${styles.sec} ${styles.wrap}`} aria-labelledby="busq">
          <div className={styles.grid12} style={{ alignItems: "end", marginBottom: 56 }}>
            <h2 id="busq" className={styles.h2} style={{ gridColumn: "1 / span 7" }}>
              Una búsqueda, tres fuentes.
            </h2>
            <p className={styles.lead} style={{ gridColumn: "8 / span 5" }}>
              Escribí una calle o un lugar. KKapp junta los baños de la comunidad, las direcciones de Google y lo que hay cerca.
            </p>
          </div>
          <SearchDemo />
        </section>

        <OpenNowMap />

        <section id="filtros" aria-labelledby="fil-t" style={{ paddingTop: "clamp(96px, 11vw, 200px)" }}>
          <div className={`${styles.wrap} ${styles.grid12}`} style={{ alignItems: "end", marginBottom: 56 }}>
            <h2 id="fil-t" className={styles.h2} style={{ gridColumn: "1 / span 7" }}>
              A tu manera.
            </h2>
            <p className={styles.lead} style={{ gridColumn: "8 / span 5" }}>
              Los filtros y ajustes que tenés en la app. Tocá los interruptores.
            </p>
          </div>
          <FilterBands />
        </section>

        <HowItWorks />

        <section id="comunidad" className={`${styles.sec} ${styles.wrap}`} aria-labelledby="com-t">
          <div className={styles.duo}>
            <figure className={styles["duo-pic"]} style={{ margin: 0 }}>
              <Image src="/screenshots/requests.webp" alt="Pantalla Mis Solicitudes con ediciones aprobadas" width={739} height={1600} sizes="(max-width: 760px) 80vw, 340px" />
            </figure>
            <div className={styles["duo-text"]}>
              <h2 id="com-t" className={styles.h2}>Un mapa que arma la gente.</h2>
              <p>
                Cada baño nuevo y cada edición pasa por un admin antes de publicarse. Seguís el estado en Mis Solicitudes: Pendientes, Aprobadas o Rechazadas.
              </p>
              <div>
                <h3>Datos abiertos, en todo el mundo.</h3>
                <p style={{ marginTop: 10 }}>
                  Además de los aportes, sumamos baños de OpenStreetMap, así el mapa sirve en cualquier ciudad. Algunos todavía no se verificaron en persona: si ves un error, sugerí una edición desde la ficha.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-t">
          <h2 id="cta-t" className={styles.h1x}>Tu próximo baño ya está en el mapa.</h2>
          <div className={styles["cta-foot"]}>
            <p>
              Gratis, sin anuncios y colaborativa. En iPhone hoy, en Android muy pronto, o{" "}
              <Link className={styles.inl} href="/">abrila en el navegador</Link>.
            </p>
            <a
              className={`${styles.btn} ${styles["btn-green"]}`}
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={APP_STORE_LABEL}
            >
              Descargar en el App Store
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.foot} aria-labelledby="foot-t">
        <div className={styles["foot-top"]}>
          <div className={styles["foot-inv"]}>
            <h2 id="foot-t">¿Conocés un baño? Sumalo.</h2>
            <Link className={`${styles.btn} ${styles["btn-white"]}`} href="/spot/create">
              Sugerir un baño
            </Link>
          </div>
          <div className={styles["foot-links"]}>
            <Link href="/" aria-label={WEB_LABEL}>Abrir la web</Link>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label={APP_STORE_LABEL}>
              App Store
            </a>
            <Link href="/privacy">Privacidad</Link>
            <FeedbackButton className={styles.fb} />
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">Portfolio</a>
            <p>
              En Android, mientras llega la app: en Chrome, menú, Instalar aplicación. En iPhone con Safari: Compartir, Agregar a la pantalla de inicio.
            </p>
          </div>
        </div>
        <div className={styles.legal}>
          <span>Hecho en Argentina · © {year} KKapp.</span>
          <span>
            Datos de la comunidad y de los colaboradores de{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>.
          </span>
        </div>
        <div className={styles.giant} aria-hidden="true">KKapp</div>
      </footer>
    </div>
  );
}
