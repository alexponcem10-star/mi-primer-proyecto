// Publicaciones generales (no anuncios) para la página de Facebook e Instagram: información de los equipos y de iPonce.
// Sin precios: la venta va por anuncios. Diseño uniforme 1080x1350 (4:5) que alterna claro (fondo de las fotos, #f6f5f8)
// y oscuro (grafito con brillo borgoña) para que el perfil de Instagram se vea ordenado.
// Salida: contenido/posts-pagina/<nn-tema>/<nn>.png
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/posts-pagina.mjs [carpeta-salida]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const salida = resolve(process.argv[2] || join(RAIZ, 'contenido', 'posts-pagina'));
const FONTS = join(RAIZ, 'marca', 'fuente', 'fonts');
const IMG = (n) => pathToFileURL(join(RAIZ, 'docs', 'img', `${n}.webp`)).href;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', rosa: '#f3b6c3', glaciar: '#8fb8e8', negro: '#3a3a3e', plata: '#e3e3e6', foto: '#f6f5f8' };
const WHATSAPP = '933 493 587';

// ---------- Marca ----------
const glifo = (letra, punto) => `<circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
  <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam, fondo = C.grafito, letra = '#fff') => `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}" style="flex:none"><rect width="1000" height="1000" rx="230" fill="${fondo}"/>${glifo(letra, C.luz)}</svg>`;
