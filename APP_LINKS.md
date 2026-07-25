# Android App Links (kkapp.es)

## Qué hay en este repo

- [public/.well-known/assetlinks.json](public/.well-known/assetlinks.json) — Digital Asset Links para `com.fausmaggioni.mobile`, firmado con el certificado de Play App Signing. Se sirve estático desde `/.well-known/assetlinks.json` con `Content-Type: application/json` (headers en [next.config.mjs](next.config.mjs)).
- [components/AppLinkBanner.tsx](components/AppLinkBanner.tsx) — banner "Abrir en la app" para Android, con opción de seguir en el navegador (dismiss guardado 7 días en `localStorage` bajo `kkapp_dismiss_app_banner`).

## Pendiente en el repo mobile (no tocar desde acá)

En `mobile/app.config.ts`, dentro de `android`, agregar:

```ts
intentFilters: [
  {
    action: "VIEW",
    autoVerify: true, // requerido para que Android verifique el assetlinks.json
    data: [{ scheme: "https", host: "kkapp.es" }],
    category: ["BROWSABLE", "DEFAULT"],
  },
],
```

Después de publicar el build, verificar con:

```bash
adb shell pm verify-app-links --re-verify com.fausmaggioni.mobile
adb shell pm get-app-links com.fausmaggioni.mobile
```

O probar el endpoint de Google:
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://kkapp.es&relation=delegate_permission/common.handle_all_urls
