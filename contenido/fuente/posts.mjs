// Genera las primeras publicaciones de iPonce Store (feed 1080x1350 e historias 1080x1920).
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/posts.mjs
// Las fotos reales se leen de contenido/fuente/fotos/ (cuadros sacados de tus videos; no se suben al repo).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, '..', 'posts');
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const FOTOS = join(AQUI, 'fotos');
const TMP = join(AQUI, '.tmp-posts');

const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', perla: '#f5f5f7', gris: '#6e6e73', azul: '#8fb8e8' };
const foto = (n) => pathToFileURL(join(FOTOS, n)).href;

// ---------- Piezas de marca ----------
const glifo = (letra, punto) => `<circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
  <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam, fondo, letra) =>
  `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}" style="flex:none"><rect width="1000" height="1000" rx="230" fill="${fondo}"/>${glifo(letra, C.burgundy)}</svg>`;

const I = {
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  escudo: '<path d="M12 2.8l8 3v6.2c0 5-3.4 8.2-8 9.4-4.6-1.2-8-4.4-8-9.4V5.8z"/><path d="M8.3 12.2l2.6 2.6 5-5"/>',
  sim: '<path d="M8 2.8h6.5L19 7.3v13.9H5V5.8z"/><rect x="8.3" y="11" width="7.4" height="6.6" rx="1.2"/><path d="M12 11v6.6M8.3 14.3h7.4"/>',
  camion: '<path d="M2.8 6.5h11v9.5h-11zM13.8 9.5h4.2l3.2 3.3v3.2h-7.4"/><circle cx="7" cy="17.6" r="1.9"/><circle cx="17.2" cy="17.6" r="1.9"/>',
  lupa: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/>',
  bateria: '<rect x="2.8" y="7" width="16" height="10" rx="2.4"/><path d="M21.2 10.5v3"/><path d="M6 10.2v3.6M9 10.2v3.6M12 10.2v3.6M15 10.2v3.6"/>',
  boleta: '<path d="M6 2.8h12v18.4l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  chat: '<path d="M4 5.5h16v11H10l-4.5 3.5v-3.5H4z"/><path d="M8 10h8M8 13h5"/>',
  imei: '<path d="M4 5v14M7 5v14M10.5 5v14M13 5v14M16.5 5v14M20 5v14"/>',
  qr: '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.6v2.6H14zM18 18h2.5v2.5H18zM14 19.5h2M19.5 14v2"/>',
  apple: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  caja: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
};
const ico = (n, tam = 44, color = 'currentColor', grosor = 2) =>
  `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round" style="flex:none">${I[n]}</svg>`;

// ---------- Estilos ----------
const fontFace = ['Regular', 'Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[400, 500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');

