# Web catálogo de iPonce Store

Catálogo con carrito. El botón "Pedir por WhatsApp" abre tu WhatsApp con el pedido ya escrito.

## 1. Antes de publicar: pon tu número y tus precios

Abre `index.html` y busca el bloque **CONFIGURACIÓN** (cerca del final):

- `whatsapp: '51933493587'` → ya está tu número (933 493 587). Si cambias de número, pon 51 + el número nuevo, sin espacios.
- En `capacidades`, cambia `precio: null` por el precio en soles (ejemplo: `precio: 6499`). Si lo dejas en `null`, la web muestra "Consultar precio".

## 2. Publicarla gratis (la opción más fácil: Netlify Drop)

1. Entra a **https://app.netlify.com/drop** desde una computadora.
2. Arrastra la carpeta `docs` completa (o la carpeta que sale al descomprimir el ZIP).
3. En segundos te da un link, por ejemplo `https://iponce-store.netlify.app`. Crea una cuenta gratis para que no se borre y para cambiarle el nombre.

Para actualizarla: vuelve a arrastrar la carpeta en la sección "Deploys" de tu sitio.

## Otra opción: GitHub Pages
En el repositorio: Settings → Pages → Branch: la rama con estos archivos, carpeta `/docs` → Save. Es gratis si el repositorio es público.

## Agregar más productos
En `PRODUCTOS`, copia el bloque del iPhone 18 Pro Max y cambia nombre, colores, fotos (en la carpeta `img/`) y capacidades.

Pon el link de la web en la biografía de Instagram, TikTok y Facebook.
