// Imagen de bienvenida para WhatsApp (1080x1350): iPhone 18 Pro Max 256 GB Borgoña y Glaciar con precio.
// Se manda junto con el texto de bienvenida usando una respuesta rápida (/bienvenida).
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/bienvenida-whatsapp.mjs [salida.png]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const salida = resolve(process.argv[2] || join(RAIZ, 'marca', 'whatsapp', 'whatsapp-bienvenida-1080x1350.png'));
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
// "lado" trae dorso + costado: nos quedamos solo con el dorso (x 190–645, y 50–950 de 1000)
const dorso = (color, alto, giro) => {
  const k = alto / 900;
  return `<div style="height:${alto}px;width:${455 * k}px;overflow:hidden;transform:rotate(${giro}deg)"><img src="${IMG(`${color}-lado`)}" style="height:${1000 * k}px;margin:-${50 * k}px 0 0 -${190 * k}px"></div>`;
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
.fotos{position:absolute;left:0;right:0;top:450px;display:flex;justify-content:center;gap:110px}
.color{position:absolute;top:902px;display:flex;align-items:center;gap:12px;padding:12px 24px;border-radius:999px;background:#fff;font-size:32px;font-weight:700;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.08)}
.color i{width:28px;height:28px;border-radius:50%}
.precio{position:absolute;left:56px;right:56px;top:1000px;padding:30px 40px;border-radius:44px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.08),inset 0 0 0 1.5px rgba(0,0,0,.05);display:flex;align-items:center;justify-content:space-between}
.precio b{font-size:112px;font-weight:900;letter-spacing:-.055em;line-height:1;white-space:nowrap;background:linear-gradient(135deg,${C.grafito} 45%,${C.burgundy});-webkit-background-clip:text;background-clip:text;color:transparent}
.precio b small{font-size:52px}
.lista{display:flex;flex-direction:column;gap:10px}
.lista div{display:flex;align-items:center;gap:12px;font-size:30px;font-weight:700;white-space:nowrap}
.lista i{width:38px;height:38px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center}
.pie{position:absolute;left:56px;right:56px;top:1262px;display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:700}
.pie .wa{display:flex;align-items:center;gap:14px}
.pie .wa i{width:16px;height:16px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
.pie small{font-size:22px;color:#86868b;font-weight:500}
</style></head><body>
  <div class="marca">${icono(64)}iPonce<span>Store</span></div>
  <div class="cab"><div class="hola">¡Hola! Bienvenido 👋</div><h1>iPhone 18 Pro Max</h1><div class="sub">256 GB · Nuevo y en caja sellada</div></div>
  <div class="fotos">${dorso('borgona', 430, -6)}${dorso('glaciar', 430, 6)}</div>
  <div class="color" style="left:198px"><i style="background:${C.burgundy}"></i>Borgoña</div>
  <div class="color" style="right:204px"><i style="background:${C.glaciar}"></i>Glaciar</div>
  <div class="precio"><b>S/ 6,200<small>.00</small></b>
    <div class="lista"><div><i>${check}</i>Garantía Apple</div><div><i>${check}</i>Contraentrega</div><div><i>${check}</i>O recojo</div></div></div>
  <div class="pie"><div class="wa"><i></i>¿Borgoña o Glaciar? Respóndenos 👇</div><small>Imágenes referenciales</small></div>
</body></html>`;

const tmp = join(AQUI, '.tmp-bienvenida-whatsapp');
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