const CSS = `${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{overflow:hidden;font-family:'InterD',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.lienzo{position:relative;width:100%;height:100%;overflow:hidden;padding:84px 84px 0}
.oscuro{color:#fff;background:
  radial-gradient(ellipse 900px 700px at 85% 0%,${C.burgundy}66 0%,transparent 60%),
  radial-gradient(ellipse 700px 500px at 0% 100%,${C.burgundy}33 0%,transparent 70%),#0b0b0d}
.oscuro::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.5;
  background-image:radial-gradient(circle,#ffffff14 1.2px,transparent 1.4px);background-size:36px 36px;
  -webkit-mask:linear-gradient(180deg,#000,transparent 70%)}
.claro{color:${C.grafito};background:radial-gradient(ellipse 900px 600px at 100% 0%,${C.burgundy}14,transparent 60%),${C.perla}}
.top{position:relative;display:flex;align-items:center;justify-content:space-between;font-size:30px;font-weight:700;letter-spacing:-.02em}
.top .m{display:flex;align-items:center;gap:14px}
.top .m span{font-weight:500;opacity:.6;margin-left:-6px}
.top .n{font-size:26px;font-weight:600;letter-spacing:.08em;opacity:.55}
.chip{display:inline-flex;align-items:center;gap:12px;padding:12px 24px;border-radius:999px;font-size:26px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.oscuro .chip{background:${C.burgundy};color:#fff;box-shadow:0 0 40px ${C.burgundy}88}
.claro .chip{background:${C.burgundy}14;color:${C.burgundy}}
h1{font-weight:700;letter-spacing:-.048em;line-height:.98}
h1 em{font-style:normal;color:${C.luz}}
.claro h1 em{color:${C.burgundy}}
.p{font-size:40px;line-height:1.32;font-weight:500;letter-spacing:-.01em}
.oscuro .p{color:#c7c7cc}.claro .p{color:${C.gris}}
.p b{font-weight:700}.oscuro .p b{color:#fff}.claro .p b{color:${C.grafito}}
.pie{position:absolute;left:84px;right:84px;bottom:70px;display:flex;align-items:center;justify-content:space-between;font-size:28px;font-weight:600}
.oscuro .pie{color:#a1a1a6}.claro .pie{color:${C.gris}}
.desliza{display:flex;align-items:center;gap:14px;padding:16px 28px;border-radius:999px;font-weight:700}
.oscuro .desliza{background:#ffffff14;color:#fff}.claro .desliza{background:${C.grafito};color:#fff}
.btn{display:inline-flex;align-items:center;gap:16px;padding:26px 40px;border-radius:999px;font-size:36px;font-weight:700;letter-spacing:-.01em}
.oscuro .btn{background:#fff;color:${C.grafito}}.claro .btn{background:${C.grafito};color:#fff}
.btn i{width:16px;height:16px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
.pill{display:inline-flex;align-items:center;gap:12px;padding:16px 26px;border-radius:999px;font-size:30px;font-weight:600}
.oscuro .pill{background:#ffffff10;box-shadow:inset 0 0 0 1.5px #ffffff22}
.claro .pill{background:#fff;box-shadow:0 2px 0 #0000000a,inset 0 0 0 1.5px #0000000f}
.num{font-size:250px;font-weight:900;letter-spacing:-.07em;line-height:.8}
.claro .num{color:${C.burgundy}}
.caja-ico{width:120px;height:120px;border-radius:34px;display:flex;align-items:center;justify-content:center}
.oscuro .caja-ico{background:${C.burgundy};color:#fff;box-shadow:0 0 50px ${C.burgundy}88}
.claro .caja-ico{background:${C.grafito};color:#fff}
.tarjeta{border-radius:36px;padding:40px 44px}
.oscuro .tarjeta{background:#ffffff0c;box-shadow:inset 0 0 0 1.5px #ffffff1c}
.claro .tarjeta{background:#fff;box-shadow:0 20px 50px #0000000d,inset 0 0 0 1.5px #0000000a}
.centro{position:absolute;left:84px;right:84px;top:170px;bottom:170px;display:flex;flex-direction:column;justify-content:center}
.fantasma{position:absolute;right:-90px;bottom:90px;opacity:.06;color:${C.grafito};transform:rotate(-12deg)}
.ruta{display:inline-flex;align-items:center;gap:10px;font-size:32px;font-weight:700;padding:14px 22px;border-radius:18px}
.claro .ruta{background:${C.grafito};color:#fff}.oscuro .ruta{background:#fff;color:${C.grafito}}
`;

