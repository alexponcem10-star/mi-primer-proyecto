// Renders de producto (fondo transparente) del iPhone 18 Pro Max en los colores de iPonce, estilo foto de tienda.
// Ilustración propia: sin logos de Apple. Salida: docs/img/render-<color>.png (y -angulo).
// Uso: NODE_PATH=$(npm root -g) node marca/fuente/render-telefonos.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, '..', '..', 'docs', 'img');
const TMP = join(AQUI, '.tmp-render');

// Tonos del cuerpo: [sombra, base, brillo, meseta]
const COLORES = {
  borgona: ['#2e0a13', '#5e1828', '#8e3348', '#6a1d2f'],
  glaciar: ['#7d9fc6', '#a9c7e8', '#e3effb', '#b7d2ee'],
  negro: ['#09090a', '#1c1c1f', '#4a4a50', '#242428'],
};

const telefono = ([sombra, base, brillo, meseta], ang) => `
<div class="esc"><div class="tel" style="transform:${ang}">
  <div class="marco" style="background:linear-gradient(160deg,${brillo},${base} 22%,${sombra} 55%,${base} 80%,${brillo})"></div>
  <div class="cuerpo" style="background:
      radial-gradient(ellipse 120% 70% at 20% 0%,${brillo}55,transparent 60%),
      linear-gradient(165deg,${base} 0%,${sombra} 58%,${base} 100%)"></div>
  <div class="meseta" style="background:linear-gradient(170deg,${brillo}66,${meseta} 30%,${sombra} 100%);box-shadow:inset 0 2px 0 ${brillo}88,inset 0 -3px 8px #0006,0 10px 26px #0005">
    ${[[52, 40], [52, 170], [170, 105]].map(([x, y]) => `
      <div class="lente" style="left:${x}px;top:${y}px;background:radial-gradient(circle,${base},${sombra});box-shadow:0 0 0 3px ${brillo}55,0 8px 18px #0008">
        <div class="vidrio"></div></div>`).join('')}
    <div class="flash" style="left:300px;top:52px"></div><div class="mic" style="left:312px;top:140px"></div>
  </div>
  <div class="reflejo"></div>
  <div class="boton" style="top:250px;background:linear-gradient(90deg,${sombra},${brillo})"></div>
  <div class="boton" style="top:380px;height:120px;background:linear-gradient(90deg,${sombra},${brillo})"></div>
</div></div>`;

const css = `*{margin:0;padding:0;box-sizing:border-box}html,body{width:620px;height:1080px;background:transparent;overflow:hidden}
.esc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;perspective:2400px}
.tel{position:relative;width:440px;height:920px;transform-style:preserve-3d}
.marco{position:absolute;inset:-6px;border-radius:78px}
.cuerpo{position:absolute;inset:0;border-radius:72px;box-shadow:inset 0 0 0 2px #ffffff22,inset 0 0 40px #0005}
.meseta{position:absolute;left:18px;right:18px;top:20px;height:300px;border-radius:58px}
.lente{position:absolute;width:118px;height:118px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.vidrio{width:86px;height:86px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#6f86b8 0%,#1b2236 26%,#050507 58%);box-shadow:inset 0 0 0 5px #111,inset 0 0 14px #000}
.vidrio::after{content:'';display:block;width:16px;height:16px;border-radius:50%;margin:22px 0 0 26px;background:#ffffffc0;filter:blur(1.5px)}
.flash{position:absolute;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle,#fff9e8,#d9cfae 60%,#8a8270);box-shadow:0 0 0 3px #0003}
.mic{position:absolute;width:14px;height:14px;border-radius:50%;background:#0008}
.reflejo{position:absolute;inset:0;border-radius:72px;background:linear-gradient(118deg,transparent 30%,#ffffff26 40%,transparent 52%),linear-gradient(118deg,transparent 60%,#ffffff12 66%,transparent 72%);pointer-events:none}
.boton{position:absolute;right:-10px;width:8px;height:80px;border-radius:4px}`;

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(SALIDA, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [nombre, tonos] of Object.entries(COLORES)) {
    for (const [sufijo, ang] of [['', 'rotateY(-8deg) rotateZ(0deg)'], ['-angulo', 'rotateY(-26deg) rotateX(6deg) rotateZ(-6deg)']]) {
      const f = join(TMP, `${nombre}${sufijo}.html`);
      writeFileSync(f, `<!doctype html><html><head><style>${css}</style></head><body>${telefono(tonos, ang)}</body></html>`);
      const page = await browser.newPage({ viewport: { width: 620, height: 1080 }, deviceScaleFactor: 1.6 });
      await page.goto(pathToFileURL(f).href);
      await page.screenshot({ path: join(SALIDA, `render-${nombre}${sufijo}.png`), omitBackground: true });
      await page.close();
    }
  }
} finally {
  await browser.close();
  rmSync(TMP, { recursive: true, force: true });
}
console.log('Renders listos en', SALIDA);
