# Plan de migración: imágenes de AWS S3 a Cloudflare R2

## Objetivo

Mover el almacenamiento de las imágenes de spots de AWS S3 a Cloudflare R2
para eliminar el costo de egress, sin cortar el servicio y sin URLs rotas
para los usuarios (web y PWA con imágenes cacheadas).

## Estado actual

| Pieza | Dónde | Qué hace hoy |
| --- | --- | --- |
| Subida | `hooks/use-spot-form.ts` (`buildFormData`) | Manda las imágenes como `files` (multipart) a `/api/proxy/baths...` |
| Proxy | `app/api/proxy/[...path]/route.ts` | Reenvía el multipart tal cual a `BACKEND_URL` |
| Almacenamiento | **Backend (otro repo)** | Sube a S3 y guarda la URL absoluta en `bath.images[].url` |
| Edición | `use-spot-form.ts` → `existingImages` | El frontend devuelve al backend las URLs que se conservan |
| Render | `next.config.mjs` `images.remotePatterns` | Permite `conpermiso-images[-prod].s3[.us-east-2].amazonaws.com` |
| Cache PWA | `next.config.mjs` `runtimeCaching` (`s3-images`) | `CacheFirst` 30 días para URLs de S3 |
| Legal | `app/privacy/page.tsx` | Dice que las fotos se guardan en "AWS S3" / "Amazon S3" |

Buckets conocidos: `conpermiso-images` (dev/staging) y `conpermiso-images-prod`
(prod), en `us-east-2`.

Consecuencia importante: **las URLs de S3 están guardadas en la base de datos**.
Hay que migrar los objetos y además las URLs guardadas.

## Decisiones

1. **Dominio propio para servir imágenes**: `images.conpermiso.com` (prod) e
   `images-dev.conpermiso.com` (dev), conectados al bucket R2 como *Custom
   Domain*. No usar `r2.dev` en producción (tiene rate limit y no usa la cache
   de Cloudflare).
2. **Mismas keys de objeto**: copiar los objetos con la misma key para que la
   reescritura de URLs sea solo un cambio de host.
3. **Base de URL configurable en el backend** (`PUBLIC_IMAGES_BASE_URL`), así un
   próximo cambio de proveedor no requiere tocar código.
4. **S3 queda en solo lectura** durante el período de convivencia; se borra
   recién al final.

## Fases

### Fase 0: preparación (sin impacto)

- [ ] Crear buckets R2 `conpermiso-images` y `conpermiso-images-prod`.
- [ ] Conectar los custom domains (`images-dev.` / `images.`) y verificar que
      un objeto de prueba responde 200 con el `Content-Type` correcto.
- [ ] Crear un API token de R2 con permiso *Object Read & Write* limitado a
      esos buckets. Guardarlo como secret del backend (`R2_ACCOUNT_ID`,
      `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`).
- [ ] Configurar CORS en R2 solo si alguna vez se sube directo desde el
      navegador (hoy no hace falta: sube el backend).
- [ ] Inventario: cantidad de objetos y tamaño total de cada bucket S3
      (`aws s3 ls s3://<bucket> --recursive --summarize`).

### Fase 1: frontend acepta ambos orígenes (este repo)

Se puede deployar antes que todo lo demás, no cambia el comportamiento.

- [ ] `next.config.mjs` → `images.remotePatterns`: agregar
      `images.conpermiso.com` e `images-dev.conpermiso.com` **sin quitar**
      los de S3.
- [ ] `next.config.mjs` → `runtimeCaching`: agregar una regla `CacheFirst`
      para `^https://images(-dev)?\.conpermiso\.com/.*`.
  - Nota: el regex actual de `s3-images`
    (`conpermiso-images\.s3\..*\.amazonaws\.com`) no matchea ni el bucket
    `-prod` ni el host sin región. Hoy esas imágenes no se cachean en la PWA.
    Con el dominio nuevo esto se resuelve solo.

### Fase 2: escritura dual en el backend

- [ ] Configurar el cliente S3 del SDK contra R2:
      ```ts
      new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      });
      ```
- [ ] Quitar cualquier `ACL: "public-read"` en `PutObject` (R2 no soporta ACLs;
      la visibilidad la da el custom domain). Mantener `ContentType` y agregar
      `CacheControl: "public, max-age=31536000, immutable"` (las keys no se
      reutilizan).
- [ ] Construir la URL pública con `PUBLIC_IMAGES_BASE_URL + "/" + key`.
- [ ] Durante la convivencia, **escribir en R2 y en S3** (o escribir solo en R2
      y que el paso de sync de la fase 3 cubra el resto). Recomendado: escribir
      solo en R2 detrás de un flag `STORAGE_PROVIDER=r2|s3` para poder volver
      atrás cambiando una variable.