const pagina = (w, h, cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
html,body{width:${w}px;height:${h}px}</style></head><body>${cuerpo}
<script>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode().catch(()=>{}))]).then(()=>document.body.dataset.listo=1)</script></body></html>`;

const barra = (tema, n = '') => `<div class="top"><div class="m">${icono(52, tema === 'oscuro' ? '#fff' : C.grafito, tema === 'oscuro' ? C.grafito : '#fff')}iPonce <span>Store</span></div><div class="n">${n}</div></div>`;
const pie = (izq, der = '<div class="desliza">Desliza →</div>') => `<div class="pie"><div>${izq}</div>${der}</div>`;

// ---------- Publicaciones ----------
const piezas = [];
const feed = (archivo, tema, cuerpo) => piezas.push({ archivo, w: 1080, h: 1350, html: `<div class="lienzo ${tema}">${cuerpo}</div>` });
const historia = (archivo, tema, cuerpo) => piezas.push({ archivo, w: 1080, h: 1920, html: `<div class="lienzo ${tema}" style="padding-top:230px">${cuerpo}</div>` });

// 1. Lanzamiento de la marca
feed('01-lanzamiento/01-llego-iponce.png', 'oscuro', `
  ${barra('oscuro', 'LIMA · PERÚ')}
  <div style="position:absolute;right:-120px;top:170px;width:620px;height:620px;border-radius:50%;border:2px solid ${C.luz}44;box-shadow:0 0 120px ${C.luz}33,inset 0 0 80px ${C.luz}22"></div>
  <div style="position:absolute;right:30px;top:320px;filter:drop-shadow(0 30px 80px ${C.luz}66);transform:rotate(-8deg)">${icono(320, '#fff', C.grafito)}</div>
  <div style="position:relative;margin-top:120px"><span class="chip">Nuevo en Lima</span></div>
  <h1 style="position:relative;font-size:150px;margin-top:40px">Llegó<br>iPonce<br><em>Store.</em></h1>
  <p class="p" style="position:relative;margin-top:44px;max-width:840px">iPhone <b>originales</b> traídos de EE. UU., <b>verificados</b> uno por uno, con <b>garantía</b> y delivery en Lima.</p>
  <div style="position:relative;display:flex;gap:14px;margin-top:44px;flex-wrap:wrap">
    <div class="pill">${ico('escudo', 34, C.luz)}Garantía iPonce</div><div class="pill">${ico('camion', 34, C.luz)}Delivery</div><div class="pill">${ico('sim', 34, C.luz)}eSIM activada</div></div>
  ${pie('Síguenos para no perderte nada', '<div class="btn" style="font-size:30px;padding:20px 32px"><i></i>Escríbenos</div>')}`);

// 2. iPhone 18 Pro con foto real
feed('01-lanzamiento/02-iphone-18-pro.png', 'oscuro', `
  ${barra('oscuro', 'NUEVO')}
  <div style="position:relative;display:flex;gap:44px;margin-top:56px;align-items:stretch">
    <div style="flex:1;display:flex;flex-direction:column">
      <span class="chip" style="align-self:flex-start">iPhone 18 Pro</span>
      <h1 style="font-size:104px;margin-top:36px">Borgoña<br>o Azul.<br><em>Tú eliges.</em></h1>
      <p class="p" style="margin-top:34px;font-size:36px">La nueva generación ya está en Lima. Originales, con garantía y delivery.</p>
      <div style="display:flex;gap:18px;margin-top:40px">
        <div style="width:76px;height:76px;border-radius:50%;background:linear-gradient(145deg,#7a2236,#3f0f1b);box-shadow:0 0 0 4px #0b0b0d,0 0 0 7px #ffffff55"></div>
        <div style="width:76px;height:76px;border-radius:50%;background:linear-gradient(145deg,#b9d6f5,#6e9fd6);box-shadow:0 0 0 4px #0b0b0d,0 0 0 7px #ffffff55"></div>
      </div>
    </div>
    <div style="width:430px;height:900px;border-radius:44px;overflow:hidden;flex:none;box-shadow:0 0 0 2px #ffffff22,0 40px 90px #000c,0 0 120px ${C.burgundy}66">
      <img src="${foto('f-9.0.png')}" style="width:100%;height:100%;object-fit:cover;object-position:52% 40%">
    </div>
  </div>
  ${pie('Consulta disponibilidad por WhatsApp', '<div class="btn" style="font-size:30px;padding:20px 32px"><i></i>Pídelo</div>')}`);

// 3. Carrusel: 5 cosas antes de comprar
const C1 = 'carrusel-antes-de-comprar';
feed(`02-${C1}/01.png`, 'oscuro', `
  ${barra('oscuro', '01/07')}
  <div style="position:relative;margin-top:110px"><span class="chip">Guarda este post</span></div>
  <h1 style="position:relative;font-size:122px;margin-top:40px">Antes de pagar<br>por un iPhone,<br><em>revisa esto.</em></h1>
  <div style="position:relative;display:flex;align-items:flex-end;gap:30px;margin-top:60px">
    <div class="num" style="color:${C.luz}">5</div>
    <p class="p" style="font-size:44px;padding-bottom:14px">cosas que te evitan<br>una <b>estafa</b>.</p></div>
  ${pie('iPhone originales · Lima')}`);
const pasos = [
  ['imei', 'El IMEI coincide', 'El IMEI de la <b>caja</b> debe ser el mismo que el del <b>equipo</b>.', 'Ajustes › General › Información'],
  ['lupa', 'No tiene reportes', 'Verifica que el IMEI no esté reportado como <b>robado o perdido</b>. Un equipo reportado puede quedar <b>bloqueado</b>.', 'Consulta IMEI de OSIPTEL'],
  ['bateria', 'Batería al 100%', 'Un iPhone nuevo debe tener la <b>salud de batería al 100%</b>. Si tiene menos, ya fue usado.', 'Ajustes › Batería › Estado'],
  ['apple', 'Es original de Apple', 'Ingresa el número de serie en la web de Apple: te dice si es <b>original</b> y desde cuándo corre su garantía.', 'checkcoverage.apple.com'],
  ['boleta', 'Comprobante y garantía', 'Pide <b>boleta o factura</b> y una <b>garantía por escrito</b>. Si el vendedor no te da nada, desconfía.', 'Sin papeles, sin respaldo'],
];
pasos.forEach(([ic, t, d, ruta], k) => feed(`02-${C1}/0${k + 2}.png`, 'claro', `
  ${barra('claro', `0${k + 2}/07`)}
  <div class="fantasma">${ico(ic, 560, 'currentColor', 1.2)}</div>
  <div class="centro">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <div class="num" style="font-size:280px">0${k + 1}</div><div class="caja-ico" style="width:150px;height:150px;border-radius:42px">${ico(ic, 82, '#fff', 1.8)}</div></div>
  <h1 style="font-size:112px;margin-top:60px">${t}</h1>
  <p class="p" style="margin-top:38px;font-size:50px;max-width:900px">${d}</p>
  <div style="margin-top:56px"><span class="ruta" style="font-size:36px;padding:18px 28px">${ico(ic === 'apple' ? 'lupa' : 'check', 30, '#fff', 2.4)}${ruta}</span></div></div>
  ${pie('Antes de comprar un iPhone')}`));
feed(`02-${C1}/07.png`, 'oscuro', `
  ${barra('oscuro', '07/07')}
  <div style="position:relative;margin-top:110px">${icono(170, '#fff', C.grafito)}</div>
  <h1 style="position:relative;font-size:112px;margin-top:56px">En iPonce te<br>mostramos todo<br><em>antes de pagar.</em></h1>
  <p class="p" style="position:relative;margin-top:40px;font-size:42px">📌 Guarda este post y <b>compártelo</b> con quien va a comprar un iPhone.</p>
  ${pie('', '<div class="btn"><i></i>Escríbenos por WhatsApp</div>')}`);

// 4. Carrusel: eSIM
const C2 = 'carrusel-esim';
feed(`03-${C2}/01.png`, 'oscuro', `
  ${barra('oscuro', '01/06')}
  <div style="position:absolute;right:-170px;top:150px;opacity:.55;transform:rotate(14deg)">
    <div style="width:420px;height:560px;border-radius:60px;border:3px dashed ${C.luz};display:flex;align-items:center;justify-content:center;box-shadow:0 0 100px ${C.luz}33">${ico('sim', 260, C.luz, 1.1)}</div></div>
  <div style="position:relative;margin-top:110px"><span class="chip">Ojo con esto</span></div>
  <h1 style="position:relative;font-size:122px;margin-top:40px">¿Tu iPhone<br>de EE. UU.<br><em>no tiene chip?</em></h1>
  <p class="p" style="position:relative;margin-top:44px;font-size:46px;max-width:720px">Tranquilo. Te explicamos <b>todo</b> en 1 minuto.</p>
  ${pie('eSIM explicado')}`);
const esim = [
  ['sim', 'No es un error.', 'Desde el <b>iPhone 14</b>, los modelos de EE. UU. vienen <b>sin bandeja para chip</b>. Funcionan solo con <b>eSIM</b>.'],
  ['chat', '¿Qué es eSIM?', 'Es un <b>chip digital</b> que va dentro del iPhone. No se pierde, no se daña y puedes tener <b>más de una línea</b>.'],
  ['check', '¿Funciona en Perú?', '<b>Sí.</b> Claro, Movistar y Entel ya ofrecen eSIM. Puedes <b>mantener tu número</b>.'],
  ['qr', '¿Cómo se activa?', '<b>1.</b> Pides la eSIM a tu operador.<br><b>2.</b> Escaneas el código QR o la activas por su app.<br><b>3.</b> Listo: tu número en tu iPhone nuevo.'],
];
esim.forEach(([ic, t, d], k) => feed(`03-${C2}/0${k + 2}.png`, 'claro', `
  ${barra('claro', `0${k + 2}/06`)}
  <div class="fantasma">${ico(ic, 560, 'currentColor', 1.2)}</div>
  <div class="centro">
  <div class="caja-ico" style="width:190px;height:190px;border-radius:52px">${ico(ic, 104, '#fff', 1.8)}</div>
  <h1 style="font-size:120px;margin-top:70px">${t}</h1>
  <p class="p" style="margin-top:44px;font-size:54px;max-width:910px">${d}</p></div>
  ${pie('eSIM explicado')}`));
feed(`03-${C2}/06.png`, 'oscuro', `
  ${barra('oscuro', '06/06')}
  <div style="position:relative;margin-top:110px"><span class="chip">Solo en iPonce</span></div>
  <h1 style="position:relative;font-size:118px;margin-top:40px">Te lo entregamos<br>con la eSIM<br><em>activada.</em></h1>
  <p class="p" style="position:relative;margin-top:44px;font-size:44px">Tú solo lo prendes y <b>llamas</b>. Nosotros nos encargamos del resto.</p>
  ${pie('', '<div class="btn"><i></i>Escríbenos por WhatsApp</div>')}`);

// 5. Garantía iPonce
feed('04-garantia-iponce.png', 'oscuro', `
  ${barra('oscuro', 'TU TRANQUILIDAD')}
  <div style="position:relative;display:flex;align-items:center;gap:40px;margin-top:100px">
    <div style="width:210px;height:210px;border-radius:60px;background:${C.burgundy};display:flex;align-items:center;justify-content:center;box-shadow:0 0 90px ${C.burgundy}aa">${ico('escudo', 130, '#fff', 1.5)}</div>
    <h1 style="font-size:116px">Garantía<br><em>iPonce</em></h1></div>
  <p class="p" style="position:relative;margin-top:50px;font-size:44px">Cada iPhone sale con su <b>garantía por escrito</b>. Si algo pasa, respondemos.</p>
  <div class="tarjeta" style="position:relative;margin-top:50px;display:flex;flex-direction:column;gap:30px">
    ${['Equipo verificado antes de la entrega', 'IMEI revisado y sin reportes', 'Boleta o factura electrónica', 'Soporte por WhatsApp post-venta']
      .map((t) => `<div style="display:flex;align-items:center;gap:22px;font-size:38px;font-weight:600"><span style="width:52px;height:52px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center">${ico('check', 32, C.burgundy, 3)}</span>${t}</div>`).join('')}
  </div>
  ${pie('iPhone originales · Lima', '<div class="btn" style="font-size:30px;padding:20px 32px"><i></i>Escríbenos</div>')}`);

// 6. Comparativa
const filas = ['IMEI verificado frente a ti', 'Garantía por escrito', 'Boleta o factura', 'Entrega segura en Lima', 'eSIM activada', 'Soporte post-venta'];
feed('05-no-es-solo-el-precio.png', 'claro', `
  ${barra('claro', 'COMPARA')}
  <h1 style="font-size:104px;margin-top:50px">No es solo<br>el <em>precio.</em></h1>
  <div class="tarjeta" style="margin-top:40px;padding:0;overflow:hidden">
    <div style="display:grid;grid-template-columns:1fr 190px 190px;align-items:center;font-size:26px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${C.gris};padding:30px 40px 22px">
      <div></div><div style="text-align:center">Al azar</div><div style="text-align:center;color:${C.burgundy}">iPonce</div></div>
    ${filas.map((f, k) => `<div style="display:grid;grid-template-columns:1fr 190px 190px;align-items:center;padding:17px 40px;font-size:35px;font-weight:600;border-top:1.5px solid #0000000d">
      <div>${f}</div>
      <div style="display:flex;justify-content:center"><span style="width:58px;height:58px;border-radius:50%;background:#0000000a;display:flex;align-items:center;justify-content:center">${ico('x', 30, '#aeaeb2', 3)}</span></div>
      <div style="display:flex;justify-content:center"><span style="width:58px;height:58px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center">${ico('check', 32, '#fff', 3)}</span></div></div>`).join('')}
  </div>
  ${pie('Compra seguro, compra iPonce', '<div class="desliza" style="background:' + C.burgundy + '">Escríbenos</div>')}`);

// 7. Historias
historia('06-historias/01-encuesta-colores.png', 'oscuro', `
  <div style="position:absolute;inset:0"><img src="${foto('f-9.6.png')}" style="width:100%;height:100%;object-fit:cover;filter:brightness(.92)"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0b0b0dee 0%,#0b0b0d99 28%,transparent 45%,transparent 62%,#0b0b0dcc 100%)"></div>
  <div style="position:relative">${barra('oscuro', '')}</div>
  <h1 style="position:relative;font-size:120px;margin-top:60px">¿Borgoña<br>o <em style="color:${C.azul}">Azul?</em></h1>
  <p class="p" style="position:relative;margin-top:24px;font-size:42px;color:#fff">Vota 👇 y te mandamos el precio</p>`);
historia('06-historias/02-preguntame.png', 'oscuro', `
  ${barra('oscuro', '')}
  <div style="position:relative;margin-top:140px"><span class="chip">Caja de preguntas</span></div>
  <h1 style="position:relative;font-size:130px;margin-top:44px">Pregúntame<br>lo que quieras<br><em>sobre iPhone.</em></h1>
  <p class="p" style="position:relative;margin-top:44px;font-size:42px">Modelos, eSIM, precios, garantía… respondo todo en historias.</p>`);
historia('06-historias/03-escribenos.png', 'oscuro', `
  <div style="position:absolute;left:50%;top:330px;transform:translateX(-50%);filter:drop-shadow(0 40px 100px ${C.luz}88)">${icono(300, '#fff', C.grafito)}</div>
  <div style="position:absolute;left:0;right:0;top:720px;text-align:center;padding:0 70px">
    <h1 style="font-size:124px">¿Buscas<br>un iPhone<br><em>original?</em></h1>
    <p class="p" style="margin-top:44px;font-size:42px">Cotiza en minutos. Delivery en Lima.</p>
    <div class="btn" style="margin-top:70px;font-size:44px;padding:34px 56px"><i></i>Escríbenos por WhatsApp</div>
    <div style="display:flex;justify-content:center;gap:14px;margin-top:60px">
      <div class="pill">${ico('escudo', 32, C.luz)}Garantía</div><div class="pill">${ico('boleta', 32, C.luz)}Boleta</div><div class="pill">${ico('sim', 32, C.luz)}eSIM</div></div>
  </div>`);

// ---------- Render ----------
for (const f of ['f-9.0.png', 'f-9.6.png']) {
  if (!existsSync(join(FOTOS, f))) console.warn('Falta la foto', f, '(se verá vacío ese espacio)');
}
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [k, p] of piezas.entries()) {
    const f = join(TMP, `${k}.html`);
    writeFileSync(f, pagina(p.w, p.h, p.html));
    const page = await browser.newPage({ viewport: { width: p.w, height: p.h } });
    await page.goto(pathToFileURL(f).href);
    await page.waitForSelector('body[data-listo="1"]');
    const out = join(SALIDA, p.archivo);
    mkdirSync(dirname(out), { recursive: true });
    await page.screenshot({ path: out });
    await page.close();
  }
} finally {
  await browser.close();
  rmSync(TMP, { recursive: true, force: true });
}
console.log(`Listo: ${piezas.length} imágenes en ${SALIDA}`);
