import Link from "next/link";
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
  Layers,
  Bookmark,
} from "lucide-react";
import AppFooter from "@/components/Footer";

const steps = [
  {
    icon: <MapPin className="size-6 text-principal" />,
    title: "1. Abrí la app",
    desc: "El mapa detecta automáticamente tu ubicación actual para mostrarte las opciones más cercanas.",
  },
  {
    icon: <Search className="size-6 text-principal" />,
    title: "2. Buscá un baño",
    desc: "Escribí una dirección o punto de interés. Los resultados incluyen spots de KKapp, lugares y comercios cercanos.",
  },
  {
    icon: <KeyRound className="size-6 text-principal" />,
    title: "3. Accedé sin contraseña",
    desc: "Creá tu cuenta gratis o iniciá sesión al instante recibiendo un código de 6 dígitos (OTP) en tu email.",
  },
  {
    icon: <ShieldCheck className="size-6 text-principal" />,
    title: "4. Sumate a la comunidad",
    desc: "Sugerí nuevos baños, guardá tus favoritos, calificá espacios y colaborá para mantener la información actualizada.",
  },
];

const features = [
  {
    icon: <Layers className="size-5 text-principal" />,
    title: "Mapa interactivo e inteligente",
    desc: "Visualizá el estado en tiempo real (abierto o cerrado) y navegá áreas con alta densidad mediante agrupación de marcadores (clustering).",
  },
  {
    icon: <KeyRound className="size-5 text-principal" />,
    title: "Ingreso sin contraseñas",
    desc: "Acceso simple y directo con códigos OTP enviados a tu email, garantizando máxima seguridad sin claves difíciles de recordar.",
  },
  {
    icon: <Globe className="size-5 text-principal" />,
    title: "Datos comunitarios y abiertos",
    desc: "Combinamos aportes de usuarios verificados con datos públicos de OpenStreetMap para ofrecer la cobertura más amplia posible.",
  },
  {
    icon: <Bookmark className="size-5 text-principal" />,
    title: "Guardados y favoritos",
    desc: "Organizá tu lista personal de baños frecuentes para acceder a ellos rápidamente en cualquier momento.",
  },
  {
    icon: <ShieldCheck className="size-5 text-principal" />,
    title: "Comunidad segura y moderada",
    desc: "Sistemas integrados para reportar datos obsoletos, moderar comentarios inapropiados y gestionar bloqueos.",
  },
  {
    icon: <Smartphone className="size-5 text-principal" />,
    title: "Experiencia Web y Móvil",
    desc: "Usala directamente en la web, instalala como PWA en tu pantalla de inicio o abrí enlaces integrados en las apps nativas.",
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
          en tiempo real, con horarios, opiniones y costos actualizados.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/"
            className="bg-principal text-white px-6 py-3 rounded-xl font-semibold hover:bg-principal-400 transition-all"
          >
            Abrir el mapa
          </Link>
          <Link
            href="/auth"
            className="border border-principal text-principal px-6 py-3 rounded-xl font-semibold hover:bg-principal-900 transition-all"
          >
            Crear cuenta gratis
          </Link>
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
            Cada marcador en el mapa indica el estado y la densidad de baños en la zona.
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
              <div className="mt-0.5 shrink-0 size-10 rounded-xl bg-principal-900 flex items-center justify-center">
                <span className="size-6 rounded-full bg-principal text-white text-xs font-bold flex items-center justify-center">
                  5+
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-jet mb-1">Azul — Grupo (Cluster)</h3>
                <p className="text-sm text-jet-600 leading-relaxed">
                  Agrupa varios baños cercanos. Hacé clic o acercá el zoom para desplegarlos individualmente.
                </p>
              </div>
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
                  Direcciones y localidades del mundo para reubicar el mapa en una zona específica antes de explorar.
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
                  Comercios y puntos de interés próximos (estaciones, shoppings, locales). Disponible al compartir tu ubicación.
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

      {/* PWA */}
      <section className="px-6 py-16 bg-mywhite border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="size-5 text-principal" />
              <span className="text-xs font-semibold text-principal tracking-widest uppercase">
                PWA e Integración Móvil
              </span>
            </div>
            <h2 className="text-2xl font-bold text-jet mb-3">
              Disponible en la web y en tu celular
            </h2>
            <p className="text-jet-600 leading-relaxed">
              Accedé a KKapp desde cualquier navegador web o instalala directamente en la pantalla de inicio de tu smartphone iOS o Android.
            </p>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
            <p className="text-sm font-semibold text-jet">En iOS (Safari):</p>
            <p className="text-sm text-jet-600">
              Tocá el botón compartir → "Agregar a la pantalla de inicio"
            </p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-jet">
                En Android (Chrome):
              </p>
              <p className="text-sm text-jet-600">
                Tocá el menú → "Instalar aplicación"
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
        <Link
          href="/"
          className="bg-white text-principal px-8 py-3 rounded-xl font-semibold hover:bg-mywhite transition-all inline-block"
        >
          Abrir el mapa →
        </Link>
      </section>

      <AppFooter />
    </main>
  );
}


