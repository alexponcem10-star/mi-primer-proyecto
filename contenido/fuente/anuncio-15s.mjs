// Anuncio vertical de 15 s (1080x1920, 30 fps) para Reels, Historias y estados de WhatsApp: "Últimas 3", precio rebajado,
// confianza (sello e IMEI), colores y cierre a WhatsApp. Se arma con los cuadros de tus videos que guarda la web (docs/img),
// sin logo de Apple (limpiar-logo.py), con movimiento de cámara y cortes cada 1-2 s. Texto estilo subtítulo: blanco, negrita,
// borde negro y palabras clave en amarillo, dentro de la zona segura (fuera del 15% de arriba y del 20% de abajo).
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/anuncio-15s.mjs <carpeta-salida>
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const dirOut = resolve(process.argv[2] || '.');
const AQUI = dirname(fileURLToPath(import.meta.url));
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const W = 1080, H = 1920, FPS = 30, TOTAL = 15;
const AMARILLO = '#ffd60a';

// ---------- Tomas: [foto, inicio, fin, centro x, centro y, ancho del recorte, movimiento] ----------
// Las fotos miden 864x1080; el recorte es 9:16 (alto = ancho x 16/9). Movimiento: 'impacto', 'entra' o 'sale'.
const TOMAS = [
  ['portada', 0, 1, 432, 540, 607, 'impacto'], // 0-1: los equipos, zoom rápido
  ['borgona', 1, 2.5, 432, 540, 607, 'entra'], // 1-4: precio
  ['borgona', 2.5, 4, 300, 374, 420, 'sale'], //       primer plano de cámaras
  ['borgona', 4, 5.3, 430, 700, 420, 'entra'], // 4-8: confianza: el equipo en su caja
  ['portada', 5.3, 6.6, 300, 680, 450, 'sale'], //       la caja debajo
  ['borgona', 6.6, 8, 432, 584, 560, 'entra'],
  ['portada', 8, 9.5, 432, 540, 607, 'entra'], // 8-11: colores
  ['glaciar', 9.5, 11, 432, 540, 607, 'sale'],
  ['glaciar', 11, 12.5, 330, 374, 420, 'entra'], // 11-15: cierre
  ['portada', 12.5, 15, 440, 540, 607, 'sale'],
];

const fontFace = ['Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');
const CSS = `${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden;font-family:'InterD',sans-serif;-webkit-font-smoothing:antialiased}
@keyframes on{from{opacity:0}to{opacity:1}}
@keyframes off{to{opacity:0}}
@keyframes pop{0%{opacity:0;transform:scale(.6)}55%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:none}}
@keyframes sube{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes raya{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes late{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.x{position:absolute;left:60px;right:60px;text-align:center;opacity:0}
.sub{color:#fff;font-weight:900;letter-spacing:-.02em;line-height:1.08;-webkit-text-stroke:16px #000;paint-order:stroke fill;
  text-shadow:0 8px 24px rgba(0,0,0,.35)}
.k{color:${AMARILLO}}
.tachado{position:relative;display:inline-block}
.tachado::after{content:'';position:absolute;left:-6%;right:-6%;top:52%;height:12px;border-radius:6px;background:#ff3b30;box-shadow:0 0 0 4px #000;
  transform-origin:left;animation:raya .35s ease-out 1.55s both}
.tags{display:flex;justify-content:center;gap:22px}
.tag{display:flex;align-items:center;gap:14px;padding:18px 34px;border-radius:999px;font-size:66px;font-weight:900;color:#fff;
  box-shadow:0 0 0 6px #000,0 14px 34px rgba(0,0,0,.35)}
.wa{display:inline-flex;align-items:center;gap:18px;margin-top:26px;padding:22px 40px;border-radius:999px;background:#25d366;color:#fff;
  font-size:52px;font-weight:900;box-shadow:0 0 0 6px #000,0 14px 34px rgba(0,0,0,.35)}
.marca{font-size:34px;font-weight:700;color:#fff;margin-top:22px;-webkit-text-stroke:8px #000;paint-order:stroke fill}
`;
const A = (n, ini, dur = 0.4, curva = 'cubic-bezier(.2,.9,.3,1.2)', fill = 'both') => `${n} ${dur}s ${curva} ${ini}s ${fill}`;
const ven = (a, b, entrada = 'pop', d = 0.4) => `animation:${A(entrada, a, d)},${A('off', b - 0.12, 0.12, 'linear', 'forwards')}`;
const WA = '<svg width="54" height="54" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2s-1 .2-3.3-.7a11.7 11.7 0 0 1-4.6-4.1c-.4-.5-1-1.6-1-2.7s.6-1.8.9-2 .5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6a8.6 8.6 0 0 0 1.6 2 7.9 7.9 0 0 0 2.3 1.4c.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3a2.4 2.4 0 0 1-.2 1.4z"/></svg>';

