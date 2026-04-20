import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, ShieldCheck, Smartphone } from "lucide-react";
import AppFooter from "@/components/Footer";

const steps = [
  {
    icon: <MapPin className="size-6 text-principal" />,
    title: "Abrí la app",
    desc: "El mapa se centra automáticamente en tu ubicación actual.",
  },
  {
    icon: <Search className="size-6 text-principal" />,
    title: "Buscá un baño",
    desc: "Explorá el mapa o buscá por dirección. Filtrá por horario o costo.",
  },
  {
    icon: <Star className="size-6 text-principal" />,
    title: "Guardá tus favoritos",
    desc: "Creá una cuenta gratis para guardar los baños que más usás.",
  },
  {
    icon: <ShieldCheck className="size-6 text-principal" />,
    title: "Colaborá con la comunidad",
    desc: "Sugerí nuevos baños. El equipo los revisa y los aprueba.",
  },
];

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-mywhite flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 gap-6">
        <Image
          src="/longlogo_white.png"
          alt="KKapp logo"
          width={200}
          height={60}
          className="mb-2"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-jet leading-tight max-w-xl">
          Encontrá baños cerca tuyo,{" "}
          <span className="text-principal">cuando más lo necesitás.</span>
        </h1>
        <p className="text-jet-600 text-lg max-w-md">
          KKapp es una app colaborativa que te muestra baños públicos o privados
          en tiempo real, con horarios y costos actualizados por la comunidad.
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

      {/* Cómo funciona */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-jet text-center mb-10">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-mywhite hover:border-principal/30 transition-all"
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

      {/* PWA */}
      <section className="px-6 py-16 bg-mywhite border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="size-5 text-principal" />
              <span className="text-xs font-semibold text-principal tracking-widest uppercase">
                PWA instalable
              </span>
            </div>
            <h2 className="text-2xl font-bold text-jet mb-3">
              Instalala en tu celular
            </h2>
            <p className="text-jet-600 leading-relaxed">
              KKapp funciona como una app nativa en iOS y Android. Instalala
              desde el navegador en segundos — sin App Store, sin Google Play.
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
          Es gratis, sin anuncios y colaborativa.
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
