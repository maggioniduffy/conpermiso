import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  MapPin,
  User,
  Image as ImageIcon,
  Share2,
  Trash2,
  Mail,
} from "lucide-react";
import AppFooter from "@/components/Footer";

const sections = [
  {
    icon: <User className="size-6 text-principal" />,
    title: "Datos que recolectamos",
    items: [
      {
        label: "Cuenta",
        desc: "Email y nombre cuando creás una cuenta o iniciás sesión con Google.",
      },
      {
        label: "Ubicación",
        desc: "Tu posición geográfica aproximada para mostrarte baños cercanos. Solo se usa mientras usás la app y nunca se almacena en nuestros servidores.",
      },
      {
        label: "Fotos",
        desc: "Imágenes que subís voluntariamente al crear o editar un spot. Se almacenan en servidores seguros (AWS S3).",
      },
      {
        label: "Spots y reseñas",
        desc: "El contenido que publicás en la app: baños que registrás, horarios, costos y comentarios.",
      },
    ],
  },
  {
    icon: <MapPin className="size-6 text-principal" />,
    title: "Para qué usamos tus datos",
    items: [
      {
        label: "Mostrarte el mapa",
        desc: "Tu ubicación se usa exclusivamente para centrar el mapa y ordenar resultados por cercanía.",
      },
      {
        label: "Identificarte",
        desc: "Tu email y nombre se usan para que puedas guardar spots, hacer sugerencias y mantener tu historial.",
      },
      {
        label: "Mejorar la app",
        desc: "Usamos Sentry para detectar errores técnicos. No incluye datos personales identificables.",
      },
    ],
  },
  {
    icon: <Share2 className="size-6 text-principal" />,
    title: "Con quiénes compartimos tus datos",
    items: [
      {
        label: "Google",
        desc: "Si iniciás sesión con Google, compartimos tu email con Google OAuth para autenticarte. Google tiene su propia política de privacidad.",
      },
      {
        label: "AWS",
        desc: "Las fotos que subís se almacenan en Amazon S3. No tienen acceso a tu cuenta ni a tu ubicación.",
      },
      {
        label: "Mapbox",
        desc: "Usamos Mapbox para el mapa y la búsqueda de lugares. Puede registrar consultas de geocodificación de forma anónima.",
      },
      {
        label: "Nadie más",
        desc: "No vendemos, alquilamos ni compartimos tus datos personales con terceros para publicidad.",
      },
    ],
  },
  {
    icon: <Trash2 className="size-6 text-principal" />,
    title: "Tus derechos",
    items: [
      {
        label: "Eliminar tu cuenta",
        desc: "Podés solicitar la eliminación completa de tu cuenta y todos tus datos en cualquier momento escribiéndonos a contacto@kkapp.es.",
      },
      {
        label: "Exportar tus datos",
        desc: "Podés pedir una copia de los datos asociados a tu cuenta.",
      },
      {
        label: "Revocar permisos",
        desc: "Podés revocar el permiso de ubicación desde la configuración de tu dispositivo en cualquier momento. La app seguirá funcionando con ubicación manual.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-mywhite flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 gap-6">
        <Link href="/welcome">
          <Image
            src="/longlogo_white.png"
            alt="KKapp logo"
            width={160}
            height={48}
            className="mb-2"
          />
        </Link>
        <div className="size-14 rounded-2xl bg-principal-900 flex items-center justify-center">
          <Shield className="size-7 text-principal" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-jet leading-tight max-w-xl">
          Política de <span className="text-principal">Privacidad</span>
        </h1>
        <p className="text-jet-600 text-lg max-w-md">
          Tu privacidad es importante para nosotros. Esta política explica qué
          datos recolectamos, cómo los usamos y cuáles son tus derechos.
        </p>
        <p className="text-sm text-jet-700">Última actualización: mayo 2026</p>
      </section>

      {/* Secciones */}
      {sections.map((section, i) => (
        <section
          key={i}
          className="px-6 py-16 border-t border-gray-100"
          style={{ backgroundColor: i % 2 === 0 ? "white" : undefined }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="size-10 rounded-xl bg-principal-900 flex items-center justify-center shrink-0">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-jet">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-4">
              {section.items.map((item, j) => (
                <div
                  key={j}
                  className="flex gap-4 p-5 rounded-2xl border border-gray-100 bg-mywhite hover:border-principal/30 transition-all"
                >
                  <div className="w-1 rounded-full bg-principal-800 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-jet mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-jet-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Cookies */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl bg-principal-900 flex items-center justify-center shrink-0">
              <ImageIcon className="size-6 text-principal" />
            </div>
            <h2 className="text-2xl font-bold text-jet">
              Cookies y almacenamiento local
            </h2>
          </div>
          <p className="text-jet-600 leading-relaxed mb-4">
            La versión web (PWA) usa cookies estrictamente necesarias para
            mantener tu sesión iniciada. No usamos cookies de seguimiento ni
            publicidad.
          </p>
          <p className="text-jet-600 leading-relaxed">
            La app móvil usa almacenamiento seguro del dispositivo (SecureStore)
            para guardar tu sesión de forma cifrada. Estos datos nunca salen de
            tu dispositivo salvo para autenticarte con nuestro servidor.
          </p>
        </div>
      </section>

      {/* Menores */}
      <section className="px-6 py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-jet mb-4">Menores de edad</h2>
          <p className="text-jet-600 leading-relaxed">
            KKapp no está dirigida a menores de 13 años. No recolectamos
            intencionalmente datos de menores. Si sos padre o tutor y creés que
            tu hijo creó una cuenta, contactanos para eliminarla.
          </p>
        </div>
      </section>

      {/* Cambios */}
      <section className="px-6 py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-jet mb-4">
            Cambios a esta política
          </h2>
          <p className="text-jet-600 leading-relaxed">
            Podemos actualizar esta política ocasionalmente. Si los cambios son
            significativos, te notificaremos por email o con un aviso en la app.
            La fecha de última actualización siempre estará visible al inicio de
            esta página.
          </p>
        </div>
      </section>

      {/* CTA contacto */}
      <section className="px-6 py-16 bg-principal text-white text-center">
        <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="size-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-3">¿Tenés preguntas?</h2>
        <p className="mb-6 text-principal-800">
          Escribinos y te respondemos a la brevedad.
        </p>
        <a
          href="mailto:contacto@kkapp.es"
          className="bg-white text-principal px-8 py-3 rounded-xl font-semibold hover:bg-mywhite transition-all inline-block"
        >
          contacto@kkapp.es
        </a>
      </section>

      <AppFooter />
    </main>
  );
}
