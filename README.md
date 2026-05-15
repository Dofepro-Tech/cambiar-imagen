# Cambiar Imagen

Aplicacion web para convertir y comprimir imagenes directamente en el navegador. No requiere backend, Firebase ni claves API para funcionar.

## Desarrollo local

Prerequisito: Node.js

1. Instala dependencias con `npm install`
2. Inicia el entorno local con `npm run dev`

## Produccion

1. Genera la build con `npm run build`
2. Revisa el resultado con `npm run preview`

## Despliegue en Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Variables de entorno: ninguna

Pasos recomendados:

1. Sube el repositorio a GitHub.
2. En Cloudflare Pages crea un proyecto nuevo conectando ese repositorio.
3. Usa `npm run build` como comando de build y `dist` como directorio de salida.
4. Publica primero con el subdominio gratuito de Cloudflare.
5. Cuando el sitio ya cargue bien, conecta tu dominio propio.
6. Da de alta el dominio en Google Search Console para que empiece a indexarse por nombre.

Archivos ya preparados para este flujo:

- `public/privacy.html`
- `public/robots.txt`
- `public/ads.txt`
- `public/_headers`

## Despliegue en GitHub Pages

Este proyecto tambien queda compatible con despliegue bajo subruta. Si compilas manualmente, usa una base con el nombre del repositorio.

PowerShell:

```powershell
$env:VITE_BASE_PATH = "/nombre-del-repo/"
npm run build
Remove-Item Env:VITE_BASE_PATH
```

## Publicidad mas adelante

1. Crea un dominio propio antes de solicitar AdSense.
2. Manten visible la politica de privacidad desde el footer.
3. Cuando Google te apruebe, reemplaza el contenido de `public/ads.txt` con tu publisher ID real.
4. Si despues integras anuncios o analitica, actualiza tambien `public/privacy.html`.
