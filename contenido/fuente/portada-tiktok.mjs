// Portada para TikTok (1080x1920). Lo importante va en la franja central de 3:4 (y 240–1680),
// que es lo que TikTok muestra en la cuadrícula del perfil.
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/portada-tiktok.mjs [salida.png]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const salida = resolve(process.argv[2] || join(RAIZ, 'marca', 'tiktok', 'tiktok-portada-1080x1920.png'));
const FONTS = join(RAIZ, 'marca', 'fuente', 'fonts');
const IMG = (n) => pathToFileURL(join(RAIZ, 'docs', 'img', `${n}.webp`)).href;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', glaciar: '#8fb8e8', foto: '#f6f5f8' };

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

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;background:${C.foto};font-family:'InterD',sans-serif;color:${C.grafito};-webkit-font-smoothing:antialiased;overflow:hidden;position:relative}
.marca{position:absolute;left:0;right:0;top:270px;display:flex;justify-content:center;align-items:center;gap:18px;font-size:44px;font-weight:700;letter-spacing:-.02em}
.marca span{color:#86868b;font-weight:500;margin-left:-6px}
.cab{position:absolute;left:0;right:0;top:400px;text-align:center}
.ceja{font-size:34px;font-weight:700;letter-spacing:.18em;color:${C.burgundy}}
h1{font-size:150px;font-weight:900;letter-spacing:-.055em;line-height:.98;margin-top:18px}
h1 span{background:linear-gradient(135deg,${C.grafito} 35%,${C.burgundy});-webkit-background-clip:text;background-clip:text;color:transparent}
.fotos{position:absolute;left:0;right:0;top:830px;display:flex;justify-content:center;gap:40px}
.chips{position:absolute;left:0;right:0;top:1560px;display:flex;justify-content:center;gap:14px}
.chips div{display:flex;align-items:center;gap:12px;padding:16px 28px;border-radius:999px;background:${C.grafito};color:#fff;font-size:34px;font-weight:700}
.chips i{width:14px;height:14px;border-radius:50%;background:${C.luz}}
.ref{position:absolute;right:56px;bottom:60px;font-size:22px;color:#a1a1a6;font-weight:500}
</style></head><body>
  <div class="marca">${icono(76)}iPonce<span>Store</span></div>
  <div class="cab"><div class="ceja">NUEVO · ORIGINAL</div><h1>iPhone 18<br><span>Pro Max</span></h1></div>
  <div class="fotos">${dorso('borgona', 640, -7)}${dorso('glaciar', 640, 7)}</div>
  <div class="chips"><div><i></i>Caja sellada</div><div><i></i>Garantía</div><div><i></i>Lima</div></div>
  <div class="ref">Imágenes referenciales</div>
</body></html>`;

const tmp = join(AQUI, '.tmp-portada-tiktok');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(dirname(salida), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
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
