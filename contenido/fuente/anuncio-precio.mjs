// Anuncio para probar en Meta (Facebook / Instagram / WhatsApp): solo Borgoña y Glaciar, con precio y formas de entrega.
// Toma cortes de los videos originales, los mejora a 1080x1920 y les pone encima las capas de marca (renderizadas con Chromium).
// Los textos quedan dentro de la zona segura de Reels/Stories (fuera de la franja de abajo, donde Meta pone el botón y el texto).
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/anuncio-precio.mjs <carpeta-con-v1..v11> <carpeta-salida>
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const [dirIn, dirOut] = process.argv.slice(2);
if (!dirIn || !dirOut) {
  console.error('Uso: node anuncio-precio.mjs <carpeta-videos> <carpeta-salida>');
  process.exit(1);
}
const AQUI = dirname(fileURLToPath(import.meta.url));
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const W = 1080, H = 1920, FPS = 30, CIERRE = 3.4;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', glaciar: '#8fb8e8' };
const MEJORA = 'hqdn3d=1.2:1.2:4:4,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0,eq=contrast=1.04:saturation=1.07';

// ---------- Oferta (cambia aquí precio y textos) ----------
const OFERTA = { precio: 'S/ 6,200', centimos: '.00', capacidad: '256 GB', whatsapp: '933 493 587' };

// ---------- Tomas: [video, segundo de inicio, duración] ----------
const TOMAS = [
  ['v11', 2.0, 2.6], // Borgoña de película: gancho
  ['v2', 8.0, 3.0], // los dos colores juntos
  ['v4', 2.0, 2.5], // Glaciar en mano
  ['v11', 9.5, 2.5], // Borgoña en mano
  ['v9', 0.0, 1.8], // caja sellada
  ['v2', 0.5, 3.0], // los dos colores: precio
  ['v1', 3.5, 3.0], // Glaciar: formas de entrega
];
const T = [];
TOMAS.reduce((t, [, , d]) => { T.push(t); return t + d; }, 0);
const FIN = TOMAS.reduce((s, [, , d]) => s + d, 0);
const TOTAL = FIN + CIERRE;

// ---------- Marca y estilos ----------
const glifo = (letra, punto) => `<circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
  <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam, fondo = '#fff', letra = C.grafito) =>
  `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}" style="flex:none"><rect width="1000" height="1000" rx="230" fill="${fondo}"/>${glifo(letra, C.burgundy)}</svg>`;
const fontFace = ['Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');