const fontFace = ['Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');
const svg = (d, tam = 40, color = '#fff') => `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICO = {
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  caja: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  escudo: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',
  camion: '<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
  sim: '<path d="M7 3h7l4 4v14H7z"/><path d="M10 11h5v6h-5zM12.5 11v6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  dedo: '<path d="M12 3v9M8 8l4 4 4-4"/><path d="M5 15v4h14v-4"/>',
  boleta: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  avion: '<path d="m3 13 18-8-6 16-3-7z"/>',
};

const CSS = `${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;font-family:'InterD',sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden;position:relative}
.claro{background:${C.foto};color:${C.grafito}}
.oscuro{background:radial-gradient(ellipse 900px 700px at 50% 40%,#3a0f19 0%,#141416 62%,#0c0c0e 100%);color:#fff}
.top{position:absolute;left:64px;right:64px;top:58px;display:flex;align-items:center;justify-content:space-between}
.marca{display:flex;align-items:center;gap:14px;font-size:32px;font-weight:700;letter-spacing:-.02em}
.marca span{font-weight:500;opacity:.55;margin-left:-4px}
.pag{font-size:24px;font-weight:700;letter-spacing:.12em;padding:10px 18px;border-radius:999px}
.claro .pag{background:#fff;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.08)}
.oscuro .pag{background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16)}
.txt{position:absolute;left:64px;right:64px;z-index:2}
.centro{text-align:center}
.ceja{font-size:27px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
.claro .ceja{color:${C.burgundy}}.oscuro .ceja{color:${C.rosa}}
h1{font-size:92px;font-weight:900;letter-spacing:-.05em;line-height:1.02;margin-top:16px}
h1.xl{font-size:118px}
.p{font-size:36px;font-weight:500;line-height:1.38;letter-spacing:-.01em;margin-top:24px}
.claro .p{color:#6e6e73}.oscuro .p{color:#c7c7cc}
.grad{background:linear-gradient(135deg,#fff 35%,${C.rosa});-webkit-background-clip:text;background-clip:text;color:transparent}
.claro .grad{background:linear-gradient(135deg,${C.grafito} 40%,${C.burgundy});-webkit-background-clip:text;background-clip:text;color:transparent}
.enorme{font-size:300px;font-weight:900;letter-spacing:-.06em;line-height:.9}
.pie{position:absolute;left:64px;right:64px;bottom:56px;display:flex;align-items:center;justify-content:space-between;font-size:26px;font-weight:600}
.claro .pie{color:#86868b}.oscuro .pie{color:#8e8e93}
.desliza{display:flex;align-items:center;gap:12px;font-weight:700}
.claro .desliza{color:${C.grafito}}.oscuro .desliza{color:#fff}
.foto{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:flex-end}
.foto img{display:block}
.filas{display:flex;flex-direction:column;gap:20px}
.fila{display:flex;align-items:center;gap:26px;padding:26px 30px;border-radius:32px}
.claro .fila{background:#fff;box-shadow:0 12px 34px rgba(0,0,0,.05)}
.oscuro .fila{background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.1)}
.fila i{width:84px;height:84px;border-radius:26px;background:${C.burgundy};display:flex;align-items:center;justify-content:center;flex:none;font-style:normal;font-size:40px;font-weight:900;color:#fff}
.fila b{display:block;font-size:40px;font-weight:800;letter-spacing:-.025em}
.fila small{display:block;font-size:28px;font-weight:500;margin-top:4px;line-height:1.3}
.claro .fila small{color:#6e6e73}.oscuro .fila small{color:#aeaeb2}
.chips{display:flex;flex-wrap:wrap;gap:14px}
.chip{display:flex;align-items:center;gap:12px;padding:14px 24px;border-radius:999px;font-size:30px;font-weight:700}
.claro .chip{background:#fff;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.08)}
.oscuro .chip{background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16)}
.chip em{width:28px;height:28px;border-radius:50%;flex:none}
.pregunta{font-size:30px;font-weight:700;letter-spacing:.14em;color:${C.rosa}}
.linea{height:2px;margin:40px 0;opacity:.14;background:currentColor}
`;

// ---------- Piezas ----------
const top = (pag) => `<div class="top"><div class="marca">${icono(58)}iPonce<span>Store</span></div>${pag ? `<div class="pag">${pag}</div>` : ''}</div>`;
const pie = ({ izq = 'iPonce Store · Lima', der = '' } = {}) => `<div class="pie"><div>${izq}</div><div>${der}</div></div>`;
const desliza = (t = 'Desliza') => `<span class="desliza">${t} ${svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 30, 'currentColor')}</span>`;
const ref = 'Imágenes referenciales';
const recorte = (archivo, [x0, x1, y0, y1], alto, extra = '') => {
  const k = alto / (y1 - y0); // las fotos son cuadradas de 1000 px (o 1600x900 la de cámara)
  return `<div style="height:${alto}px;width:${(x1 - x0) * k}px;overflow:hidden;flex:none;${extra}"><img src="${IMG(archivo)}" style="height:${(archivo.endsWith('camara') ? 900 : 1000) * k}px;margin:-${y0 * k}px 0 0 -${x0 * k}px"></div>`;
};
const dorso = (color, alto, extra) => recorte(`${color}-lado`, [195, 585, 50, 950], alto, extra);
const fila = (i, b, s) => `<div class="fila"><i>${i}</i><div><b>${b}</b>${s ? `<small>${s}</small>` : ''}</div></div>`;
const chip = (t, color) => `<div class="chip">${color ? `<em style="background:${color}"></em>` : ''}${t}</div>`;
const n = (i, total) => `${String(i).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

// ---------- Publicaciones ----------
// Cada publicación: carpeta y lista de láminas { tema, html }
const POSTS = [
  { carpeta: '01-presentacion', laminas: [{ tema: 'claro', html: `${top()}
    <div class="txt centro" style="top:170px"><div class="ceja">Nuevo</div><h1 class="xl">iPhone 18<br>Pro Max</h1>
      <div class="p" style="margin-top:20px">El iPhone más avanzado, ahora en iPonce Store.</div></div>
    <div class="foto" style="top:640px">${recorte('borgona-frente', [130, 870, 50, 950], 600)}</div>
    ${pie({ der: ref })}` }] },

  { carpeta: '02-ficha-tecnica', laminas: [
    { tema: 'oscuro', html: `${top(n(1, 6))}
      <div class="txt" style="top:230px"><div class="ceja">Ficha técnica</div><h1 class="xl">Todo lo<br>que trae el<br><span class="grad">18 Pro Max.</span></h1>
        <div class="p">5 datos que tienes que conocer antes de elegir tu próximo iPhone.</div></div>
      ${pie({ izq: desliza(), der: 'iPonce Store · Lima' })}` },
    { tema: 'claro', html: `${top(n(2, 6))}
      <div class="txt" style="top:190px"><div class="ceja">Pantalla</div><div class="enorme grad" style="margin-top:20px">6,9″</div>
        <div class="p" style="max-width:500px">OLED de 120 Hz. La pantalla más grande de la línea, fluida y con brillo para ver todo bajo el sol.</div></div>
      <div class="foto" style="top:770px;left:560px;right:auto">${recorte('glaciar-frente', [130, 870, 50, 950], 500)}</div>
      ${pie({ der: ref })}` },
    { tema: 'oscuro', html: `${top(n(3, 6))}
      <div class="txt" style="top:250px"><div class="ceja">Chip</div><div class="enorme grad" style="margin-top:24px;font-size:250px">A20 Pro</div>
        <div class="p">El primer chip de iPhone fabricado en <b style="color:#fff">2 nanómetros</b>. Más velocidad para juegos, edición y apps exigentes, con menos consumo de batería.</div>
        <div class="linea"></div><div class="chips">${chip('Más rápido')}${chip('Más eficiente')}${chip('2 nm')}</div></div>
      ${pie()}` },
    { tema: 'claro', html: `${top(n(4, 6))}
      <div class="txt" style="top:190px"><div class="ceja">Cámara</div><div class="enorme grad" style="margin-top:20px">48 MP</div>
        <div class="p" style="max-width:540px">Con <b style="color:${C.grafito}">apertura variable</b> de ƒ/1.48 a ƒ/4: controlas cuánta luz entra, como en una cámara profesional.</div></div>
      <img src="${IMG('borgona-camara')}" style="position:absolute;right:-430px;top:560px;height:740px;-webkit-mask-image:linear-gradient(#000 75%,transparent 98%)">
      ${pie({ der: ref })}` },
    { tema: 'oscuro', html: `${top(n(5, 6))}
      <div class="txt" style="top:250px"><div class="ceja">Zoom óptico</div><div class="enorme grad" style="margin-top:24px">4x</div>
        <div class="p">Teleobjetivo de 48 MP con zoom óptico 4x y hasta 8x con calidad óptica. Retratos, conciertos y detalles lejanos, sin perder nitidez.</div>
        <div class="linea"></div><div class="chips">${chip('Zoom óptico 4x')}${chip('Hasta 8x calidad óptica')}</div></div>
      ${pie()}` },
    { tema: 'claro', html: `${top(n(6, 6))}
      <div class="txt" style="top:190px"><div class="ceja">Almacenamiento</div><h1 style="font-size:150px;margin-top:20px" class="grad">Hasta 2 TB</h1>
        <div class="p">Elige el espacio que necesitas:</div></div>
      <div class="txt filas" style="top:640px">
        ${fila('256', '256 GB', 'Para fotos, apps y redes')}${fila('512', '512 GB', 'Si grabas mucho video')}${fila('1', '1 TB', 'Para creadores de contenido')}${fila('2', '2 TB', 'El máximo, sin límites')}</div>
      ${pie({ der: '¿Dudas? Escríbenos' })}` },
  ] },

  { carpeta: '03-colores', laminas: [
    { tema: 'claro', html: `${top(n(1, 5))}
      <div class="txt centro" style="top:170px"><div class="ceja">Colores</div><h1>Cuatro colores.<br>Uno es el tuyo.</h1></div>
      <div class="foto" style="top:560px;gap:18px">${['borgona', 'glaciar', 'negro', 'plata'].map((c, k) => dorso(c, 520, `transform:translateY(${[0, 30, 0, 30][k]}px)`)).join('')}</div>
      ${pie({ izq: desliza(), der: ref })}` },
    ...[['borgona', 'Borgoña', C.burgundy, 'Intenso y elegante. El color que más se nota, y el de nuestra marca.'],
      ['glaciar', 'Glaciar', C.glaciar, 'Un azul frío y limpio que cambia con la luz.'],
      ['negro', 'Negro', C.negro, 'Sobrio y clásico. Nunca pasa de moda.'],
      ['plata', 'Plata', '#c9c9ce', 'Luminoso y minimalista, con acabado brillante.']].map(([f, nombre, color, txt], k) => ({ tema: 'claro', html: `${top(n(k + 2, 5))}
      <div class="txt" style="top:180px"><div class="chips">${chip(nombre, color)}</div><h1 style="margin-top:26px">${nombre}.</h1>
        <div class="p" style="max-width:820px;margin-top:16px">${txt}</div></div>
      <div class="foto" style="top:610px">${recorte(`${f}-frente`, [130, 870, 50, 950], 580)}</div>
      ${pie({ der: ref })}` })),
  ] },

  { carpeta: '04-quienes-somos', laminas: [{ tema: 'oscuro', html: `${top()}
    <div class="txt centro" style="top:190px"><div style="display:inline-block;filter:drop-shadow(0 30px 80px ${C.luz}88)">${icono(200, '#fff', C.grafito)}</div>
      <div class="ceja" style="margin-top:44px">Quiénes somos</div><h1>Somos <span class="grad">iPonce Store.</span></h1>
      <div class="p" style="margin:26px auto 0;max-width:860px">Traemos iPhone nuevos desde Estados Unidos y te los entregamos en Lima, en su caja sellada y con garantía por escrito. Sin vueltas y con alguien que responde antes y después de tu compra.</div></div>
    <div class="txt" style="top:960px"><div class="chips" style="justify-content:center">${chip('Originales')}${chip('Caja sellada')}${chip('Garantía iPonce')}${chip('Delivery en Lima')}${chip('Ayuda con tu eSIM')}</div></div>
    ${pie({ der: 'Vendedor independiente, no afiliado a Apple' })}` }] },

  { carpeta: '05-como-comprar', laminas: [
    { tema: 'claro', html: `${top(n(1, 5))}
      <div class="txt" style="top:200px"><div class="ceja">Cómo comprar</div><h1 class="xl">Tu iPhone<br>en 4 pasos.</h1>
        <div class="p">Simple, seguro y por WhatsApp.</div></div>
      <div class="foto" style="top:720px;left:420px;right:auto">${dorso('borgona', 560, 'transform:rotate(-8deg)')}</div>
      ${pie({ izq: desliza(), der: ref })}` },
    ...[['1', 'Elige', 'Modelo, color y capacidad. Puedes verlo en nuestra web o preguntarnos por WhatsApp.', ICO.dedo],
      ['2', 'Escríbenos', 'Te confirmamos disponibilidad y coordinamos la entrega: delivery en Lima o recojo.', ICO.chat],
      ['3', 'Paga y recíbelo', 'Pagas cuando lo recibes, con efectivo, Yape, Plin o transferencia. Luego abres tu caja sellada.', ICO.caja],
      ['4', 'Actívalo', 'Te ayudamos a activar tu eSIM. Y seguimos contigo después de la compra.', ICO.sim]].map(([num, t, d, ico], k) => ({ tema: k % 2 ? 'claro' : 'oscuro', html: `${top(n(k + 2, 5))}
      <div class="txt" style="top:220px"><div class="enorme grad" style="font-size:420px">${num}</div>
        <div style="margin-top:30px;width:110px;height:110px;border-radius:32px;background:${C.burgundy};display:flex;align-items:center;justify-content:center">${svg(ico, 58)}</div>
        <h1 style="margin-top:36px">${t}.</h1><div class="p" style="max-width:880px">${d}</div></div>
      ${pie(k === 3 ? { der: `WhatsApp ${WHATSAPP}` } : {})}` })),
  ] },

  { carpeta: '06-camara', laminas: [{ tema: 'claro', html: `${top()}
    <div class="txt" style="top:170px"><div class="ceja">Cámara</div><h1>La luz,<br>bajo tu control.</h1>
      <div class="p" style="max-width:600px">La apertura variable deja entrar más luz de noche (ƒ/1.48) o enfoca todo nítido de día (ƒ/4).</div></div>
    <img src="${IMG('glaciar-camara')}" style="position:absolute;right:-420px;top:560px;height:760px;-webkit-mask-image:linear-gradient(#000 80%,transparent 99%)">
    <div class="txt" style="top:1010px;right:auto"><div class="chips" style="flex-direction:column;align-items:flex-start">${chip('ƒ/1.48 · más luz de noche')}${chip('ƒ/4 · todo nítido')}</div></div>
    ${pie({ der: ref })}` }] },

  { carpeta: '07-caja-sellada', laminas: [{ tema: 'oscuro', html: `${top()}
    <div class="txt" style="top:220px"><div style="width:130px;height:130px;border-radius:38px;background:${C.burgundy};display:flex;align-items:center;justify-content:center">${svg(ICO.caja, 72)}</div>
      <div class="ceja" style="margin-top:50px">Nuestra regla</div><h1 class="xl">La caja<br><span class="grad">la abres tú.</span></h1>
      <div class="p" style="max-width:880px">Todos nuestros iPhone llegan nuevos, en su caja sellada. Nadie la abre antes que tú: así sabes que estrenas de verdad.</div></div>
    <div class="txt" style="top:1060px"><div class="chips">${chip('100% nuevo')}${chip('Sellado')}${chip('Garantía iPonce')}</div></div>
    ${pie()}` }] },

  { carpeta: '08-esim', laminas: [
    { tema: 'oscuro', html: `${top(n(1, 3))}
      <div class="txt" style="top:230px"><div style="width:130px;height:130px;border-radius:38px;background:${C.burgundy};display:flex;align-items:center;justify-content:center">${svg(ICO.sim, 72)}</div>
        <div class="ceja" style="margin-top:50px">Lo que debes saber</div><h1 class="xl">¿Y la<br><span class="grad">eSIM?</span></h1>
        <div class="p">El iPhone 18 Pro Max de Estados Unidos funciona solo con eSIM. Te explicamos qué significa.</div></div>
      ${pie({ izq: desliza() })}` },
    { tema: 'claro', html: `${top(n(2, 3))}
      <div class="txt" style="top:200px"><div class="ceja">¿Qué es?</div><h1>Tu chip,<br>pero digital.</h1>
        <div class="p">La eSIM es un chip que ya viene dentro del teléfono. Tu línea y tu número se guardan ahí, sin tarjeta física.</div></div>
      <div class="txt filas" style="top:760px">
        ${fila(svg(ICO.check, 44), 'No se pierde ni se daña', 'No hay chip que sacar ni bandeja que abrir')}
        ${fila(svg(ICO.check, 44), 'Funciona en Perú', 'Los principales operadores ya trabajan con eSIM')}</div>
      ${pie()}` },
    { tema: 'oscuro', html: `${top(n(3, 3))}
      <div class="txt" style="top:230px"><div class="ceja">Tranquilo</div><h1 class="xl">Te ayudamos<br>a <span class="grad">activarla.</span></h1>
        <div class="p">Cuando recibes tu iPhone, te guiamos paso a paso para activar tu eSIM con tu operador. Si tienes dudas, nos escribes.</div></div>
      <div class="txt" style="top:1040px"><div class="chips">${chip('Paso a paso')}${chip('Por WhatsApp')}${chip('Desde tu casa')}</div></div>
      ${pie({ der: `WhatsApp ${WHATSAPP}` })}` },
  ] },

  { carpeta: '09-preguntas-frecuentes', laminas: [
    { tema: 'claro', html: `${top(n(1, 6))}
      <div class="txt" style="top:220px"><div class="ceja">Preguntas frecuentes</div><h1 class="xl">Lo que más<br>nos preguntan.</h1>
        <div class="p">Respuestas claras, sin letra pequeña.</div></div>
      <div class="foto" style="top:800px;left:560px;right:auto">${dorso('borgona', 500, 'transform:rotate(8deg)')}</div>
      ${pie({ izq: desliza() })}` },
    ...[['¿Son originales?', 'Sí. Son iPhone nuevos, importados de Estados Unidos, en su caja sellada.', ICO.escudo],
      ['¿Tienen garantía?', 'Sí. Te entregamos la Garantía iPonce por escrito junto con tu equipo.', ICO.boleta],
      ['¿Cómo pago?', 'Pagas cuando lo recibes o al recogerlo: efectivo, Yape, Plin o transferencia. También emitimos boleta o factura electrónica.', ICO.check],
      ['¿Hacen delivery?', 'Sí, en Lima. También puedes recogerlo coordinando con nosotros por WhatsApp.', ICO.camion],
      ['¿Por qué de EE. UU.?', 'Es donde se lanzan primero. La versión de EE. UU. usa eSIM, y te ayudamos a activarla.', ICO.avion]].map(([q, a, ico], k) => ({ tema: k % 2 ? 'claro' : 'oscuro', html: `${top(n(k + 2, 6))}
      <div class="txt" style="top:330px"><div style="width:120px;height:120px;border-radius:36px;background:${C.burgundy};display:flex;align-items:center;justify-content:center">${svg(ico, 64)}</div>
        <div class="pregunta" style="margin-top:56px;${k % 2 ? `color:${C.burgundy}` : ''}">PREGUNTA ${k + 1}</div><h1>${q}</h1>
        <div class="linea"></div><div class="p" style="font-size:42px;margin-top:0">${a}</div></div>
      ${pie(k === 4 ? { der: `WhatsApp ${WHATSAPP}` } : {})}` })),
  ] },
];

// ---------- Render ----------
const tmp = join(AQUI, '.tmp-posts-pagina');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const { carpeta, laminas } of POSTS) {
    const dir = join(salida, carpeta);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const [i, { tema, html }] of laminas.entries()) {
      const f = join(tmp, 'p.html');
      writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body class="${tema}">${html}</body></html>`);
      await page.goto(pathToFileURL(f).href);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: join(dir, `${String(i + 1).padStart(2, '0')}.png`) });
    }
    console.log('Listo:', carpeta, `(${laminas.length})`);
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
