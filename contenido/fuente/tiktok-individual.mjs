// Un video de TikTok por cada video original: SIN recortes, SIN dividir pantalla, SIN zoom.
// Mejora de calidad (576x1024 -> 1080x1920 con escalado lanczos, reducción de ruido leve, nitidez y un toque de contraste/color)
// + capas de marca iPonce encima + cierre de marca. Conserva el audio original.
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/tiktok-individual.mjs <carpeta-con-v1..v10> <carpeta-salida> [v1,v2,...]
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const [dirIn, dirOut, lista] = process.argv.slice(2);
if (!dirIn || !dirOut) {
  console.error('Uso: node tiktok-individual.mjs <carpeta-videos> <carpeta-salida> [v1,v2,...]');
  process.exit(1);
}
const AQUI = dirname(fileURLToPath(import.meta.url));
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const W = 1080, H = 1920, CIERRE = 2.6;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', glaciar: '#8fb8e8' };
const MEJORA = 'hqdn3d=1.2:1.2:4:4,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0,eq=contrast=1.04:saturation=1.07';

// ---------- Contenido de cada video ----------
// gancho: líneas del texto inicial (cada línea: textos y ['dot', color]) · momentos: textos en el medio · cta: llamado final · pregunta: texto del cierre
const BENEF = ['Caja sellada', 'Garantía iPonce', 'Delivery en Lima'];
const VIDEOS = {
  v1: { nombre: 'glaciar-unboxing', gancho: [[['dot', C.glaciar], 'Glaciar']], gancho2: 'El color del momento',
    momentos: [{ a: 3.4, b: 6.4, chips: ['iPhone 18 Pro Max', ...BENEF.slice(0, 2)] }],
    cta: { titulo: '¿Te lo llevas?', sub: 'Escríbenos y te cotizamos hoy' }, pregunta: '¿El próximo<br>es para ti?' },
  v2: { nombre: 'borgona-o-glaciar', gancho: [[['dot', C.burgundy], '¿Borgoña'], ['o Glaciar?', ['dot', C.glaciar]]],
    momentos: [{ a: 3.6, b: 8.4, chips: ['100% originales', ...BENEF.slice(1)] }],
    cta: { titulo: '¿Cuál te llevas?', sub: 'Comenta tu color y te escribimos', botones: [['BORGOÑA', C.burgundy], ['GLACIAR', '#3d6fa8']] },
    pregunta: '¿Borgoña o<br>Glaciar?' },
  v3: { nombre: 'asi-se-ve-en-persona', gancho: [['Así se ve'], ['en persona 👀']],
    momentos: [{ a: 3.6, b: 10.6, chips: ['Pantalla de 6,9″', 'Cámara de 48 MP', 'Chip A20 Pro'], paso: 1.6 }],
    cta: { titulo: '¿Lo quieres?', sub: 'Escríbenos y te lo llevamos' }, pregunta: '¿Lo quieres<br>en tus manos?' },
  v4: { nombre: 'glaciar-360', gancho: [['360° del'], ['iPhone 18 Pro Max']],
    momentos: [{ a: 3.4, b: 5.8, chips: BENEF, paso: 0.6 }],
    cta: { titulo: '¿Equipo Glaciar?', sub: 'Comenta 🩵 y te escribimos' }, pregunta: '¿Equipo<br>Glaciar?' },
  v5: { nombre: 'negro', gancho: [[['dot', '#2a2a2e'], 'Negro.']], gancho2: 'Sin discusión 🖤',
    momentos: [{ a: 3.4, b: 6.6, chips: BENEF, paso: 0.7 }],
    cta: { titulo: '¿Equipo Negro?', sub: 'Comenta 🖤 y te escribimos' }, pregunta: '¿Equipo<br>Negro?' },
  v6: { nombre: 'unboxing-borgona', gancho: [['Unboxing'], [`<span style="color:${C.luz}">Borgoña</span>&nbsp;🍷`]],
    momentos: [
      { a: 3.6, b: 9, chips: ['iPhone 18 Pro Max', 'Caja sellada'] },
      { a: 9.5, b: 15.5, texto: 'Ese color en persona…', sub: 'no hay foto que le haga justicia' },
      { a: 19.5, b: 26.5, texto: '¿Armamos tu setup?', sub: 'Pregúntanos por accesorios' },
    ],
    cta: { titulo: '¿Te lo llevas?', sub: 'Escríbenos y te cotizamos hoy' }, pregunta: '¿Borgoña<br>para ti?' },
  v7: { nombre: 'cual-es-tu-color', gancho: [['¿Cuál es'], ['tu color?']],
    momentos: [{ a: 3.4, b: 6, chips: ['100% originales', ...BENEF.slice(1)], paso: 0.6 }],
    cta: { titulo: 'Comenta tu color', sub: 'y te decimos si lo tenemos 👇' }, pregunta: '¿Cuál es<br>tu color?' },
  v8: { nombre: 'tres-colores-en-caja', gancho: [['Glaciar, Borgoña'], ['y Negro 📦']],
    momentos: [{ a: 3.6, b: 9.6, chips: ['iPhone 18 Pro Max', '100% originales', 'Garantía iPonce'], paso: 1 },
      { a: 10, b: 13.2, texto: 'Elige el tuyo', sub: 'y te lo llevamos en Lima' }],
    cta: { titulo: '¿Cuál te llevas?', sub: 'Comenta tu color 👇' }, pregunta: '¿Cuál te<br>llevas?' },
  v9: { nombre: 'unboxing-asmr', gancho: [['Unboxing'], ['iPhone 18 Pro Max']], gancho2: '🎧 sube el volumen', fin: 4.2,
    momentos: [
      { a: 5, b: 15, chips: ['Glaciar', 'Borgoña'], paso: 1.2 },
      { a: 17, b: 25, chips: ['Caja sellada', 'Garantía iPonce'], paso: 1 },
      { a: 31.5, b: 37, texto: 'Hello 👋', sub: 'tu nuevo iPhone 18 Pro Max' },
    ],
    cta: { titulo: '¿El tuyo cuándo?', sub: 'Escríbenos y te lo llevamos' }, pregunta: '¿El próximo<br>es para ti?' },
  v11: { nombre: 'unboxing-de-pelicula', gancho: [['Unboxing'], ['de película 🎬']], gancho2: 'iPhone 18 Pro Max Borgoña',
    momentos: [
      { a: 3.4, b: 6.2, chips: ['Caja sellada', 'Garantía iPonce'], paso: 0.8 },
      { a: 6.4, b: 9.8, texto: 'Apertura variable', sub: 'Controla la luz como una cámara pro: de ƒ/1.48 a ƒ/4' },
    ],
    cta: { titulo: '¿Te lo llevas?', sub: 'Escríbenos y te cotizamos hoy' }, pregunta: '¿El próximo<br>es para ti?' },
  v10: { nombre: 'tres-datos', gancho: [['El 18 Pro Max'], ['en 3 datos']],
    momentos: [
      { a: 2.8, b: 4.6, dato: '6,9″', sub: 'Pantalla OLED 120 Hz' },
      { a: 4.6, b: 6.4, dato: 'A20 Pro', sub: 'El primer chip de iPhone en 2 nm' },
      { a: 6.4, b: 8.2, dato: '48 MP', sub: 'Cámara con apertura variable' },
    ], sinCta: true, pregunta: '¿Lo quieres?' },
};

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
@keyframes gira{to{transform:rotate(360deg)}}
@keyframes late{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.x{position:absolute;opacity:0}
.marca{left:48px;top:200px;display:flex;align-items:center;gap:16px;padding:12px 26px 12px 12px;border-radius:999px;background:rgba(18,18,20,.74);
  box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18),0 10px 30px rgba(0,0,0,.35);font-size:34px;font-weight:700;letter-spacing:-.02em}
