import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  MapPin,
  User,
  Cookie,
  Share2,
  Trash2,
  Mail,
} from "lucide-react";
import AppFooter from "@/components/Footer";
import { APP_STORE_URL } from "@/lib/store";

export const metadata: Metadata = {
  title: "Política de Privacidad — KKapp",
  description:
    "Qué datos recolectamos en KKapp, cómo los usamos, con quién los compartimos y cuáles son tus derechos.",
};

const sections = [
  {
    icon: <User className="size-6 text-principal" />,
    title: "Datos que recolectamos",
    items: [
      {
        label: "Cuenta",
        desc: "Email, nombre y foto de perfil cuando iniciás sesión con Apple, con Google o con un código de 6 dígitos que te enviamos por email. Si usás \"Ocultar mi email\" con Apple, solo recibimos la dirección de reenvío que Apple nos da. También podés usar la app como invitado, sin cuenta.",
      },
      {
        label: "Ubicación",
        desc: "Solo mientras la app está en uso (en primer plano). Las coordenadas se envían a nuestro servidor únicamente para buscar baños cercanos y los de la zona visible del mapa. No se guardan en tu perfil ni se almacena un historial de ubicaciones.",
      },
      {
        label: "Fotos",
        desc: "Imágenes que subís voluntariamente al crear o editar un spot (hasta 5 por spot, de 5 MB cada una). Se almacenan en AWS S3. Usamos los permisos de cámara y galería solo cuando vos elegís hacerlo.",
      },
      {
        label: "Contenido que publicás",
        desc: "Los spots que agregás, tus calificaciones (de 1 a 5 estrellas), comentarios, sugerencias de edición y su estado (Mis Solicitudes), y los reportes de contenido inapropiado.",
      },
      {
        label: "Preferencias",
        desc: "Tu idioma (español o English) y tus spots guardados (Mis Guardados).",
      },
      {
        label: "Diagnóstico técnico",
        desc: "Los reportes de errores de Sentry pueden incluir tu dirección IP, el modelo de dispositivo, la versión del sistema operativo y tu ID de usuario cuando tenés la sesión iniciada. En la web también medimos visitas de forma anónima con Vercel Analytics, sin cookies.",
      },
    ],
  },
  {
    icon: <MapPin className="size-6 text-principal" />,
    title: "Para qué usamos tus datos",
    items: [
      {
        label: "Mostrarte el mapa",
        desc: "Tu ubicación se usa para centrar el mapa y ordenar los resultados por cercanía.",
      },
      {
        label: "Identificarte",
        desc: "Tu email y nombre se usan para que puedas guardar spots, hacer sugerencias y mantener tu historial.",
      },
      {
        label: "Enviarte emails",
        desc: "Te mandamos los códigos de inicio de sesión y avisos cuando un administrador aprueba o rechaza tus solicitudes, a través de Resend. No enviamos emails de marketing.",
      },
      {
        label: "Moderar la comunidad",
        desc: "Usamos los reportes y bloqueos de usuarios para mantener el contenido de la comunidad seguro y confiable.",
      },
      {
        label: "Mejorar la app",
        desc: "Usamos los diagnósticos de Sentry para detectar y corregir errores técnicos, como se describe arriba.",
      },
    ],
  },
  {
    icon: <Share2 className="size-6 text-principal" />,
    title: "Con quiénes compartimos tus datos",
    items: [
      {
        label: "Apple",
        desc: "Para Iniciar sesión con Apple y para Apple Maps, el mapa de la app en iPhone.",
      },
      {
        label: "Google",
        desc: "Para Google Sign-In, para Google Maps en Android y para la búsqueda de lugares (Google Places). El texto que buscás y tu ubicación aproximada pueden llegar a Google, que tiene su propia política de privacidad.",
      },
      {
        label: "AWS (Amazon S3)",
        desc: "Las fotos que subís se almacenan en Amazon S3.",
      },
      {
        label: "Mapbox",
        desc: "Proveedor del mapa de la versión web.",
      },
      {
        label: "Resend",
        desc: "Proveedor que usamos para el envío de emails.",
      },
      {
        label: "Sentry",
        desc: "Servicio de monitoreo de errores.",
      },
      {
        label: "Vercel",
        desc: "Hosting de la versión web y analíticas anónimas de visitas.",
      },
      {
        label: "OpenStreetMap",
        desc: "Importamos datos públicos de baños desde OpenStreetMap. Nunca le enviamos tus datos.",
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
        desc: "Podés hacerlo desde la app (Perfil → Configuración → \"Eliminar Cuenta\") o desde tu perfil en la web. La eliminación es inmediata. Borramos tu cuenta (email, nombre, foto y spots guardados) y tus bloqueos. Los spots, calificaciones, comentarios y solicitudes que publicaste se mantienen, pero quedan anonimizados y ya no están vinculados a vos. También podés pedirlo escribiéndonos a contacto@kkapp.es.",
      },
      {
        label: "Exportar tus datos",
        desc: "Podés pedir una copia de los datos asociados a tu cuenta escribiéndonos por email.",
      },
      {
        label: "Revocar permisos",
        desc: "Podés revocar los permisos de ubicación, cámara y fotos desde la configuración de tu dispositivo en cualquier momento. La app seguirá funcionando buscando una dirección manualmente.",
      },
      {
        label: "Reportar un problema",
        desc: "Desde la app (Perfil → \"Reportar un problema o sugerencia\") o por email.",
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
            src="/logo-lockup-3x.png"
            alt="KKapp logo"
            width={560}
            height={144}
            className="h-10 w-auto mb-2"
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
        <p className="text-jet-600 max-w-md">
          Aplica a la app de KKapp para iPhone (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-principal underline"
          >
            App Store
          </a>
          ), la próxima versión para Android y la web kkapp.es.
        </p>
        <p className="text-sm text-jet-700">
          Última actualización: noviembre 2026
        </p>
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
              <Cookie className="size-6 text-principal" />
            </div>
            <h2 className="text-2xl font-bold text-jet">
              Cookies y almacenamiento local
            </h2>
          </div>
          <p className="text-jet-600 leading-relaxed mb-4">
            <strong>Web:</strong> usamos cookies de sesión estrictamente
            necesarias para mantener tu sesión iniciada. Vercel Analytics mide
            visitas sin cookies de seguimiento. No usamos publicidad.
          </p>
          <p className="text-jet-600 leading-relaxed">
            <strong>App móvil:</strong> tu sesión se guarda cifrada en el
            dispositivo (SecureStore). El idioma, tus spots guardados y una
            caché del mapa para uso sin conexión se guardan en el
            almacenamiento local del dispositivo (AsyncStorage).
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