- [ ] Borrado de imágenes (edición de spot): borrar según el host de la URL,
      porque va a haber URLs viejas (S3) y nuevas (R2) mezcladas hasta la fase 4.

### Fase 3: copia de objetos existentes

Opción A, **Super Slurper** (dashboard de R2 → *Data Migration*): copia
bucket a bucket desde S3 con credenciales de solo lectura. Es la opción más
simple y no paga egress de la máquina propia (AWS sí cobra egress de S3).

Opción B, **rclone** (si hace falta control fino o re-sync incremental):

```bash
rclone sync s3:conpermiso-images-prod r2:conpermiso-images-prod \
  --checksum --transfers 32 --progress
```

- [ ] Hacer la copia completa en dev y validar.
- [ ] Hacer la copia completa en prod.
- [ ] Verificar: mismo conteo de objetos y una muestra de hashes/tamaños.
- [ ] Re-sync incremental justo antes de la fase 4 para traer lo subido en el
      medio (si en la fase 2 se siguió escribiendo en S3).

### Fase 4: reescritura de URLs en la base

Las URLs viven en `baths.images[].url` (Mongo, backend). También revisar
avatares de usuario u otras colecciones que guarden URLs de S3.

- [ ] Backup / snapshot de la base.
- [ ] Script idempotente (corre en el backend):
      ```js
      const OLD = /^https:\/\/conpermiso-images-prod\.s3(\.us-east-2)?\.amazonaws\.com\//;
      const NEW = "https://images.conpermiso.com/";
      for await (const bath of db.baths.find({ "images.url": OLD })) {
        const images = bath.images.map((img) => ({ ...img, url: img.url.replace(OLD, NEW) }));
        await db.baths.updateOne({ _id: bath._id }, { $set: { images } });
      }
      ```
- [ ] Correr primero en modo dry-run (loguear cantidad de documentos y ejemplos).
- [ ] Verificar `db.baths.countDocuments({ "images.url": OLD }) === 0`.

Como el frontend manda `existingImages` con las URLs que tiene en pantalla, un
usuario que tenía el form de edición abierto durante la migración puede
reenviar URLs viejas. El backend debe normalizar (`replace(OLD, NEW)`) las URLs
de `existingImages` mientras dure la convivencia.

### Fase 5: convivencia y monitoreo (≈ 2 semanas)

- [ ] Monitorear en Sentry errores de `next/image` / 404 de imágenes.
- [ ] Revisar en el dashboard de R2 que las requests crecen y en AWS que las de
      S3 caen a ~0.
- [ ] S3 en solo lectura (bucket policy que niegue `PutObject`) para detectar
      cualquier escritura olvidada.

### Fase 6: limpieza

- [ ] Frontend (este repo):
  - quitar los hosts `*.amazonaws.com` de `images.remotePatterns`;
  - quitar la regla `s3-images` de `runtimeCaching`;
  - actualizar `app/privacy/page.tsx` (las dos menciones a "AWS S3" / "Amazon
    S3" → "Cloudflare R2"). **Hacerlo antes o junto con el corte de la fase 2**,
    porque la política de privacidad tiene que decir dónde se guardan los datos.
- [ ] Backend: quitar credenciales y SDK config de AWS, el flag `STORAGE_PROVIDER`
      y la normalización de `existingImages`.
- [ ] AWS: después de un período de retención acordado, vaciar y borrar los
      buckets y la IAM key.

## Rollback

| Fase | Cómo volver |
| --- | --- |
| 1 | Revertir el commit (solo agrega hosts permitidos). |
| 2 | `STORAGE_PROVIDER=s3` en el backend. |
| 3 | Nada que revertir (S3 sigue intacto). |
| 4 | Restaurar el backup o correr el script inverso (`NEW` → `OLD`); los objetos siguen existiendo en S3 hasta la fase 6. |
| 6 | No hay rollback después de borrar S3. Por eso va al final y con retención. |

## Riesgos

- **URLs hardcodeadas fuera de la base** (emails enviados, links compartidos,
  caches de la PWA): siguen funcionando mientras S3 exista. Al borrar S3 dejan de
  funcionar. Si hiciera falta, se pueden mantener con un redirect.
- **Costo de egress de AWS al copiar**: una sola vez, proporcional al tamaño
  total del bucket (ver el inventario de la fase 0).
- **Content-Type**: si un objeto se subió sin `ContentType`, R2 lo sirve como
  `application/octet-stream` y `lib/validation.ts` (`imageUrlSchema`, que hace
  `HEAD` y chequea `image/*`) lo rechazaría. Verificar en la muestra de la fase 3.

## Checklist de este repo

- [ ] Fase 1: `next.config.mjs` (remotePatterns + runtimeCaching para el dominio nuevo).
- [ ] Fase 2 (junto con el backend): `app/privacy/page.tsx`.
- [ ] Fase 6: quitar los hosts S3 y la regla `s3-images` de `next.config.mjs`.