.marca span{color:#c7c7cc;font-weight:500;margin-left:-4px}
.sticker{right:44px;top:170px;width:230px;height:230px}
.sticker .aro{position:absolute;inset:0;animation:gira 9s linear infinite}
.sticker .centro{position:absolute;inset:52px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(255,255,255,.95),0 12px 30px rgba(0,0,0,.4)}
.gancho{left:0;right:0;top:470px;text-align:center}
.l{display:inline-flex;align-items:center;gap:18px;font-size:92px;font-weight:900;letter-spacing:-.04em;line-height:1.08;padding:4px 34px 12px;border-radius:28px;background:rgba(18,18,20,.84);margin:6px 0;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.l.s{font-size:54px;font-weight:700;padding:10px 28px 14px;color:#e5e5ea}
.punto{width:46px;height:46px;border-radius:50%;flex:none;box-shadow:0 0 0 5px rgba(255,255,255,.9)}
.chips{left:48px;top:1180px;display:flex;flex-direction:column;gap:18px}
.chip{display:flex;align-items:center;gap:18px;padding:18px 34px 18px 20px;border-radius:999px;font-size:44px;font-weight:700;letter-spacing:-.02em;
  background:rgba(18,18,20,.82);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16),0 10px 30px rgba(0,0,0,.35);opacity:0;width:max-content}
.chip i{width:54px;height:54px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center}
.panel{left:48px;right:48px;top:1150px;padding:34px 36px 38px;border-radius:40px;background:rgba(18,18,20,.86);box-shadow:inset 0 0 0 2px rgba(255,255,255,.14),0 18px 50px rgba(0,0,0,.45)}
.panel h2{font-size:72px;font-weight:900;letter-spacing:-.04em;line-height:1}
.panel p{font-size:38px;font-weight:500;color:#d2d2d7;margin-top:12px}
.dato{left:48px;right:48px;top:1060px;padding:34px 40px 40px;border-radius:44px;background:rgba(18,18,20,.86);box-shadow:inset 0 0 0 2px rgba(255,255,255,.14),0 18px 50px rgba(0,0,0,.45)}
.dato b{display:block;font-size:170px;font-weight:900;letter-spacing:-.05em;line-height:1;color:#fff}
.dato p{font-size:44px;font-weight:600;color:#d2d2d7;margin-top:10px}
.ops{display:flex;gap:18px;margin-top:24px}
.op{flex:1;display:flex;align-items:center;justify-content:center;padding:22px 0;border-radius:24px;font-size:42px;font-weight:900;letter-spacing:.02em}
.cierre{inset:0;background:radial-gradient(ellipse 900px 700px at 50% 42%,#3a0f19 0%,#0c0c0e 70%),#0c0c0e;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 70px}
.cierre h1{font-size:112px;font-weight:900;letter-spacing:-.045em;line-height:1;margin-top:60px}
.cierre .tag{font-size:30px;font-weight:600;letter-spacing:.32em;color:#a1a1a6;margin-top:26px}
.pill{padding:14px 26px;border-radius:999px;font-size:30px;font-weight:700;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18)}
.wa{display:flex;align-items:center;gap:18px;padding:30px 50px;border-radius:999px;background:#fff;color:${C.grafito};font-size:44px;font-weight:900}
.wa i{width:20px;height:20px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
`;

const A = (n, ini, dur = 0.5, curva = 'cubic-bezier(.2,.9,.3,1.2)', fill = 'both') => `${n} ${dur}s ${curva} ${ini}s ${fill}`;
const ven = (a, b, entrada = 'pop', d = 0.5) => `animation:${A(entrada, a, d)},${A('off', b - 0.3, 0.3, 'ease', 'forwards')}`;
const check = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const linea = (partes, cls = '') => `<div class="l ${cls}">${[].concat(partes).map((p) => Array.isArray(p) ? `<span class="punto" style="background:${p[1]}"></span>` : p).join('')}</div>`;

function overlay(cfg, fin) {
  const total = fin + CIERRE;
  const fg = cfg.fin ?? 3.2;
  const gancho = `<div class="x gancho" style="${ven(0.25, fg)}">
      ${cfg.gancho.map((l) => linea(l)).join('<br>')}${cfg.gancho2 ? '<br>' + linea(cfg.gancho2, 's') : ''}</div>`;

  const momentos = cfg.momentos.map((m) => {
    if (m.chips) {
      const paso = m.paso ?? 0.7;
      return `<div class="x chips" style="animation:${A('on', m.a, 0.01)},${A('off', m.b - 0.3, 0.3, 'ease', 'forwards')}">
        ${m.chips.map((c, k) => `<div class="chip" style="animation:${A('izq', m.a + k * paso, 0.45)}"><i>${check}</i>${c}</div>`).join('')}</div>`;
    }
    if (m.dato) {
      return `<div class="x dato" style="${ven(m.a, m.b, 'pop', 0.45)}"><b>${m.dato}</b><p>${m.sub}</p></div>`;
    }
    return `<div class="x panel" style="${ven(m.a, m.b, 'sube')}"><h2>${m.texto}</h2><p>${m.sub}</p></div>`;
  }).join('');

  const ctaA = Math.max(fin - 3.2, 0.5);
  const cta = cfg.sinCta ? '' : `<div class="x panel" style="${ven(ctaA, fin, 'sube')}">
      <h2>${cfg.cta.titulo}</h2><p>${cfg.cta.sub}</p>
      ${cfg.cta.botones ? `<div class="ops">${cfg.cta.botones.map(([t, c], k) => `<div class="op" style="background:${c};animation:${A('late', ctaA + 0.6 + k * 0.5, 1, 'ease-in-out', 'infinite')}">${t}</div>`).join('')}</div>`
        : `<div class="ops"><div class="op" style="background:#fff;color:${C.grafito};gap:16px;animation:${A('late', ctaA + 0.6, 1, 'ease-in-out', 'infinite')}"><span style="width:18px;height:18px;border-radius:50%;background:#25d366"></span>Escríbenos por WhatsApp</div></div>`}</div>`;

  return { total, html: `
  <div class="x marca" style="animation:${A('izq', 0.15, 0.5)},${A('off', fin - 0.3, 0.3, 'ease', 'forwards')}">${icono(64)}iPonce<span>Store</span></div>
  <div class="x sticker" style="animation:${A('pop', 0.6, 0.6)},${A('off', fin - 0.3, 0.3, 'ease', 'forwards')}">
    <svg class="aro" viewBox="0 0 230 230"><defs><path id="c" d="M115,115 m-94,0 a94,94 0 1,1 188,0 a94,94 0 1,1 -188,0"/></defs>
      <circle cx="115" cy="115" r="113" fill="#fff"/>
      <text font-family="InterD" font-weight="900" font-size="24" fill="${C.grafito}"><textPath href="#c" textLength="586" lengthAdjust="spacing">ORIGINALES • GARANTÍA • DELIVERY • </textPath></text></svg>
    <div class="centro"><svg viewBox="180 200 680 640" width="88" height="83">${glifo('#fff', '#fff')}</svg></div>
  </div>
  ${gancho}${momentos}${cta}
  <div class="x cierre" style="animation:${A('on', fin - 0.05, 0.45, 'ease')}">
    <div style="filter:drop-shadow(0 30px 80px ${C.luz}88);animation:${A('pop', fin + 0.2, 0.6)}">${icono(280)}</div>
    <h1 style="animation:${A('sube', fin + 0.4, 0.5)}">${cfg.pregunta}</h1>
    <div class="tag" style="animation:${A('sube', fin + 0.55, 0.5)}">IPONCE STORE · LIMA</div>
    <div style="display:flex;gap:14px;margin-top:56px;flex-wrap:wrap;justify-content:center;animation:${A('sube', fin + 0.7, 0.5)}">${BENEF.map((b) => `<div class="pill">${b}</div>`).join('')}</div>
    <div class="wa" style="margin-top:50px;animation:${A('sube', fin + 0.85, 0.5)}"><i></i>Escríbenos por WhatsApp</div>
  </div>` };
}

async function render(id, browser) {
  const cfg = VIDEOS[id];
  const src = join(resolve(dirIn), `${id}.mp4`);
  const fin = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=duration', '-of', 'csv=p=0', src]).toString());
  const [fn, fd] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', src]).toString().trim().split('/').map(Number);
  const fps = Math.round(fn / fd);
  const { total, html } = overlay(cfg, fin);
  const tmp = join(AQUI, `.tmp-ind-${id}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  writeFileSync(join(tmp, 'o.html'), `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${html}
<script>document.fonts.ready.then(()=>{document.getAnimations().forEach(a=>a.pause());document.body.dataset.listo=1});
window.ir=t=>document.getAnimations().forEach(a=>{a.currentTime=t*1000});</script></body></html>`);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(join(tmp, 'o.html')).href);
  await page.waitForSelector('body[data-listo="1"]');
  const n = Math.ceil(total * fps);
  for (let f = 0; f < n; f++) {
    await page.evaluate((s) => window.ir(s), f / fps);
    await page.screenshot({ path: join(tmp, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
  }
  await page.evaluate((s) => window.ir(s), 1.5);
  await page.screenshot({ path: join(tmp, 'portada.png'), omitBackground: true });
  await page.close();

  // Paso 1: video mejorado, misma toma completa; el último cuadro se congela debajo del cierre.
  const base = join(tmp, 'base.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', `${MEJORA},setsar=1,fps=${fps},tpad=stop_mode=clone:stop_duration=${CIERRE + 1}`,
    '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', base], { stdio: 'inherit' });
  // Paso 2: capas de marca + audio original (con fundido al final).
  const out = join(resolve(dirOut), `${id}-iponce-${cfg.nombre}.mp4`);
  mkdirSync(dirname(out), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', base, '-framerate', String(fps), '-i', join(tmp, 'f%04d.png'), '-i', src,
    '-filter_complex', `[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]afade=t=out:st=${Math.max(fin - 1.2, 0).toFixed(2)}:d=1.2,apad[a]`,
    '-map', '[v]', '-map', '[a]', '-t', total.toFixed(2),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out],
  { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '1.5', '-i', src, '-i', join(tmp, 'portada.png'),
    '-filter_complex', `[0:v]${MEJORA},setsar=1[b];[b][1:v]overlay`, '-frames:v', '1', '-q:v', '2', out.replace(/\.mp4$/, '-portada.jpg')]);
  if (!process.env.CONSERVAR) rmSync(tmp, { recursive: true, force: true });
  console.log(`Listo: ${out} (${total.toFixed(1)} s)`);
}

const ids = lista ? lista.split(',') : Object.keys(VIDEOS);
const browser = await chromium.launch();
try {
  for (const id of ids) await render(id, browser);
} finally {
  await browser.close();
}
