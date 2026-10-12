// Video vertical para TikTok/Reels: "iPhone 18 Pro Max en 25 segundos".
// Mezcla tomas del video original con tarjetas animadas de características.
// Sale sin música (pista silenciosa) para que se le ponga un sonido en tendencia dentro de TikTok.
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/video-specs.mjs <video-original.mp4> <salida.mp4>
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const [entrada, salida] = process.argv.slice(2).map((p) => p && resolve(p));
if (!entrada || !salida) {
  console.error('Uso: node video-specs.mjs <original.mp4> <salida.mp4>');
  process.exit(1);
}

const AQUI = dirname(fileURLToPath(import.meta.url));
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const TMP = join(AQUI, '.tmp-specs');
const FPS = 30, W = 1080, H = 1920;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', glaciar: '#a9c9ee' };

// Escenas: [id, duración, tramo del video original (inicio) o null si es gráfica a pantalla completa]
const ESCENAS = [
  ['gancho', 2.8, 0.0],
  ['pantalla', 2.6, 2.8],
  ['chip', 2.6, null],
  ['camara', 2.8, 8.6],
  ['zoom', 2.4, 5.4],
  ['bateria', 2.4, null],
  ['memoria', 2.4, null],
  ['colores', 2.6, 9.0],
  ['esim', 2.8, null],
  ['cierre', 3.2, null],
];
let t = 0;
const T = {};
for (const [id, d, src] of ESCENAS) { T[id] = { a: t, b: t + d, src, d }; t += d; }
const TOTAL = t;

const glifo = (letra, punto) => `<circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
  <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam, fondo, letra) =>
  `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}" style="flex:none"><rect width="1000" height="1000" rx="230" fill="${fondo}"/>${glifo(letra, C.burgundy)}</svg>`;
const fontFace = ['Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');

// Animaciones con tiempos absolutos (luego se "congelan" cuadro por cuadro).
const esc = (id, extra = '') => {
  const { a, b, src } = T[id];
  return `class="escena ${src === null ? 'solida' : 'sobre'} ${extra}" style="animation:entra .35s ease ${a}s both, sale .25s ease ${b - 0.25}s forwards"`;
};
const anim = (id, nombre, desfase, dur = 0.5, curva = 'cubic-bezier(.2,.9,.3,1.15)') => `animation:${nombre} ${dur}s ${curva} ${T[id].a + desfase}s both`;

const ojo = (id, txt) => `<div class="ceja" style="${anim(id, 'sube', 0.1)}">${txt}</div>`;
const grande = (id, txt, size = 300) => `<div class="grande" style="font-size:${size}px;${anim(id, 'pop', 0.2, 0.55)}">${txt}</div>`;
const sub = (id, txt) => `<div class="sub" style="${anim(id, 'sube', 0.4)}">${txt}</div>`;