// Zona segura: de y=288 (15%) a y=1536 (20% de abajo)
const OVERLAY = `
  <div class="x sub" style="top:300px;${ven(0, 1, 'pop', 0.3)}">
    <div style="font-size:150px">ÚLTIMAS <span class="k">3</span></div><div style="font-size:82px;margin-top:6px">iPhone 18 Pro Max</div></div>

  <div class="x sub" style="top:640px;${ven(1.02, 4, 'pop', 0.45)}">
    <div style="font-size:250px;letter-spacing:-.05em">S/ <span class="k">5,799</span></div>
    <div style="font-size:104px;margin-top:10px;color:#e5e5ea"><span class="tachado">S/ 6,200</span></div></div>

  <div class="x sub" style="top:1180px;font-size:104px;${ven(4.02, 6, 'sube')}">Verificas <span class="k">sello</span><br>e <span class="k">IMEI</span></div>
  <div class="x sub" style="top:1180px;font-size:104px;${ven(6.02, 8, 'sube')}">antes de pagar ✅</div>

  <div class="x" style="top:1260px;${ven(8.02, 11, 'on', 0.01)}">
    <div class="tags"><div class="tag" style="background:#8c293b;animation:${A('pop', 8.05, 0.4)}">🍷 Borgoña</div>
      <div class="tag" style="background:#5f8fc9;animation:${A('pop', 8.3, 0.4)}">🩵 Glaciar</div></div></div>

  <div class="x sub" style="top:960px;font-size:86px;${ven(11.02, TOTAL + 1, 'sube')}">Delivery en <span class="k">Lima</span><br>Pagas al recibir 🚚</div>
  <div class="x sub" style="top:1230px;font-size:80px;${ven(12.3, TOTAL + 1, 'sube')}">Escríbenos por <span class="k">WhatsApp</span> 👇
    <div><span class="wa" style="animation:${A('late', 13, 0.9, 'ease-in-out', 'infinite')}">${WA}933 493 587</span></div>
    <div class="marca">iPonce Store · Lima</div></div>`;

const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const tmp = join(AQUI, '.tmp-anuncio-15s');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(dirOut, { recursive: true });

// 1. Fotos sin logo de Apple
const fotos = join(tmp, 'fotos');
execFileSync('python3', [join(AQUI, 'limpiar-logo.py'), fotos], { stdio: 'inherit' });

// 2. Textos, cuadro por cuadro
writeFileSync(join(tmp, 'o.html'), `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${OVERLAY}
<script>document.fonts.ready.then(()=>{document.getAnimations().forEach(a=>a.pause());document.body.dataset.listo=1});
window.ir=t=>document.getAnimations().forEach(a=>{a.currentTime=t*1000});</script></body></html>`);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(join(tmp, 'o.html')).href);
  await page.waitForSelector('body[data-listo="1"]');
  for (let f = 0; f < TOTAL * FPS; f++) {
    await page.evaluate((s) => window.ir(s), f / FPS);
    await page.screenshot({ path: join(tmp, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
  }
  await page.evaluate((s) => window.ir(s), 2.2);
  await page.screenshot({ path: join(tmp, 'portada.png'), omitBackground: true });
} finally {
  await browser.close();
}

// 3. Tomas: recorte 9:16, menos ruido, más brillo y contraste suave, y movimiento de cámara
const entradas = TOMAS.flatMap(([foto, a, b]) => ['-loop', '1', '-framerate', String(FPS), '-t', String(b - a), '-i', join(fotos, `${foto}.png`)]);
const cadena = TOMAS.map(([, a, b, cx, cy, cw, mov], i) => {
  const ch = Math.round(cw * 16 / 9), N = Math.round((b - a) * FPS);
  const x = Math.max(0, Math.min(864 - cw, Math.round(cx - cw / 2))), y = Math.max(0, Math.min(1080 - ch, Math.round(cy - ch / 2)));
  const z = mov === 'impacto' ? `if(lt(on,8),1.35-0.3*on/8,1.05+0.02*(on-8)/${N - 8})` : mov === 'entra' ? `1+0.07*on/${N}` : `1.07-0.07*on/${N}`;
  return `[${i}:v]crop=${cw}:${ch}:${x}:${y},hqdn3d=3:3:0:0,scale=${W}:${H}:flags=lanczos,`
    + `zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},trim=end_frame=${N},setpts=PTS-STARTPTS,setsar=1[s${i}]`;
}).join(';');
const base = join(tmp, 'base.mp4');
ffmpeg([...entradas, '-filter_complex',
  `${cadena};${TOMAS.map((_, i) => `[s${i}]`).join('')}concat=n=${TOMAS.length}:v=1:a=0,`
  + `eq=brightness=0.04:contrast=0.96:gamma=1.07:saturation=1.05,unsharp=5:5:0.5:5:5:0[v]`,
  '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', base]);

// 4. Música propia con energía (sin letra): golpe al inicio, corte y "cha-ching" cuando sale el precio
const tiempos = join(tmp, 'tiempos.json');
writeFileSync(tiempos, JSON.stringify({ T: TOMAS.map((t) => t[1]), fin: 13, total: TOTAL, precio: 1.02,
  whoosh: [4, 8, 11], pops: [4.05, 6.05, 8.05, 8.3, 11.05, 12.3] }));
const wav = join(tmp, 'musica.wav');
execFileSync('python3', [join(AQUI, 'sonido-anuncio.py'), wav, tiempos], { stdio: 'inherit' });

// 5. Unión final
const out = join(dirOut, 'iponce-anuncio-15s-ultimas-3.mp4');
ffmpeg(['-i', base, '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'), '-i', wav,
  '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.5:LRA=9[a]',
  '-map', '[v]', '-map', '[a]', '-t', String(TOTAL), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
  '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out]);
ffmpeg(['-ss', '2.2', '-i', base, '-i', join(tmp, 'portada.png'), '-filter_complex', '[0:v][1:v]overlay', '-frames:v', '1', '-q:v', '2',
  out.replace(/\.mp4$/, '-portada.jpg')]);
if (!process.env.CONSERVAR) rmSync(tmp, { recursive: true, force: true });
console.log('Listo:', out);
