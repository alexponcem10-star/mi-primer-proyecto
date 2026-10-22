// Anuncios en imagen para Facebook e Instagram: iPhone 18 Pro Max Borgoña y Glaciar a S/ 6,200, contraentrega o recojo.
// Usa las fotos de producto de la web (docs/img, fondo #f6f5f8) sobre el mismo fondo, para que no se note ningún recorte.
// Salida: feed 1080x1350 (4:5) y stories 1080x1920 (9:16), en PNG.
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/anuncios-imagen.mjs <carpeta-salida>
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const salida = resolve(process.argv[2] || '.');
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const FONTS = join(RAIZ, 'marca', 'fuente', 'fonts');
const IMG = (n) => pathToFileURL(join(RAIZ, 'docs', 'img', `${n}.webp`)).href;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', glaciar: '#8fb8e8', foto: '#f6f5f8' };
const OFERTA = { precio: 'S/ 6,200', centimos: '.00', capacidad: '256 GB', whatsapp: '933 493 587' };

const glifo = (letra, punto) => `<circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
  <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam) => `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}" style="flex:none"><rect width="1000" height="1000" rx="230" fill="${C.grafito}"/>${glifo('#fff', C.luz)}</svg>`;
const fontFace = ['Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');
const check = `<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const CSS = `${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;background:${C.foto};font-family:'InterD',sans-serif;color:${C.grafito};-webkit-font-smoothing:antialiased;overflow:hidden;position:relative}
.marca{position:absolute;left:56px;top:52px;display:flex;align-items:center;gap:14px;font-size:34px;font-weight:700;letter-spacing:-.02em}
.marca span{color:#86868b;font-weight:500;margin-left:-4px}
.sello{position:absolute;right:56px;top:56px;padding:12px 22px;border-radius:999px;background:${C.grafito};color:#fff;font-size:24px;font-weight:700;letter-spacing:.08em}
.cab{position:absolute;left:0;right:0;text-align:center}
.cab .et{font-size:30px;font-weight:700;color:${C.burgundy};letter-spacing:.02em}
.cab h1{font-size:96px;font-weight:900;letter-spacing:-.05em;line-height:1;margin-top:10px}
.cab p{font-size:40px;font-weight:600;color:#6e6e73;letter-spacing:-.02em;margin-top:14px}
.fotos{position:absolute;left:0;right:0;display:flex;justify-content:center;align-items:flex-end}
.fotos img{display:block}
.precio{position:absolute;left:56px;right:56px;padding:34px 40px 36px;border-radius:44px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.08),inset 0 0 0 1.5px rgba(0,0,0,.05);}
.precio .izq .et{font-size:28px;font-weight:700;color:#6e6e73}
.precio b{display:block;white-space:nowrap;font-size:120px;font-weight:900;letter-spacing:-.055em;line-height:1;margin-top:6px;background:linear-gradient(135deg,${C.grafito} 45%,${C.burgundy});-webkit-background-clip:text;background-clip:text;color:transparent}
.precio b small{font-size:58px;letter-spacing:-.03em}
.precio .der{display:flex;gap:12px;margin-top:20px}
.tag{display:flex;align-items:center;gap:12px;padding:14px 22px;border-radius:999px;background:${C.grafito};color:#fff;font-size:28px;font-weight:700;white-space:nowrap}
.tag i{width:34px;height:34px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center;flex:none}
.tag i svg{width:20px;height:20px}
.pie{position:absolute;left:56px;right:56px;display:flex;align-items:center;justify-content:space-between;font-size:30px;font-weight:700}
.wa{display:flex;align-items:center;gap:14px}
.wa i{width:18px;height:18px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
.pie small{font-size:22px;font-weight:500;color:#86868b}
.colores{display:flex;gap:12px;justify-content:center;margin-top:22px}
.colores span{display:flex;align-items:center;gap:10px;padding:10px 20px;border-radius:999px;background:#fff;font-size:28px;font-weight:700;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.08)}
.colores i{width:26px;height:26px;border-radius:50%}
.lista{position:absolute;left:56px;display:flex;flex-direction:column;gap:16px}
.lista div{display:flex;align-items:center;gap:18px;padding:18px 30px 18px 18px;border-radius:999px;background:#fff;font-size:38px;font-weight:700;letter-spacing:-.02em;box-shadow:0 10px 30px rgba(0,0,0,.06);width:max-content}
.lista i{width:52px;height:52px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center}
`;

const marca = `<div class="marca">${icono(64)}iPonce<span>Store</span></div><div class="sello">CAJA SELLADA</div>`;
const colores = (lista = ['Borgoña', 'Glaciar']) => `<div class="colores">${lista.map((c) => `<span><i style="background:${c === 'Borgoña' ? C.burgundy : C.glaciar}"></i>${c}</span>`).join('')}</div>`;
const precio = (top, sub) => `<div class="precio" style="top:${top}px">
  <div class="izq"><div class="et">${sub}</div><b>${OFERTA.precio}<small>${OFERTA.centimos}</small></b></div>
  <div class="der"><div class="tag"><i>${check}</i>Pago contraentrega</div><div class="tag"><i>${check}</i>O recojo</div></div></div>`;
const pie = (top) => `<div class="pie" style="top:${top}px"><div class="wa"><i></i>WhatsApp ${OFERTA.whatsapp}</div><small>Imágenes referenciales</small></div>`;
// "lado" trae dorso + costado: recortamos solo el dorso (x 195–585 de 1000)
const dorso = (color, alto, extra = '') => `<div style="height:${alto}px;width:${alto * 0.433}px;overflow:hidden;${extra}">
  <img src="${IMG(`${color}-lado`)}" style="height:${alto * 1.111}px;margin:-${alto * 0.056}px 0 0 -${alto * 0.217}px;filter:none"></div>`;

const ANUNCIOS = {
  // 1 · Los dos colores + precio
  'feed-1-precio-borgona-glaciar': { alto: 1350, html: `${marca}
    <div class="cab" style="top:150px"><div class="et">NUEVO</div><h1>iPhone 18 Pro Max</h1>${colores()}</div>
    <div class="fotos" style="top:400px;gap:30px">${dorso('borgona', 500, 'transform:rotate(-6deg)')}${dorso('glaciar', 500, 'transform:rotate(6deg)')}</div>
    ${precio(925, `iPhone 18 Pro Max · ${OFERTA.capacidad}`)}${pie(1262)}` },
  // 2 · Solo Borgoña
  'feed-2-borgona': { alto: 1350, html: `${marca}
    <div class="cab" style="top:150px"><div class="et" style="color:${C.burgundy}">● BORGOÑA</div><h1>Un color que<br>se nota.</h1></div>
    <div class="fotos" style="top:395px"><img src="${IMG('borgona-frente')}" style="height:560px"></div>
    ${precio(925, `iPhone 18 Pro Max Borgoña · ${OFERTA.capacidad}`)}${pie(1262)}` },
  // 3 · Solo Glaciar
  'feed-3-glaciar': { alto: 1350, html: `${marca}
    <div class="cab" style="top:150px"><div class="et" style="color:#3d6fa8">● GLACIAR</div><h1>Frío. Limpio.<br>Tuyo.</h1></div>
    <div class="fotos" style="top:395px"><img src="${IMG('glaciar-frente')}" style="height:560px"></div>
    ${precio(925, `iPhone 18 Pro Max Glaciar · ${OFERTA.capacidad}`)}${pie(1262)}` },
  // 4 · Confianza: cómo compras
  'feed-4-compra-segura': { alto: 1350, html: `${marca}
    <div class="cab" style="top:150px;text-align:left;padding-left:56px"><div class="et">COMPRA SEGURA</div><h1>Pagas cuando<br>lo recibes.</h1></div>
    <img src="${IMG('borgona-camara')}" style="position:absolute;right:-330px;top:390px;height:640px;-webkit-mask-image:linear-gradient(#000 72%,transparent 96%);mask-image:linear-gradient(#000 72%,transparent 96%)">
    <div class="lista" style="top:440px">
      ${['Caja sellada, 100% nuevo', 'Garantía iPonce', 'Pago contraentrega', 'O recojo coordinado'].map((t) => `<div><i>${check}</i>${t}</div>`).join('')}</div>
    ${precio(925, `iPhone 18 Pro Max · ${OFERTA.capacidad}`)}${pie(1262)}` },
  // Stories / Reels (9:16): textos lejos de las franjas de arriba y abajo
  'historia-1-precio': { alto: 1920, html: `<div style="position:absolute;inset:0;top:120px">${marca}</div>
    <div class="cab" style="top:300px"><div class="et">NUEVO</div><h1>iPhone 18<br>Pro Max</h1>${colores()}</div>
    <div class="fotos" style="top:690px;gap:34px">${dorso('borgona', 560, 'transform:rotate(-6deg)')}${dorso('glaciar', 560, 'transform:rotate(6deg)')}</div>
    ${precio(1290, `iPhone 18 Pro Max · ${OFERTA.capacidad}`)}${pie(1610)}` },
  'historia-2-compra-segura': { alto: 1920, html: `<div style="position:absolute;inset:0;top:120px">${marca}</div>
    <div class="cab" style="top:300px;text-align:left;padding-left:56px"><div class="et">COMPRA SEGURA</div><h1>Pagas cuando<br>lo recibes.</h1></div>
    <img src="${IMG('glaciar-camara')}" style="position:absolute;right:-380px;top:620px;height:720px;-webkit-mask-image:linear-gradient(#000 72%,transparent 96%);mask-image:linear-gradient(#000 72%,transparent 96%)">
    <div class="lista" style="top:660px">
      ${['Caja sellada, 100% nuevo', 'Garantía iPonce', 'Pago contraentrega', 'O recojo coordinado'].map((t) => `<div><i>${check}</i>${t}</div>`).join('')}</div>
    ${precio(1290, `iPhone 18 Pro Max · ${OFERTA.capacidad}`)}${pie(1610)}` },
};

const tmp = join(AQUI, '.tmp-anuncios-img');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(salida, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [nombre, { alto, html }] of Object.entries(ANUNCIOS)) {
    const f = join(tmp, `${nombre}.html`);
    writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}body{height:${alto}px}</style></head><body>${html}</body></html>`);
    const page = await browser.newPage({ viewport: { width: 1080, height: alto } });
    await page.goto(pathToFileURL(f).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: join(salida, `iponce-anuncio-${nombre}.png`) });
    await page.close();
    console.log('Listo:', nombre);
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
