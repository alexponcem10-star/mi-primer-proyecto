// Flyer (1080x1350) del iPhone 18 Pro Max 256 GB solo en Borgoña, a S/ 5,799: foto principal (frente y dorso)
// y primer plano de las cámaras, sobre el mismo fondo de las fotos para que no se note ningún recorte.
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/flyer-borgona.mjs [salida.png]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const salida = resolve(process.argv[2] || join(RAIZ, 'marca', 'flyers', 'flyer-borgona-5799-1080x1350.png'));
const FONTS = join(RAIZ, 'marca', 'fuente', 'fonts');
const IMG = (n) => pathToFileURL(join(RAIZ, 'docs', 'img', `${n}.webp`)).href;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', glaciar: '#8fb8e8', foto: '#f6f5f8' };
const W = 1080, H = 1350;

const glifo = (letra, punto) => `<circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
  <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam) => `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}" style="flex:none"><rect width="1000" height="1000" rx="230" fill="${C.grafito}"/>${glifo('#fff', C.luz)}</svg>`;
const fontFace = ['Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');
// Recorte de una foto: [x0, x1, y0, y1] en px de la foto original (alto de la foto: 1000, o 900 la de cámaras)
const recorte = (archivo, [x0, x1, y0, y1], alto, altoFoto = 1000) => {
  const k = alto / (y1 - y0);
  return `<div style="height:${alto}px;width:${Math.round((x1 - x0) * k)}px;overflow:hidden"><img src="${IMG(archivo)}" style="height:${altoFoto * k}px;margin:-${y0 * k}px 0 0 -${x0 * k}px"></div>`;
};
const check = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:${C.foto};font-family:'InterD',sans-serif;color:${C.grafito};-webkit-font-smoothing:antialiased;overflow:hidden;position:relative}
.marca{position:absolute;left:0;right:0;top:64px;display:flex;justify-content:center;align-items:center;gap:16px;font-size:38px;font-weight:700;letter-spacing:-.02em}
.marca span{color:#86868b;font-weight:500;margin-left:-6px}
.cab{position:absolute;left:0;right:0;top:170px;text-align:center}
.hola{font-size:36px;font-weight:700;color:${C.burgundy};letter-spacing:-.01em}
h1{font-size:104px;font-weight:900;letter-spacing:-.055em;line-height:1;margin-top:12px}
.sub{font-size:40px;font-weight:600;color:#6e6e73;margin-top:14px;letter-spacing:-.02em}
.heroe{position:absolute;left:70px;top:425px}
.detalle{position:absolute;right:64px;top:425px;width:430px;border-radius:32px;overflow:hidden;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.08),inset 0 0 0 1.5px rgba(0,0,0,.05)}
.detalle p{padding:16px 22px 18px;font-size:26px;font-weight:700;letter-spacing:-.01em}
.detalle p span{display:block;font-size:22px;font-weight:500;color:#6e6e73;margin-top:2px}
.datos{position:absolute;right:64px;top:845px;width:430px;display:flex;gap:12px}
.datos div{flex:1;padding:14px 16px;border-radius:24px;background:#fff;text-align:center;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.06)}
.datos b{display:block;white-space:nowrap;font-size:34px;font-weight:900;letter-spacing:-.04em;color:${C.burgundy}}
.datos span{font-size:20px;font-weight:600;color:#6e6e73}
.color{display:inline-flex;align-items:center;gap:12px;padding:10px 22px;border-radius:999px;background:#fff;font-size:30px;font-weight:700;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.08)}
.color i{width:26px;height:26px;border-radius:50%}
.precio{position:absolute;left:56px;right:56px;top:1000px;padding:30px 40px;border-radius:44px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.08),inset 0 0 0 1.5px rgba(0,0,0,.05);display:flex;align-items:center;justify-content:center;gap:64px}
.precio b{padding-right:.1em;margin-right:-.1em;font-size:112px;font-weight:900;letter-spacing:-.055em;line-height:1;white-space:nowrap;background:linear-gradient(135deg,${C.grafito} 45%,${C.burgundy});-webkit-background-clip:text;background-clip:text;color:transparent}
.precio b small{font-size:52px;margin-left:.1em;letter-spacing:-.02em}
.lista{display:flex;flex-direction:column;gap:10px}
.lista div{display:flex;align-items:center;gap:12px;font-size:30px;font-weight:700;white-space:nowrap}
.lista i{width:38px;height:38px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center}
.pie{position:absolute;left:56px;right:56px;top:1262px;display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:700}
.pie .wa{display:flex;align-items:center;gap:14px}
.pie .wa i{width:16px;height:16px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
.pie small{font-size:22px;color:#86868b;font-weight:500}
</style></head><body>
  <div class="marca">${icono(64)}iPonce<span>Store</span></div>
  <div class="cab"><div class="color"><i style="background:${C.burgundy}"></i>Borgoña</div><h1>iPhone 18 Pro Max</h1><div class="sub">256 GB · Nuevo y en caja sellada</div></div>
  <div class="heroe">${recorte('borgona-frente', [130, 870, 50, 950], 540)}</div>
  <div class="detalle">${recorte('borgona-camara', [470, 1220, 30, 600], 326, 900)}<p>Cámara de 48 MP<span>Con apertura variable</span></p></div>
  <div class="datos"><div><b>6,9″</b><span>Pantalla</span></div><div><b>A20 Pro</b><span>Chip</span></div><div><b>256 GB</b><span>Memoria</span></div></div>
  <div class="precio"><b>S/ 5,799<small>.00</small></b>
    <div class="lista"><div><i>${check}</i>Garantía Apple</div><div><i>${check}</i>Contraentrega</div><div><i>${check}</i>O recojo</div></div></div>
  <div class="pie"><div class="wa"><i></i>Escríbenos al WhatsApp 933 493 587</div><small>Imágenes referenciales</small></div>
</body></html>`;

const tmp = join(AQUI, '.tmp-flyer-borgona');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(dirname(salida), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  writeFileSync(join(tmp, 'p.html'), html);
  await page.goto(pathToFileURL(join(tmp, 'p.html')).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: salida });
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
console.log('Listo:', salida);