const segmentos = ESCENAS.map(([id]) =>
  `<div class="seg"><i style="animation:llena ${T[id].d}s linear ${T[id].a}s both"></i></div>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden;font-family:'InterD',sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
@keyframes entra{from{opacity:0}to{opacity:1}}
@keyframes sale{to{opacity:0}}
@keyframes sube{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.7)}70%{opacity:1;transform:scale(1.04)}100%{opacity:1;transform:none}}
@keyframes llena{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes gira{to{transform:rotate(360deg)}}
@keyframes iris{0%,100%{transform:scale(1)}50%{transform:scale(.42)}}
@keyframes carga{from{width:14%}to{width:100%}}
@keyframes brillo{0%,100%{opacity:.55}50%{opacity:1}}
.escena{position:absolute;inset:0;opacity:0}
.solida{background:radial-gradient(ellipse 900px 900px at 50% 38%,#3a0f19 0%,#0c0c0e 68%),#0c0c0e}
.solida::before{content:'';position:absolute;inset:0;opacity:.45;background-image:radial-gradient(circle,#ffffff14 1.3px,transparent 1.5px);background-size:40px 40px}
.sobre{background:linear-gradient(180deg,#000000b0 0%,#00000040 22%,transparent 40%,transparent 52%,#000000d0 78%,#000000e8 100%)}
.bloque{position:absolute;left:70px;right:150px;bottom:470px}
.centro{position:absolute;left:70px;right:70px;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.ceja{display:inline-flex;align-items:center;gap:14px;font-size:34px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;padding:12px 26px;border-radius:999px;background:${C.burgundy};box-shadow:0 0 50px ${C.burgundy}aa}
.grande{font-weight:900;letter-spacing:-.06em;line-height:.9;margin-top:22px;text-shadow:0 10px 40px #0008}
.grande small{font-size:.42em;letter-spacing:-.03em;font-weight:700}
.sub{font-size:52px;font-weight:600;line-height:1.18;letter-spacing:-.02em;margin-top:26px;color:#e5e5ea;text-shadow:0 6px 24px #0009}
.sub b{color:#fff;font-weight:800}
.barra{position:absolute;left:70px;right:70px;top:150px;display:flex;gap:8px;opacity:0;animation:entra .3s ease .1s forwards}
.seg{flex:1;height:7px;border-radius:9px;background:#ffffff40;overflow:hidden}
.seg i{display:block;height:100%;background:#fff;transform-origin:left}
.marca{position:absolute;left:70px;top:190px;display:flex;align-items:center;gap:14px;font-size:32px;font-weight:700;letter-spacing:-.02em;opacity:0;animation:entra .3s ease .1s forwards}
.marca span{color:#c7c7cc;font-weight:500}
</style></head><body>

<div ${esc('gancho')}>
  <div class="bloque">
    <div class="ceja" style="${anim('gancho', 'sube', 0.15)}">Nuevo · 2026</div>
    <div class="grande" style="font-size:170px;${anim('gancho', 'pop', 0.3, 0.6)}">iPhone 18<br><span style="color:${C.luz}">Pro Max</span></div>
    <div class="sub" style="${anim('gancho', 'sube', 0.7)}">Lo que cambia, <b>en 25 segundos</b> ⏱️</div>
  </div>
</div>

<div ${esc('pantalla')}>
  <div class="bloque">${ojo('pantalla', 'Pantalla')}${grande('pantalla', '6,9″')}${sub('pantalla', 'OLED · <b>120 Hz</b><br>la más grande de la línea')}</div>
</div>

<div ${esc('chip')}>
  <div class="centro">
    <div style="position:relative;width:420px;height:420px;${anim('chip', 'pop', 0.05, 0.6)}">
      <div style="position:absolute;inset:-60px;border-radius:50%;border:2px dashed ${C.luz}66;animation:gira 8s linear infinite"></div>
      <div style="position:absolute;inset:0;border-radius:90px;background:linear-gradient(145deg,#2c2c31,#0e0e10);box-shadow:inset 0 0 0 3px #ffffff22,0 0 120px ${C.luz}66;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:150px;font-weight:900;letter-spacing:-.05em;line-height:1">A20</div>
        <div style="font-size:64px;font-weight:700;color:${C.luz};letter-spacing:.05em;animation:brillo 1.2s ease-in-out infinite">PRO</div>
      </div>
      ${[0, 1, 2, 3].map((k) => `<div style="position:absolute;${['left:50%;top:-34px;width:6px;height:34px', 'left:50%;bottom:-34px;width:6px;height:34px', 'top:50%;left:-34px;height:6px;width:34px', 'top:50%;right:-34px;height:6px;width:34px'][k]};background:${C.luz}"></div>`).join('')}
    </div>
    <div style="margin-top:110px">${ojo('chip', 'Chip')}</div>
    ${grande('chip', '2 nm', 200)}
    ${sub('chip', 'El <b>primer chip</b> de iPhone<br>fabricado en 2 nanómetros')}
  </div>
</div>

<div ${esc('camara')}>
  <div style="position:absolute;right:70px;top:300px;width:250px;height:250px;border-radius:50%;background:#000c;box-shadow:0 0 0 10px #ffffff22,0 0 0 18px #00000066,0 0 80px ${C.luz}88;display:flex;align-items:center;justify-content:center;${anim('camara', 'pop', 0.1)}">
    <div style="width:210px;height:210px;border-radius:50%;background:conic-gradient(from 0deg,#2a2a2e 0 60deg,#1a1a1d 60deg 120deg,#2a2a2e 120deg 180deg,#1a1a1d 180deg 240deg,#2a2a2e 240deg 300deg,#1a1a1d 300deg 360deg);display:flex;align-items:center;justify-content:center;animation:gira 3s linear infinite">
      <div style="width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#6f86b8,#141a2a 45%,#000 70%);animation:iris 1.6s ease-in-out ${T.camara.a}s infinite"></div></div>
  </div>
  <div class="bloque">${ojo('camara', 'Cámara')}${grande('camara', '48 <small>MP</small>')}${sub('camara', '<b>Apertura variable</b><br>de ƒ/1.48 a ƒ/4')}</div>
</div>

<div ${esc('zoom')}>
  <div class="bloque">${ojo('zoom', 'Zoom')}${grande('zoom', '4<small>x</small>')}${sub('zoom', 'Zoom óptico de <b>48 MP</b><br>y hasta <b>8x</b> calidad óptica')}</div>
</div>

<div ${esc('bateria')}>
  <div class="centro">
    <div style="display:flex;align-items:center;gap:14px;${anim('bateria', 'pop', 0.05)}">
      <div style="width:560px;height:270px;border-radius:70px;border:12px solid #fff;padding:22px;box-shadow:0 0 80px ${C.luz}55">
        <div style="height:100%;border-radius:40px;background:linear-gradient(90deg,${C.burgundy},${C.luz});box-shadow:0 0 60px ${C.luz};animation:carga 1.6s cubic-bezier(.3,.7,.3,1) ${T.bateria.a + 0.2}s both"></div></div>
      <div style="width:28px;height:100px;border-radius:0 18px 18px 0;background:#fff"></div>
    </div>
    <div style="margin-top:100px">${ojo('bateria', 'Batería')}</div>
    ${grande('bateria', 'Más batería', 150)}
    ${sub('bateria', 'que el <b>iPhone 17 Pro Max</b>')}
  </div>
</div>

<div ${esc('memoria')}>
  <div class="centro">
    ${ojo('memoria', 'Almacenamiento')}
    <div style="display:flex;align-items:baseline;gap:40px;margin-top:40px">
      <div class="grande" style="font-size:150px;color:#a1a1a6;${anim('memoria', 'pop', 0.2)}">256<small>GB</small></div>
      <div style="font-size:110px;font-weight:900;color:${C.luz};${anim('memoria', 'sube', 0.45)}">→</div>
      <div class="grande" style="font-size:230px;${anim('memoria', 'pop', 0.65)}">2<small>TB</small></div>
    </div>
    ${sub('memoria', 'Desde <b>256 GB</b> hasta <b>2 TB</b>.<br>Ya no se te llena.')}
  </div>
</div>

<div ${esc('colores')}>
  <div class="bloque">
    ${ojo('colores', 'Colores')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px 30px;margin-top:40px">
      ${[['Borgoña', 'linear-gradient(145deg,#7a2236,#3f0f1b)'], ['Glaciar', 'linear-gradient(145deg,#cfe3f8,#7ea8d8)'], ['Plata', 'linear-gradient(145deg,#f2f2f4,#b9b9bf)'], ['Negro', 'linear-gradient(145deg,#3a3a3e,#0d0d0f)']]
        .map(([n, g], k) => `<div style="display:flex;align-items:center;gap:22px;font-size:58px;font-weight:800;letter-spacing:-.03em;${anim('colores', 'sube', 0.2 + k * 0.15)}">
          <span style="width:78px;height:78px;border-radius:50%;background:${g};box-shadow:0 0 0 5px #000,0 0 0 9px #ffffffaa;flex:none"></span>${n}</div>`).join('')}
    </div>
  </div>
</div>

<div ${esc('esim')}>
  <div class="centro">
    <div style="width:300px;height:390px;border-radius:50px;border:6px dashed ${C.luz};display:flex;align-items:center;justify-content:center;box-shadow:0 0 90px ${C.luz}44;transform:rotate(-8deg);${anim('esim', 'pop', 0.05)}">
      <svg viewBox="0 0 24 24" width="200" height="200" fill="none" stroke="${C.luz}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.8h6.5L19 7.3v13.9H5V5.8z"/><rect x="8.3" y="11" width="7.4" height="6.6" rx="1.2"/><path d="M12 11v6.6M8.3 14.3h7.4"/></svg></div>
    <div style="margin-top:90px">${ojo('esim', 'Importante')}</div>
    ${grande('esim', 'Versión EE. UU.:<br><span style="color:' + C.luz + '">solo eSIM</span>', 118)}
    ${sub('esim', 'Funciona en Perú.<br>En iPonce <b>te ayudamos a activarla</b>.')}
  </div>
</div>

<div ${esc('cierre')}>
  <div class="centro">
    <div style="filter:drop-shadow(0 30px 90px ${C.luz}99);${anim('cierre', 'pop', 0.05, 0.6)}">${icono(260, '#fff', C.grafito)}</div>
    <div class="grande" style="font-size:120px;margin-top:60px;${anim('cierre', 'sube', 0.25)}">¿Cuál color<br>te llevas?</div>
    ${sub('cierre', 'Comenta 👇 y te escribimos')}
    <div style="display:flex;gap:14px;margin-top:60px;flex-wrap:wrap;justify-content:center;${anim('cierre', 'sube', 0.6)}">
      ${['Caja sellada', 'Garantía iPonce', 'Delivery en Lima'].map((x) => `<div style="padding:16px 28px;border-radius:999px;font-size:34px;font-weight:700;background:#ffffff14;box-shadow:inset 0 0 0 2px #ffffff30">${x}</div>`).join('')}
    </div>
    <div style="margin-top:50px;display:flex;align-items:center;gap:18px;padding:28px 46px;border-radius:999px;background:#fff;color:${C.grafito};font-size:44px;font-weight:800;${anim('cierre', 'sube', 0.8)}">
      <span style="width:20px;height:20px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633"></span>Escríbenos por WhatsApp</div>
  </div>
</div>

<div class="barra">${segmentos}</div>
<div class="marca">${icono(54, '#fff', C.grafito)}iPonce<span>Store</span></div>

<script>document.fonts.ready.then(()=>{document.getAnimations().forEach(a=>a.pause());document.body.dataset.listo=1});
window.ir=t=>document.getAnimations().forEach(a=>{a.currentTime=t*1000});</script>
</body></html>`;

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
writeFileSync(join(TMP, 'specs.html'), html);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(join(TMP, 'specs.html')).href);
  await page.waitForSelector('body[data-listo="1"]');
  const n = Math.round(TOTAL * FPS);
  for (let f = 0; f < n; f++) {
    await page.evaluate((s) => window.ir(s), f / FPS);
    await page.screenshot({ path: join(TMP, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
  }
  await page.evaluate((s) => window.ir(s), 1.8);
  await page.screenshot({ path: join(TMP, 'portada.png'), omitBackground: true });
} finally {
  await browser.close();
}

// Base: tomas del video original en el orden de las escenas (las escenas gráficas las tapan por completo).
const partes = ESCENAS.map(([id, d, src], k) =>
  `[s${k}]trim=start=${src ?? 0}:duration=${d},setpts=PTS-STARTPTS,scale=${W}:${H}:flags=lanczos,setsar=1,fps=${FPS}[v${k}]`);
const filtro = `[0:v]split=${ESCENAS.length}${ESCENAS.map((_, k) => `[s${k}]`).join('')};` + partes.join(';') + ';' +
  ESCENAS.map((_, k) => `[v${k}]`).join('') + `concat=n=${ESCENAS.length}:v=1:a=0[base]`;
// Paso 1: base a 30 fps constantes (unir y superponer en un solo paso desfasa los tiempos).
const base = join(TMP, 'base.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', entrada, '-filter_complex', filtro, '-map', '[base]', '-r', String(FPS),
  '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', base], { stdio: 'inherit' });
// Paso 2: capas animadas encima + pista silenciosa.
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', base, '-framerate', String(FPS), '-i', join(TMP, 'f%04d.png'),
  '-f', 'lavfi', '-t', TOTAL.toFixed(2), '-i', 'anullsrc=r=44100:cl=stereo',
  '-filter_complex', '[0:v]tpad=stop_mode=clone:stop_duration=1[b];[b][1:v]overlay=format=auto,format=yuv420p[v]',
  '-map', '[v]', '-map', '2:a', '-t', TOTAL.toFixed(2),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k',
  '-movflags', '+faststart', salida], { stdio: 'inherit' });

execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '1.8', '-i', entrada, '-i', join(TMP, 'portada.png'),
  '-filter_complex', `[0:v]scale=${W}:${H}:flags=lanczos,setsar=1[b];[b][1:v]overlay`, '-frames:v', '1', '-q:v', '2',
  salida.replace(/\.mp4$/, '-portada.jpg')]);

if (!process.env.CONSERVAR) rmSync(TMP, { recursive: true, force: true });
console.log(`Listo: ${salida} (${TOTAL.toFixed(1)} s)`);