const CSS = `${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden;font-family:'InterD',sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
@keyframes on{from{opacity:0}to{opacity:1}}
@keyframes off{to{opacity:0;transform:translateY(-16px)}}
@keyframes pop{0%{opacity:0;transform:scale(.7)}60%{opacity:1;transform:scale(1.05)}100%{opacity:1;transform:none}}
@keyframes sube{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:none}}
@keyframes izq{from{opacity:0;transform:translateX(-70px)}to{opacity:1;transform:none}}
@keyframes flash{0%{opacity:.75}100%{opacity:0}}
@keyframes late{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.x{position:absolute;opacity:0}
.marca{left:48px;top:150px;display:flex;align-items:center;gap:16px;padding:12px 26px 12px 12px;border-radius:999px;background:rgba(18,18,20,.74);
  box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18),0 10px 30px rgba(0,0,0,.35);font-size:34px;font-weight:700;letter-spacing:-.02em}
.marca span{color:#c7c7cc;font-weight:500;margin-left:-4px}
.flash{inset:0;background:#fff}
.centro{left:0;right:0;text-align:center}
.l{display:inline-flex;align-items:center;gap:18px;font-size:96px;font-weight:900;letter-spacing:-.04em;line-height:1.08;padding:4px 34px 12px;border-radius:28px;background:rgba(18,18,20,.84);margin:6px 0;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.l.s{font-size:50px;font-weight:700;padding:10px 28px 14px;color:#e5e5ea}
.punto{width:48px;height:48px;border-radius:50%;flex:none;box-shadow:0 0 0 5px rgba(255,255,255,.9)}
.color{left:48px;top:980px;display:flex;align-items:center;gap:22px;padding:18px 40px 22px 24px;border-radius:999px;background:rgba(18,18,20,.84);
  font-size:84px;font-weight:900;letter-spacing:-.04em;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.chips{left:48px;top:900px;display:flex;flex-direction:column;gap:18px}
.chip{display:flex;align-items:center;gap:18px;padding:18px 34px 18px 20px;border-radius:999px;font-size:46px;font-weight:700;letter-spacing:-.02em;
  background:rgba(18,18,20,.84);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16),0 10px 30px rgba(0,0,0,.35);opacity:0;width:max-content}
.chip i{width:56px;height:56px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center}
.precio{left:48px;right:48px;top:560px;padding:40px 44px 46px;border-radius:48px;background:rgba(14,14,16,.88);
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.14),0 24px 60px rgba(0,0,0,.5)}
.precio .et{font-size:40px;font-weight:700;color:#d2d2d7}
.precio b{display:block;font-size:178px;font-weight:900;letter-spacing:-.055em;line-height:1;margin-top:8px;
  background:linear-gradient(135deg,#fff 40%,#f3b6c3);-webkit-background-clip:text;background-clip:text;color:transparent}
.precio b small{font-size:84px;letter-spacing:-.03em}
.precio .cols{display:flex;gap:14px;margin-top:22px}
.precio .cols span{display:flex;align-items:center;gap:12px;padding:12px 22px;border-radius:999px;font-size:34px;font-weight:700;background:rgba(255,255,255,.1)}
.precio .cols i{width:26px;height:26px;border-radius:50%;box-shadow:0 0 0 3px rgba(255,255,255,.85)}
.entrega{left:48px;right:48px;top:1010px;display:flex;flex-direction:column;gap:16px}
.ent{display:flex;align-items:center;gap:20px;padding:22px 30px;border-radius:30px;background:#fff;color:${C.grafito};opacity:0;
  font-size:46px;font-weight:900;letter-spacing:-.025em;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.ent small{display:block;font-size:30px;font-weight:600;color:#6e6e73;letter-spacing:0;margin-top:2px}
.ent i{width:72px;height:72px;border-radius:22px;background:${C.burgundy};display:flex;align-items:center;justify-content:center;flex:none}
.cierre{inset:0;background:radial-gradient(ellipse 900px 700px at 50% 38%,#3a0f19 0%,#0c0c0e 70%),#0c0c0e;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 70px 260px}
.cierre h1{font-size:96px;font-weight:900;letter-spacing:-.045em;line-height:1;margin-top:48px}
.cierre .cols{display:flex;gap:16px;margin-top:26px}
.cierre .cols span{display:flex;align-items:center;gap:12px;padding:12px 24px;border-radius:999px;font-size:34px;font-weight:700;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18)}
.cierre .cols i{width:26px;height:26px;border-radius:50%}
.cierre .pr{font-size:150px;font-weight:900;letter-spacing:-.055em;line-height:1;margin-top:40px;
  background:linear-gradient(135deg,#fff 40%,#f3b6c3);-webkit-background-clip:text;background-clip:text;color:transparent}
.cierre .pr small{font-size:70px}
.cierre .sub{font-size:44px;font-weight:700;color:#e5e5ea;margin-top:16px}
.wa{display:flex;align-items:center;gap:18px;padding:28px 46px;border-radius:999px;background:#fff;color:${C.grafito};font-size:46px;font-weight:900;margin-top:50px}
.wa i{width:20px;height:20px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
`;

