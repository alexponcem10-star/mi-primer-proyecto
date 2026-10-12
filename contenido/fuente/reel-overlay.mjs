// Agrega capas publicitarias de iPonce Store encima de un video vertical SIN tocar la imagen original
// (no se recorta, no se filtra: solo se escala a 1080x1920 y se ponen elementos encima + cierre de marca).
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/reel-overlay.mjs <video-entrada.mp4> <video-salida.mp4>
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');

const [entrada, salida] = process.argv.slice(2).map((p) => p && resolve(p));
if (!entrada || !salida) {
  console.error('Uso: node reel-overlay.mjs <entrada.mp4> <salida.mp4>');
  process.exit(1);
}

const AQUI = dirname(fileURLToPath(import.meta.url));
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const TMP = join(AQUI, '.tmp');
const FPS = 30;
const W = 1080, H = 1920;

const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', entrada]).toString());
const CIERRE = 2.4;
const TOTAL = dur + CIERRE;
const fin = dur; // momento en que termina el video original

const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', azul: '#8fb8e8' };

const glifo = (letra, punto) => `
  <circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
    <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam, fondo, letra) =>
  `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}"><rect width="1000" height="1000" rx="230" fill="${fondo}"/>${glifo(letra, C.burgundy)}</svg>`;

const fontFace = ['Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');

// Cada elemento tiene [entra, sale] en segundos.
const T = {
  marca: [0.15, fin],
  sticker: [0.6, fin],
  gancho: [0.25, 3.3],
  chips: [3.6, 8.5],
  cta: [8.8, fin],
  cierre: [fin - 0.05, TOTAL],
};
const entra = (k, extra = 0) => `${T[k][0] + extra}s`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden;font-family:'InterD',sans-serif;
  -webkit-font-smoothing:antialiased;color:#fff}
.capa{position:absolute;opacity:0}
@keyframes aparece{from{opacity:0;transform:translateY(30px) scale(.96)}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.6) rotate(-6deg)}60%{opacity:1;transform:scale(1.06) rotate(1deg)}100%{opacity:1;transform:none}}
@keyframes desaparece{to{opacity:0;transform:translateY(-20px)}}
@keyframes izq{from{opacity:0;transform:translateX(-80px)}to{opacity:1;transform:none}}
@keyframes gira{to{transform:rotate(360deg)}}
@keyframes late{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes fundido{from{opacity:0}to{opacity:1}}

/* Marca arriba a la izquierda (debajo de la barra de TikTok/Reels) */
.marca{left:48px;top:200px;display:flex;align-items:center;gap:16px;padding:12px 26px 12px 12px;border-radius:999px;
  background:rgba(18,18,20,.72);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18),0 10px 30px rgba(0,0,0,.35);
  font-size:34px;font-weight:700;letter-spacing:-.02em;
  animation:izq .5s cubic-bezier(.2,.9,.3,1.2) ${entra('marca')} forwards, desaparece .3s ${T.marca[1] - 0.3}s forwards}
