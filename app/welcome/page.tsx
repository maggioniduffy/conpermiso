import type { Metadata } from "next";
import Image from "next/image";
import {
  MapPin,
  Search,
  ShieldCheck,
  Smartphone,
  Building2,
  Globe,
  Info,
  KeyRound,
  Bookmark,
  Map as MapIcon,
  SlidersHorizontal,
  Clock,
  Star,
  PencilLine,
  Languages,
  Download,
} from "lucide-react";
import AppFooter from "@/components/Footer";
import StoreBadges from "@/components/StoreBadges";
import ScreenshotCarousel from "@/components/ScreenshotCarousel";

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

const screenshots = [
  {
    src: "/screenshots/map.webp",
    caption: "Mapa con baños cercanos",
    alt: "Pantalla del mapa de KKapp con baños cercanos",
  },
  {
    src: "/screenshots/filters.webp",
    caption: "Filtros por tipo y precio",
    alt: "Pantalla de filtros por tipo y precio",
  },
  {
    src: "/screenshots/spot-detail.webp",
    caption: "Detalle: costo, horarios y cómo llegar",
    alt: "Pantalla de detalle de un baño con costo y horarios",
  },
  {
    src: "/screenshots/new-spot.webp",
    caption: "Sumá un baño nuevo",
    alt: "Pantalla para sumar un baño nuevo",
  },
  {
    src: "/screenshots/requests.webp",
    caption: "Seguí tus solicitudes",
    alt: "Pantalla de seguimiento de solicitudes",
  },
  {
    src: "/screenshots/profile.webp",
    caption: "Tu perfil, guardados e idioma",
    alt: "Pantalla de perfil con guardados e idioma",
  },
];

const steps = [
  {
    icon: <Download className="size-6 text-principal" />,
    title: "1. Descargá la app o abrí la web",
    desc: "Bajala del App Store en tu iPhone (Android próximamente) o usá KKapp directamente desde el navegador.",
  },
  {
    icon: <Search className="size-6 text-principal" />,
    title: "2. Buscá un baño",
    desc: "Escribí una dirección o punto de interés. Los resultados incluyen spots de KKapp, lugares y comercios cercanos.",
  },
  {
    icon: <KeyRound className="size-6 text-principal" />,
    title: "3. Entrá en segundos",
    desc: "Ingresá con Apple (en la app de iPhone), Google, un código por email o como invitado, sin crear una cuenta.",
  },
  {
    icon: <ShieldCheck className="size-6 text-principal" />,
    title: "4. Sumate a la comunidad",
    desc: "Sugerí nuevos baños o ediciones, guardá tus favoritos, valorá espacios y colaborá para mantener la información actualizada.",
  },
];