const A = (n, ini, dur = 0.5, curva = 'cubic-bezier(.2,.9,.3,1.2)', fill = 'both') => `${n} ${dur}s ${curva} ${ini}s ${fill}`;
const ven = (a, b, entrada = 'pop', d = 0.5) => `animation:${A(entrada, a, d)},${A('off', b - 0.3, 0.3, 'ease', 'forwards')}`;
const check = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const punto = (c) => `<span class="punto" style="background:${c}"></span>`;
const dosColores = `<span><i style="background:${C.burgundy}"></i>Borgoña</span><span><i style="background:${C.glaciar}"></i>Glaciar</span>`;
const svg = (d) => `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONOS = {
  billete: svg('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>'),
  tienda: svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
};

function overlay() {
  const flashes = T.slice(1).map((t) => `<div class="x flash" style="animation:${A('flash', t, 0.18, 'ease-out', 'none')}"></div>`).join('');
  const html = `
  <div class="x marca" style="animation:${A('izq', 0.15, 0.5)},${A('off', FIN - 0.3, 0.3, 'ease', 'forwards')}">${icono(64)}iPonce<span>Store</span></div>

  <div class="x centro" style="top:560px;${ven(0.2, T[1])}">
    <div class="l">iPhone 18 Pro Max</div><br><div class="l s">Nuevo · en caja sellada</div></div>

  <div class="x centro" style="top:560px;${ven(T[1] + 0.15, T[2])}">
    <div class="l">${punto(C.burgundy)}Borgoña</div><br><div class="l">o Glaciar${punto(C.glaciar)}</div></div>

  <div class="x color" style="${ven(T[2] + 0.15, T[3], 'izq', 0.45)}">${punto(C.glaciar)}Glaciar</div>
  <div class="x color" style="${ven(T[3] + 0.15, T[4], 'izq', 0.45)}">${punto(C.burgundy)}Borgoña</div>

  <div class="x chips" style="animation:${A('on', T[4], 0.01)},${A('off', T[5] - 0.25, 0.25, 'ease', 'forwards')}">
    ${['Caja sellada', '100% nuevo', 'Garantía iPonce'].map((c, k) => `<div class="chip" style="animation:${A('izq', T[4] + 0.1 + k * 0.35, 0.4)}"><i>${check}</i>${c}</div>`).join('')}</div>

  <div class="x precio" style="${ven(T[5] + 0.15, FIN)}">
    <div class="et">iPhone 18 Pro Max · ${OFERTA.capacidad}</div>
    <b>${OFERTA.precio}<small>${OFERTA.centimos}</small></b>
    <div class="cols">${dosColores}</div></div>

  <div class="x entrega" style="animation:${A('on', T[6], 0.01)},${A('off', FIN - 0.3, 0.3, 'ease', 'forwards')}">
    <div class="ent" style="animation:${A('sube', T[6] + 0.1, 0.45)}"><i>${ICONOS.billete}</i><div>Pago contraentrega<small>Pagas cuando lo recibes</small></div></div>
    <div class="ent" style="animation:${A('sube', T[6] + 0.5, 0.45)}"><i>${ICONOS.tienda}</i><div>O recojo<small>Coordina por WhatsApp</small></div></div></div>

  ${flashes}

  <div class="x cierre" style="animation:${A('on', FIN - 0.05, 0.45, 'ease')}">
    <div style="filter:drop-shadow(0 30px 80px ${C.luz}88);animation:${A('pop', FIN + 0.2, 0.6)}">${icono(220)}</div>
    <h1 style="animation:${A('sube', FIN + 0.35, 0.5)}">iPhone 18 Pro Max</h1>
    <div class="cols" style="animation:${A('sube', FIN + 0.45, 0.5)}">${dosColores}</div>
    <div class="pr" style="animation:${A('pop', FIN + 0.6, 0.55)}">${OFERTA.precio}<small>${OFERTA.centimos}</small></div>
    <div class="sub" style="animation:${A('sube', FIN + 0.8, 0.5)}">Contraentrega o recojo</div>
    <div class="wa" style="animation:${A('sube', FIN + 1, 0.5)},${A('late', FIN + 1.6, 1, 'ease-in-out', 'infinite')}"><i></i>WhatsApp ${OFERTA.whatsapp}</div>
  </div>`;
  return html;
}

const tmp = join(AQUI, '.tmp-anuncio');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(resolve(dirOut), { recursive: true });

// Capas de marca, cuadro por cuadro
writeFileSync(join(tmp, 'o.html'), `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${overlay()}
<script>document.fonts.ready.then(()=>{document.getAnimations().forEach(a=>a.pause());document.body.dataset.listo=1});
window.ir=t=>document.getAnimations().forEach(a=>{a.currentTime=t*1000});</script></body></html>`);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(join(tmp, 'o.html')).href);
  await page.waitForSelector('body[data-listo="1"]');
  const n = Math.round(TOTAL * FPS);
  for (let f = 0; f < n; f++) {
    await page.evaluate((s) => window.ir(s), f / FPS);
    await page.screenshot({ path: join(tmp, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
  }
  await page.evaluate((s) => window.ir(s), T[5] + 1.2);
  await page.screenshot({ path: join(tmp, 'portada.png'), omitBackground: true });
} finally {
  await browser.close();
}

// Paso 1: tomas mejoradas y unidas a 30 fps exactos; el último cuadro se congela debajo del cierre.
const entradas = TOMAS.flatMap(([v, ss, d]) => ['-ss', String(ss), '-t', String(d), '-i', join(resolve(dirIn), `${v}.mp4`)]);
const cadena = TOMAS.map((_, i) => `[${i}:v]${MEJORA},setsar=1,fps=${FPS},trim=duration=${TOMAS[i][2]},setpts=PTS-STARTPTS[s${i}]`).join(';');
const base = join(tmp, 'base.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...entradas, '-filter_complex',
  `${cadena};${TOMAS.map((_, i) => `[s${i}]`).join('')}concat=n=${TOMAS.length}:v=1:a=0,tpad=stop_mode=clone:stop_duration=${CIERRE + 1}[v]`,
  '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', base], { stdio: 'inherit' });

// Paso 2: capas encima + pista de audio en silencio (para que Meta lo acepte; la música se elige al publicar).
const out = join(resolve(dirOut), 'iponce-anuncio-borgona-glaciar-6200.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', base, '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'),
  '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
  '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v]', '-map', '[v]', '-map', '2:a', '-t', TOTAL.toFixed(2),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out],
{ stdio: 'inherit' });

// Portada: la toma del precio con su tarjeta
const [v, ss] = TOMAS[5];
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(ss + 1.2), '-i', join(resolve(dirIn), `${v}.mp4`), '-i', join(tmp, 'portada.png'),
  '-filter_complex', `[0:v]${MEJORA},setsar=1[b];[b][1:v]overlay`, '-frames:v', '1', '-q:v', '2', out.replace(/\.mp4$/, '-portada.jpg')]);
if (!process.env.CONSERVAR) rmSync(tmp, { recursive: true, force: true });
console.log(`Listo: ${out} (${TOTAL.toFixed(1)} s)`);