.marca span{color:#c7c7cc;font-weight:500;margin-left:4px}

/* Sticker giratorio */
.sticker{right:44px;top:170px;width:230px;height:230px;
  animation:pop .6s cubic-bezier(.2,.9,.3,1.3) ${entra('sticker')} forwards, desaparece .3s ${T.sticker[1] - 0.3}s forwards}
.sticker .aro{position:absolute;inset:0;animation:gira 9s linear infinite}
.sticker .centro{position:absolute;inset:52px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 0 6px rgba(255,255,255,.95),0 12px 30px rgba(0,0,0,.4)}

/* Gancho de los primeros 3 segundos */
.gancho{left:0;right:0;top:470px;text-align:center;
  animation:pop .55s cubic-bezier(.2,.9,.3,1.3) ${entra('gancho')} forwards, desaparece .35s ${T.gancho[1] - 0.35}s forwards}
.gancho .l{display:inline-flex;align-items:center;gap:18px;font-size:92px;font-weight:900;letter-spacing:-.04em;line-height:1.08;
  padding:4px 34px 12px;border-radius:28px;background:rgba(18,18,20,.82);margin:6px 0;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.gancho .o{font-size:60px;font-weight:700;color:#d2d2d7;margin:0 4px}
.punto{width:46px;height:46px;border-radius:50%;flex:none;box-shadow:0 0 0 5px rgba(255,255,255,.9)}

/* Beneficios */
.chips{left:48px;top:1180px;display:flex;flex-direction:column;gap:18px;animation:fundido .01s ${entra('chips')} forwards, desaparece .35s ${T.chips[1] - 0.35}s forwards}
.chip{display:flex;align-items:center;gap:18px;padding:18px 34px 18px 20px;border-radius:999px;font-size:44px;font-weight:700;letter-spacing:-.02em;
  background:rgba(18,18,20,.8);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16),0 10px 30px rgba(0,0,0,.35);opacity:0;width:max-content}
.chip i{width:54px;height:54px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center}
.chip:nth-child(1){animation:izq .45s cubic-bezier(.2,.9,.3,1.2) ${entra('chips', 0)} forwards}
.chip:nth-child(2){animation:izq .45s cubic-bezier(.2,.9,.3,1.2) ${entra('chips', 0.7)} forwards}
.chip:nth-child(3){animation:izq .45s cubic-bezier(.2,.9,.3,1.2) ${entra('chips', 1.4)} forwards}

/* Llamado a comentar */
.cta{left:48px;right:48px;top:1150px;padding:34px 36px 38px;border-radius:40px;background:rgba(18,18,20,.86);
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.14),0 18px 50px rgba(0,0,0,.45);
  animation:aparece .5s cubic-bezier(.2,.9,.3,1.2) ${entra('cta')} forwards, desaparece .3s ${T.cta[1] - 0.3}s forwards}
.cta h2{font-size:70px;font-weight:900;letter-spacing:-.04em;line-height:1}
.cta p{font-size:36px;font-weight:500;color:#d2d2d7;margin-top:12px}
.cta .ops{display:flex;gap:18px;margin-top:24px}
.cta .op{flex:1;display:flex;align-items:center;justify-content:center;gap:16px;padding:22px 0;border-radius:24px;font-size:42px;font-weight:900;letter-spacing:.02em}
.cta .op .punto{width:34px;height:34px;box-shadow:0 0 0 4px rgba(255,255,255,.9)}
.cta .b{background:${C.burgundy};animation:late 1s ease-in-out ${entra('cta', 0.6)} infinite}
.cta .a{background:#3d6fa8;animation:late 1s ease-in-out ${entra('cta', 1.1)} infinite}

/* Cierre de marca */
.cierre{inset:0;background:radial-gradient(ellipse 900px 700px at 50% 42%,#3a0f19 0%,#0c0c0e 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;
  animation:fundido .45s ease ${entra('cierre')} forwards}
.cierre .ic{animation:pop .7s cubic-bezier(.2,.9,.3,1.3) ${T.cierre[0] + 0.25}s both;filter:drop-shadow(0 0 60px ${C.luz}88)}
.cierre h1{font-size:110px;font-weight:700;letter-spacing:-.045em;margin-top:56px;animation:aparece .5s ease ${T.cierre[0] + 0.5}s both}
.cierre h1 span{font-weight:500;color:#a1a1a6}
.cierre .tag{font-size:30px;font-weight:600;letter-spacing:.32em;color:#a1a1a6;margin-top:22px;animation:aparece .5s ease ${T.cierre[0] + 0.65}s both}
.cierre .btn{margin-top:90px;display:flex;align-items:center;gap:18px;padding:30px 50px;border-radius:999px;background:#fff;color:${C.grafito};
  font-size:44px;font-weight:900;letter-spacing:-.02em;animation:aparece .5s ease ${T.cierre[0] + 0.85}s both}
.cierre .btn i{width:20px;height:20px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
.cierre .sub{margin-top:28px;font-size:32px;color:#d2d2d7;font-weight:500;animation:aparece .5s ease ${T.cierre[0] + 1}s both}
.cierre .bens{display:flex;gap:16px;margin-top:70px;animation:aparece .5s ease ${T.cierre[0] + 1.1}s both}
.cierre .bens div{padding:14px 26px;border-radius:999px;font-size:28px;font-weight:600;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18)}
</style></head><body>

<div class="capa marca">${icono(64, '#fff', C.grafito)}iPonce<span>Store</span></div>

<div class="capa sticker">
  <svg class="aro" viewBox="0 0 230 230"><defs><path id="c" d="M115,115 m-94,0 a94,94 0 1,1 188,0 a94,94 0 1,1 -188,0"/></defs>
    <circle cx="115" cy="115" r="113" fill="#fff"/>
    <text font-family="InterD" font-weight="900" font-size="24" fill="${C.grafito}">
      <textPath href="#c" textLength="586" lengthAdjust="spacing">ORIGINALES • GARANTÍA • DELIVERY • </textPath></text></svg>
  <div class="centro"><svg viewBox="180 200 680 640" width="88" height="83">${glifo('#fff', '#fff')}</svg></div>
</div>

<div class="capa gancho">
  <div class="l"><span class="punto" style="background:${C.burgundy}"></span>¿Borgoña</div><br>
  <div class="l"><span class="o">o</span>Glaciar?<span class="punto" style="background:#8fb8e8"></span></div>
</div>

<div class="capa chips">
  ${['100% originales', 'Garantía iPonce', 'Delivery en Lima'].map((t) =>
    `<div class="chip"><i><svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></i>${t}</div>`).join('')}
</div>

<div class="capa cta">
  <h2>¿Cuál te llevas?</h2>
  <p>Comenta tu color y te escribimos</p>
  <div class="ops">
    <div class="op b"><span class="punto" style="background:#5a1422"></span>BORGOÑA</div>
    <div class="op a"><span class="punto" style="background:#8fb8e8"></span>GLACIAR</div>
  </div>
</div>

<div class="capa cierre">
  <div class="ic">${icono(300, '#fff', C.grafito)}</div>
  <h1>iPonce <span>Store</span></h1>
  <div class="tag">IPHONE ORIGINALES · LIMA</div>
  <div class="btn"><i></i>Escríbenos por WhatsApp</div>
  <div class="sub">Link en el perfil</div>
  <div class="bens"><div>Garantía iPonce</div><div>Delivery en Lima</div><div>Pago con Yape</div></div>
</div>

<script>document.fonts.ready.then(()=>{document.getAnimations().forEach(a=>a.pause());document.body.dataset.listo=1});
window.ir=t=>document.getAnimations().forEach(a=>{a.currentTime=t*1000});</script>
</body></html>`;

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
writeFileSync(join(TMP, 'overlay.html'), html);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(join(TMP, 'overlay.html')).href);
  await page.waitForSelector('body[data-listo="1"]');
  const frames = Math.ceil(TOTAL * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.ir(t), f / FPS);
    await page.screenshot({ path: join(TMP, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
  }
  // Portada del reel (lo que se ve en el perfil antes de reproducir)
  await page.evaluate((t) => window.ir(t), 1.6);
  await page.screenshot({ path: join(TMP, 'portada-overlay.png'), omitBackground: true });
} finally {
  await browser.close();
}

const base = '[0:v]scale=1080:1920:flags=lanczos,setsar=1,fps=30';
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', entrada, '-framerate', String(FPS), '-i', join(TMP, 'f%04d.png'),
  '-filter_complex',
  // Fondo de la duración total; el video original se congela en su último cuadro debajo del cierre.
  `color=c=black:s=${W}x${H}:r=${FPS}:d=${TOTAL.toFixed(3)}[f];${base}[b];[f][b]overlay=eof_action=repeat[fb];` +
  `[fb][1:v]overlay=format=auto,format=yuv420p[v];` +
  `[0:a]afade=t=out:st=${(dur - 1.2).toFixed(2)}:d=1.2,apad[a]`,
  '-map', '[v]', '-map', '[a]', '-t', TOTAL.toFixed(3),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', salida], { stdio: 'inherit' });

const portada = salida.replace(/\.mp4$/, '-portada.jpg');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '9.6', '-i', entrada, '-i', join(TMP, 'portada-overlay.png'),
  '-filter_complex', `${base}[b];[b][1:v]overlay`, '-frames:v', '1', '-q:v', '2', portada]);

if (!process.env.CONSERVAR) rmSync(TMP, { recursive: true, force: true });
console.log('Listo:', salida, 'y', portada);