const features = [
  {
    icon: <MapIcon className="size-5 text-principal" />,
    title: "Mapa nativo",
    desc: "Apple Maps en iPhone y Google Maps en Android, con etiquetas \"PÚBLICO\" y agrupación de pines cercanos dentro de la app.",
  },
  {
    icon: <SlidersHorizontal className="size-5 text-principal" />,
    title: "Filtros a tu medida",
    desc: "Filtrá por tipo (Públicos / Comercios) y por precio (Gratis / Pago) para encontrar justo lo que necesitás.",
  },
  {
    icon: <KeyRound className="size-5 text-principal" />,
    title: "Ingresá como quieras",
    desc: "Con Apple (en la app de iPhone), con Google, con un código de 6 dígitos por email o como invitado, sin cuenta.",
  },
  {
    icon: <Clock className="size-5 text-principal" />,
    title: "Toda la info del baño",
    desc: "Costo (Sin cargo, Con consumición o Precio), si pide código (\"¿Pide código?\"), horarios y \"Abrir en Google Maps\".",
  },
  {
    icon: <Star className="size-5 text-principal" />,
    title: "Valoraciones y comentarios",
    desc: "Calificá de 1 a 5 estrellas y dejá comentarios. Podés reportar y bloquear contenido inapropiado.",
  },
  {
    icon: <PencilLine className="size-5 text-principal" />,
    title: "Sugerí ediciones y nuevos baños",
    desc: "Un admin las revisa y vos seguís el estado en \"Mis Solicitudes\" (Pendientes / Aprobadas / Rechazadas).",
  },
  {
    icon: <Bookmark className="size-5 text-principal" />,
    title: "Guardados y aportes",
    desc: "Tus baños guardados y los \"Agregados por mí\" quedan a mano en tu perfil.",
  },
  {
    icon: <Languages className="size-5 text-principal" />,
    title: "App en español e inglés",
    desc: "Cambiá el idioma cuando quieras desde Configuración.",
  },
  {
    icon: <Globe className="size-5 text-principal" />,
    title: "Datos abiertos",
    desc: "Combinamos aportes de la comunidad con datos públicos de OpenStreetMap para ofrecer la cobertura más amplia posible.",
  },
];

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-mywhite flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 gap-6">
        <Image
          src="/logo-lockup-3x.png"
          alt="KKapp"
          width={560}
          height={144}
          className="h-12 w-auto mb-2"
          priority
        />
        <h1 className="text-4xl md:text-5xl font-bold text-jet leading-tight max-w-xl">
          Encontrá baños cerca tuyo,{" "}
          <span className="text-principal">cuando más lo necesitás.</span>
        </h1>
        <p className="text-jet-600 text-lg max-w-md">
          KKapp es la plataforma colaborativa que te muestra baños públicos y privados
          con horarios, opiniones y costos actualizados. Ya está disponible en iPhone y en la web.
        </p>
        <StoreBadges showWeb />
      </section>

      {/* Capturas */}
      <section className="px-6 py-16 bg-mywhite border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-jet text-center mb-2">
            Así se ve KKapp
          </h2>
          <p className="text-center text-jet-600 text-sm mb-8 md:hidden">
            Deslizá para ver más →
          </p>
          <div className="hidden md:block mb-8" />
          <ScreenshotCarousel items={screenshots} />
        </div>
      </section>

      {/* Características principales */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-jet">
              Todo lo que te ofrece KKapp
            </h2>
            <p className="text-jet-600 text-sm mt-2 max-w-lg mx-auto">
              Una solución rápida, confiable y comunitaria para encontrar sanitarios disponibles donde sea que estés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex flex-col p-5 rounded-2xl border border-gray-100 bg-mywhite hover:border-principal/30 hover:shadow-sm transition-all"
              >
                <div className="size-10 rounded-xl bg-principal-900 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-jet text-base mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-jet-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-6 py-16 bg-mywhite border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-jet text-center mb-10">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-principal/30 transition-all"
              >
                <div className="mt-0.5 shrink-0 size-10 rounded-xl bg-principal-900 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-jet mb-1">{step.title}</h3>
                  <p className="text-sm text-jet-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leyenda del mapa */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-jet text-center mb-2">
            ¿Qué significan los íconos del mapa?
          </h2>
          <p className="text-center text-jet-600 text-sm mb-10">
            Cada marcador en el mapa indica si el baño está abierto en este momento.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <div className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-mywhite">
              <div className="mt-0.5 shrink-0 size-10 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="relative flex size-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                  <span className="relative inline-flex rounded-full size-4 bg-green-500" />
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-jet mb-1">Verde — Abierto ahora</h3>
                <p className="text-sm text-jet-600 leading-relaxed">
                  El baño está dentro de su horario de atención. El marcador titila para ubicarlo velozmente.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-mywhite">
              <div className="mt-0.5 shrink-0 size-10 rounded-xl bg-red-50 flex items-center justify-center">
                <span className="relative inline-flex rounded-full size-4 bg-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-jet mb-1">Rojo — Cerrado ahora</h3>
                <p className="text-sm text-jet-600 leading-relaxed">
                  El baño se encuentra fuera de horario. Podés consultar sus datos para planificar a futuro.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-mywhite">
              <div className="mt-0.5 shrink-0 size-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="relative inline-flex rounded-full size-4 bg-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-jet mb-1">Gris — Horario desconocido</h3>
                <p className="text-sm text-jet-600 leading-relaxed">
                  Todavía no hay horarios cargados para este baño. Si los sabés, podés sugerirlos desde la app.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-mywhite items-start mb-12">
            <div className="mt-0.5 shrink-0 size-10 rounded-xl bg-principal-900 flex items-center justify-center">
              <span className="bg-white text-principal text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                PÚBLICO
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-jet mb-1">Etiqueta PÚBLICO</h3>
              <p className="text-sm text-jet-600 leading-relaxed">
                Los baños públicos llevan una pequeña etiqueta blanca &quot;PÚBLICO&quot; sobre el marcador, para distinguirlos de los de comercios.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-jet text-center mb-2">
            ¿Cómo funciona la búsqueda?
          </h2>
          <p className="text-center text-jet-600 text-sm mb-8">
            Al escribir en el buscador, obtenés resultados de tres fuentes simultáneamente.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-mywhite items-start">
              <div className="mt-0.5 shrink-0 size-9 rounded-xl bg-principal-900 flex items-center justify-center">
                <MapPin className="size-5 text-principal" />
              </div>
              <div>
                <h3 className="font-semibold text-jet mb-0.5">Spots</h3>
                <p className="text-sm text-jet-600 leading-relaxed">
                  Baños cargados en KKapp por la comunidad e importados desde OpenStreetMap. Tienen dirección, horarios, valoración y costo.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-mywhite items-start">
              <div className="mt-0.5 shrink-0 size-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <Globe className="size-5 text-jet-700" />
              </div>
              <div>
                <h3 className="font-semibold text-jet mb-0.5">Lugares</h3>
                <p className="text-sm text-jet-600 leading-relaxed">
                  Direcciones y localidades del mundo, con resultados de Google, para reubicar el mapa en una zona específica antes de explorar.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-mywhite items-start">
              <div className="mt-0.5 shrink-0 size-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Building2 className="size-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-jet mb-0.5">Cerca de aquí</h3>
                <p className="text-sm text-jet-600 leading-relaxed">
                  Comercios y puntos de interés próximos (estaciones, shoppings, locales), con resultados de Google. Disponible al compartir tu ubicación.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer — datos de fuentes públicas */}
          <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-8">
            <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Algunos baños provienen de fuentes públicas de datos abiertos (como OpenStreetMap) y están pendientes de verificación presencial: su información puede ser parcial o sufrir modificaciones. Si encontrás un error, podés sugerir una corrección fácilmente desde la app.
            </p>
          </div>
        </div>
      </section>

      {/* Descarga */}
      <section className="px-6 py-16 bg-mywhite border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="size-5 text-principal" />
              <span className="text-xs font-semibold text-principal tracking-widest uppercase">
                iPhone, Android y web
              </span>
            </div>
            <h2 className="text-2xl font-bold text-jet mb-3">Descargá KKapp</h2>
            <p className="text-jet-600 leading-relaxed mb-4">
              Ya está disponible en el App Store para iPhone. En Android llega pronto a Google Play.
            </p>
            <StoreBadges className="!justify-start" />
            <p className="text-xs text-jet-600 mt-4">
              Por ahora la cobertura principal está en Valencia, España, y sigue creciendo con cada aporte.
            </p>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
            <p className="text-sm font-semibold text-jet">En Android (Chrome):</p>
            <p className="text-sm text-jet-600">
              Mientras llega la app, instalá la versión web: tocá el menú → &quot;Instalar aplicación&quot;
            </p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-jet">
                Alternativa en iOS (Safari):
              </p>
              <p className="text-sm text-jet-600">
                Tocá Compartir → &quot;Agregar a la pantalla de inicio&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 bg-principal text-white text-center">
        <h2 className="text-2xl font-bold mb-3">¿Listo para empezar?</h2>
        <p className="mb-6 text-principal-800">
          Es gratis, sin anuncios y 100% colaborativa.
        </p>
        <StoreBadges variant="light" showWeb />
      </section>

      <AppFooter />
    </main>
  );
}


