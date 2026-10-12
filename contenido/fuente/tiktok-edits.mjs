// Edits para TikTok con la identidad de iPonce Store: cortes rápidos, zoom, destellos, textos cinéticos y cierre de marca.
// Los videos salen sin música (pista silenciosa) para ponerles un sonido en tendencia dentro de TikTok.
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/tiktok-edits.mjs <carpeta-con-v1..v5.mp4> <carpeta-salida> [nombre-edit]
//   v1 = Glaciar fondo oscuro · v2 = Borgoña + Glaciar · v3 = Glaciar tela clara · v4 = Glaciar fondo negro · v5 = Negro
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const [dirIn, dirOut, solo] = process.argv.slice(2);
if (!dirIn || !dirOut) {
  console.error('Uso: node tiktok-edits.mjs <carpeta-videos> <carpeta-salida> [nombre]');
  process.exit(1);
}
const SRC = (n) => join(resolve(dirIn), `v${n}.mp4`);
const AQUI = dirname(fileURLToPath(import.meta.url));
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const FPS = 30, W = 1080, H = 1920;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', glaciar: '#a9c9ee' };
const COLOR = {
  Glaciar: 'linear-gradient(145deg,#d8e9fb,#7ea8d8)',
  Borgoña: 'linear-gradient(145deg,#8a2a40,#3f0f1b)',
  Negro: 'linear-gradient(145deg,#4a4a4f,#0d0d0f)',
};

// ---------- Marca ----------
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
@keyframes off{to{opacity:0}}
@keyframes flash{0%{opacity:0}25%{opacity:.9}100%{opacity:0}}
@keyframes sube{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.55)}65%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:none}}
@keyframes golpe{0%{opacity:0;transform:scale(2.4);filter:blur(18px)}60%{opacity:1;transform:scale(.97);filter:blur(0)}100%{opacity:1;transform:none}}
@keyframes letra{0%{opacity:0;transform:translateY(90px) rotate(8deg)}100%{opacity:1;transform:none}}
@keyframes rgb{0%,100%{text-shadow:-6px 0 #ff2d55aa,6px 0 #4cc3ffaa,0 18px 50px #000c}50%{text-shadow:-2px 0 #ff2d5566,2px 0 #4cc3ff66,0 18px 50px #000c}}
@keyframes barre{0%{transform:translateX(-140%) skewX(-20deg);opacity:0}15%{opacity:.9}85%{opacity:.9}100%{transform:translateX(320%) skewX(-20deg);opacity:0}}
@keyframes gira{to{transform:rotate(360deg)}}
@keyframes late{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes vs{0%{opacity:0;transform:translate(-50%,-50%) scale(3) rotate(-20deg)}60%{opacity:1;transform:translate(-50%,-50%) scale(.9) rotate(4deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}}
.capa{position:absolute;inset:0;opacity:0}
.flash{position:absolute;inset:0;background:#fff;opacity:0;mix-blend-mode:screen}
.barrido{position:absolute;top:-10%;bottom:-10%;width:38%;background:linear-gradient(90deg,transparent,#ffffff55,transparent);opacity:0}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,#000000b8 0%,#00000030 24%,transparent 42%,transparent 55%,#000000c8 80%,#000000e0 100%)}
.marca{position:absolute;left:60px;top:190px;display:flex;align-items:center;gap:14px;padding:10px 24px 10px 10px;border-radius:999px;
  background:#0c0c0e99;box-shadow:inset 0 0 0 1.5px #ffffff26;font-size:32px;font-weight:700;letter-spacing:-.02em}
.marca span{color:#c7c7cc;font-weight:500;margin-left:-4px}
.chip{display:inline-flex;align-items:center;gap:12px;font-size:32px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;padding:12px 26px;border-radius:999px;background:${C.burgundy};box-shadow:0 0 50px ${C.burgundy}aa}
.titulo{font-weight:900;letter-spacing:-.05em;line-height:.92;animation-name:rgb;text-shadow:0 18px 50px #000c}
.sub{font-size:50px;font-weight:700;line-height:1.15;letter-spacing:-.02em;text-shadow:0 6px 24px #000a}
.sub b{color:${C.luz};font-weight:900}
.palabra{display:inline-block}
.cierre{background:radial-gradient(ellipse 900px 900px at 50% 40%,#3a0f19 0%,#0c0c0e 68%),#0c0c0e}
.cierre::before{content:'';position:absolute;inset:0;opacity:.45;background-image:radial-gradient(circle,#ffffff14 1.3px,transparent 1.5px);background-size:40px 40px}
.centro{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 70px}
.pill{padding:16px 28px;border-radius:999px;font-size:34px;font-weight:700;background:#ffffff14;box-shadow:inset 0 0 0 2px #ffffff30}
.wa{display:flex;align-items:center;gap:18px;padding:28px 46px;border-radius:999px;background:#fff;color:${C.grafito};font-size:44px;font-weight:800}
.wa i{width:20px;height:20px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
.etq{position:absolute;bottom:560px;display:flex;align-items:center;gap:14px;font-size:46px;font-weight:900;letter-spacing:-.02em;padding:14px 26px;border-radius:999px;background:#0c0c0ecc;box-shadow:inset 0 0 0 2px #ffffff30}
.dot{width:46px;height:46px;border-radius:50%;flex:none;box-shadow:0 0 0 4px #000,0 0 0 7px #ffffffaa}
`;

// ---------- Ayudantes de animación (tiempos absolutos en segundos) ----------
const A = (nombre, inicio, dur = 0.5, curva = 'cubic-bezier(.2,.9,.3,1.15)', extra = 'both') => `${nombre} ${dur}s ${curva} ${inicio}s ${extra}`;
const ventana = (a, b, entra = 0.2, sale = 0.2) => `animation:${A('on', a, entra, 'ease')},${A('off', b - sale, sale, 'ease', 'forwards')}`;
const flashes = (tiempos) => tiempos.map((t) => `<div class="flash" style="animation:${A('flash', t - 0.04, 0.22, 'ease-out')}"></div>`).join('');
const barridos = (tiempos) => tiempos.map((t) => `<div class="barrido" style="transform:translateX(-140%) skewX(-20deg);animation:${A('barre', t, 0.7, 'ease-in-out')}"></div>`).join('');
const letras = (txt, inicio, paso = 0.05) => [...txt].map((ch, k) =>
  `<span class="palabra" style="animation:${A('letra', inicio + k * paso, 0.45)}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
const marca = (a, b) => `<div class="marca" style="opacity:0;${ventana(a, b)}">${icono(54)}iPonce<span>Store</span></div>`;
const cierre = (a, b, pregunta = '¿Cuál te llevas?') => `
<div class="capa cierre" style="${ventana(a, b + 1, 0.3, 0.01)}">
  <div class="centro">
    <div style="filter:drop-shadow(0 30px 90px ${C.luz}99);animation:${A('golpe', a + 0.1, 0.6)}">${icono(270)}</div>
    <div class="titulo" style="font-size:118px;margin-top:60px;animation:${A('sube', a + 0.3, 0.5)},${A('rgb', a, 1.2, 'ease-in-out', 'infinite')}">${pregunta}</div>
    <div class="sub" style="margin-top:26px;color:#e5e5ea;animation:${A('sube', a + 0.45, 0.5)}">Comenta 👇 y te escribimos</div>
    <div style="display:flex;gap:14px;margin-top:56px;flex-wrap:wrap;justify-content:center;animation:${A('sube', a + 0.6, 0.5)}">
      <div class="pill">Caja sellada</div><div class="pill">Garantía iPonce</div><div class="pill">Delivery en Lima</div></div>
    <div class="wa" style="margin-top:50px;animation:${A('sube', a + 0.8, 0.5)},${A('late', a + 1.4, 1, 'ease-in-out', 'infinite')}"><i></i>Escríbenos por WhatsApp</div>
  </div>
</div>`;

// ---------- Definición de los edits ----------
// partes: { d: duración, tipo: 'full'|'split2'|'split3'|'negro', src: [[video, inicio], ...], zoom: [desde, hasta] }
const EDITS = {
  'elige-tu-color': () => {
    const P = [
      { d: 2.2, tipo: 'full', src: [[1, 0.5]], zoom: [1.12, 1.0] },
      { d: 2.8, tipo: 'full', src: [[4, 1.8]], zoom: [1.0, 1.1] },
      { d: 2.8, tipo: 'full', src: [[2, 8.6]], zoom: [1.1, 1.0] },
      { d: 2.8, tipo: 'full', src: [[5, 1.2]], zoom: [1.0, 1.1] },
      { d: 2.6, tipo: 'split3', src: [[4, 5.0], [2, 9.0], [5, 5.5]] },
      { d: 3.2, tipo: 'negro', src: [[1, 0]] },
    ];
    const t = tiempos(P);
    const color = (k, nombre, n) => `
      <div class="capa" style="${ventana(t[k], t[k + 1])}"><div class="velo"></div>
        <div style="position:absolute;left:60px;right:60px;bottom:470px">
          <div class="chip" style="animation:${A('sube', t[k] + 0.1, 0.4)}">Color ${n}/3</div>
          <div class="titulo" style="font-size:190px;margin-top:20px;animation:${A('rgb', t[k], 1, 'ease-in-out', 'infinite')}">${letras(nombre.toUpperCase(), t[k] + 0.15)}</div>
          <div style="display:flex;align-items:center;gap:20px;margin-top:20px;animation:${A('sube', t[k] + 0.6, 0.4)}">
            <span class="dot" style="background:${COLOR[nombre]}"></span><span class="sub">iPhone 18 Pro Max</span></div>
        </div></div>`;
    const html = `
      <div class="capa" style="${ventana(t[0], t[1])}"><div class="velo"></div>
        <div style="position:absolute;left:60px;right:60px;bottom:470px">
          <div class="chip" style="animation:${A('sube', 0.1, 0.4)}">iPhone 18 Pro Max</div>
          <div class="titulo" style="font-size:150px;margin-top:22px;animation:${A('golpe', 0.25, 0.55)},${A('rgb', 0, 1, 'ease-in-out', 'infinite')}">Elige<br>tu color</div>
          <div class="sub" style="margin-top:20px;animation:${A('sube', 0.7, 0.4)}">y comenta el tuyo <b>👇</b></div>
        </div></div>
      ${color(1, 'Glaciar', 1)}${color(2, 'Borgoña', 2)}${color(3, 'Negro', 3)}
      <div class="capa" style="${ventana(t[4], t[5])}"><div class="velo"></div>
        ${['Glaciar', 'Borgoña', 'Negro'].map((n, k) => `<div class="etq" style="left:${k * 360 + 180}px;transform:translateX(-50%);bottom:520px;flex-direction:column;gap:10px;padding:18px 20px;border-radius:28px;font-size:36px;animation:${A('pop', t[4] + 0.15 + k * 0.12, 0.45)}"><span class="dot" style="width:40px;height:40px;background:${COLOR[n]}"></span>${k + 1}. ${n}</div>`).join('')}
        <div style="position:absolute;left:0;right:0;top:420px;text-align:center">
          <div class="titulo" style="font-size:120px;animation:${A('golpe', t[4] + 0.1, 0.5)},${A('rgb', t[4], 1, 'ease-in-out', 'infinite')}">¿Cuál es<br>el tuyo?</div>
          <div class="sub" style="margin-top:18px;animation:${A('sube', t[4] + 0.5, 0.4)}">Comenta <b>1</b>, <b>2</b> o <b>3</b></div></div>
        <div style="position:absolute;top:0;bottom:0;left:358px;width:4px;background:#fff"></div><div style="position:absolute;top:0;bottom:0;left:718px;width:4px;background:#fff"></div>
      </div>
      ${marca(0.1, t[5])}
      ${cierre(t[5], t[6], '¿Cuál color<br>te llevas?')}
      ${flashes(t.slice(1, 6))}${barridos([t[1] + 0.1, t[2] + 0.1, t[3] + 0.1])}`;
    return { P, html, total: t[6], portada: 1.4 };
  },

  'pov-llego-tu-18-pro-max': () => {
    const P = [
      { d: 3.0, tipo: 'full', src: [[1, 0.0]], zoom: [1.0, 1.12] },
      { d: 2.8, tipo: 'full', src: [[3, 0.2]], zoom: [1.12, 1.0] },
      { d: 2.8, tipo: 'full', src: [[3, 3.4]], zoom: [1.0, 1.1] },
      { d: 2.8, tipo: 'full', src: [[3, 7.6]], zoom: [1.1, 1.0] },
      { d: 2.6, tipo: 'full', src: [[4, 5.6]], zoom: [1.0, 1.1] },
      { d: 3.2, tipo: 'negro', src: [[1, 0]] },
    ];
    const t = tiempos(P);
    const txt = (k, chip, linea, sub = '') => `
      <div class="capa" style="${ventana(t[k], t[k + 1])}"><div class="velo"></div>
        <div style="position:absolute;left:60px;right:60px;bottom:480px">
          ${chip ? `<div class="chip" style="animation:${A('sube', t[k] + 0.1, 0.4)}">${chip}</div>` : ''}
          <div class="titulo" style="font-size:108px;margin-top:20px;animation:${A('golpe', t[k] + 0.2, 0.5)},${A('rgb', t[k], 1, 'ease-in-out', 'infinite')}">${linea}</div>
          ${sub ? `<div class="sub" style="margin-top:18px;animation:${A('sube', t[k] + 0.6, 0.4)}">${sub}</div>` : ''}
        </div></div>`;
    const html = `
      <div class="capa" style="${ventana(t[0], t[1])}"><div class="velo"></div>
        <div style="position:absolute;left:60px;right:60px;top:330px">
          <div class="titulo" style="font-size:140px;animation:${A('golpe', 0.15, 0.55)},${A('rgb', 0, 1, 'ease-in-out', 'infinite')}">POV:</div>
          <div class="titulo" style="font-size:96px;margin-top:10px">${letras('por fin llegó', 0.5, 0.04)}</div>
          <div class="titulo" style="font-size:96px;color:${C.luz}">${letras('tu 18 Pro Max', 1.0, 0.04)}</div>
        </div></div>
      ${txt(1, 'Caja sellada', 'El sello lo<br>rompiste <span style="color:' + C.luz + '">tú.</span>', '100% nuevo, de verdad')}
      ${txt(2, 'Glaciar', 'Ese color<br>en persona…', 'no hay foto que le haga justicia')}
      ${txt(3, '48 MP', 'Cámara con<br>apertura variable', 'de <b>ƒ/1.48</b> a <b>ƒ/4</b>')}
      ${txt(4, 'Garantía iPonce', 'Y con respaldo<br>de verdad.', 'Delivery en Lima 📍')}
      ${marca(0.1, t[5])}
      ${cierre(t[5], t[6], '¿El próximo<br>es para ti?')}
      ${flashes(t.slice(1, 6))}${barridos([t[1] + 0.1, t[3] + 0.1])}`;
    return { P, html, total: t[6], portada: 1.6 };
  },

  'negro-vs-glaciar': () => {
    const P = [
      { d: 8.2, tipo: 'split2', src: [[5, 0.6], [4, 0.4]] },
      { d: 3.2, tipo: 'negro', src: [[1, 0]] },
    ];
    const t = tiempos(P);
    const html = `
      <div class="capa" style="${ventana(0, t[1])}">
        <div class="velo"></div>
        <div style="position:absolute;top:0;bottom:0;left:538px;width:4px;background:linear-gradient(180deg,transparent,#fff 20%,#fff 80%,transparent)"></div>
        <div style="position:absolute;left:50%;top:50%;width:230px;height:230px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center;
          font-size:100px;font-weight:900;letter-spacing:-.04em;box-shadow:0 0 0 8px #fff,0 0 90px ${C.luz};animation:${A('vs', 0.2, 0.6)},${A('late', 1, 0.9, 'ease-in-out', 'infinite')}">VS</div>
        <div style="position:absolute;left:0;right:0;top:330px;text-align:center">
          <div class="chip" style="animation:${A('sube', 0.1, 0.4)}">iPhone 18 Pro Max</div>
          <div class="titulo" style="font-size:118px;margin-top:20px;animation:${A('golpe', 0.3, 0.5)},${A('rgb', 0, 1, 'ease-in-out', 'infinite')}">¿Cuál eliges?</div></div>
        <div class="etq" style="left:60px;animation:${A('pop', 0.9, 0.45)}"><span class="dot" style="background:${COLOR.Negro}"></span>Negro</div>
        <div class="etq" style="right:60px;animation:${A('pop', 1.1, 0.45)}"><span class="dot" style="background:${COLOR.Glaciar}"></span>Glaciar</div>
        <div style="position:absolute;left:0;right:0;bottom:440px;text-align:center;animation:${A('sube', 4.2, 0.5)}"><div class="sub">Comenta <b>NEGRO</b> o <b>GLACIAR</b> 👇</div></div>
      </div>
      ${marca(0.1, t[1])}
      ${cierre(t[1], t[2], '¿Negro o<br>Glaciar?')}
      ${flashes([t[1]])}`;
    return { P, html, total: t[2], portada: 1.6 };
  },
};

function tiempos(P) {
  const t = [0];
  for (const p of P) t.push(+(t[t.length - 1] + p.d).toFixed(3));
  return t;
}

// ---------- Base de video (ffmpeg) ----------
function filtroParte(p, k, idx) {
  const tr = (i, [, ini]) => `[${i}:v]trim=start=${ini}:duration=${p.d},setpts=PTS-STARTPTS,fps=${FPS}`;
  if (p.tipo === 'full') {
    const [z0, z1] = p.zoom;
    const n = Math.round(p.d * FPS);
    // Zoom suave: se escala al doble antes para que no tiemble.
    return `${tr(idx[0], p.src[0])},scale=${W * 2}:${H * 2}:flags=lanczos,zoompan=z='${z0}+(${z1 - z0})*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},setsar=1[p${k}]`;
  }
  if (p.tipo === 'split2') {
    return p.src.map((s, j) => `${tr(idx[j], s)},scale=${W}:${H}:flags=lanczos,crop=${W / 2}:${H}:${W / 4}:0,setsar=1[p${k}_${j}]`).join(';') +
      `;[p${k}_0][p${k}_1]hstack=2[p${k}]`;
  }
  if (p.tipo === 'split3') {
    return p.src.map((s, j) => `${tr(idx[j], s)},scale=${W}:${H}:flags=lanczos,crop=${W / 3}:${H}:${W / 3}:0,setsar=1[p${k}_${j}]`).join(';') +
      `;[p${k}_0][p${k}_1][p${k}_2]hstack=3[p${k}]`;
  }
  return `color=c=black:s=${W}x${H}:r=${FPS}:d=${p.d},setsar=1[p${k}]`;
}

async function renderEdit(nombre, browser) {
  const { P, html, total, portada } = EDITS[nombre]();
  const tmp = join(AQUI, `.tmp-${nombre}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  writeFileSync(join(tmp, 'o.html'), `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${html}
<script>document.fonts.ready.then(()=>{document.getAnimations().forEach(a=>a.pause());document.body.dataset.listo=1});
window.ir=t=>document.getAnimations().forEach(a=>{a.currentTime=t*1000});</script></body></html>`);

  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(join(tmp, 'o.html')).href);
  await page.waitForSelector('body[data-listo="1"]');
  const n = Math.round(total * FPS);
  for (let f = 0; f < n; f++) {
    await page.evaluate((s) => window.ir(s), f / FPS);
    await page.screenshot({ path: join(tmp, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
  }
  await page.close();

  // Paso 1: base (cada toma es una entrada propia de ffmpeg).
  const entradas = [];
  const partes = P.map((p, k) => {
    const idx = p.src.map(([v]) => entradas.push(SRC(v)) - 1);
    return filtroParte(p, k, idx);
  });
  const filtro = partes.join(';') + ';' + P.map((_, k) => `[p${k}]`).join('') + `concat=n=${P.length}:v=1:a=0[base]`;
  const base = join(tmp, 'base.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...entradas.flatMap((e) => ['-i', e]), '-filter_complex', filtro, '-map', '[base]',
    '-r', String(FPS), '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', base], { stdio: 'inherit' });

  // Paso 2: capas de marca encima + pista silenciosa.
  const out = join(resolve(dirOut), `iponce-${nombre}.mp4`);
  mkdirSync(dirname(out), { recursive: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', base, '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'),
    '-f', 'lavfi', '-t', total.toFixed(2), '-i', 'anullsrc=r=44100:cl=stereo',
    '-filter_complex', '[0:v]tpad=stop_mode=clone:stop_duration=1[b];[b][1:v]overlay=format=auto,format=yuv420p[v]',
    '-map', '[v]', '-map', '2:a', '-t', total.toFixed(2),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out],
  { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(portada), '-i', out, '-frames:v', '1', '-q:v', '2', out.replace(/\.mp4$/, '-portada.jpg')]);
  if (!process.env.CONSERVAR) rmSync(tmp, { recursive: true, force: true });
  console.log(`Listo: ${out} (${total.toFixed(1)} s)`);
}

const browser = await chromium.launch();
try {
  for (const nombre of solo ? [solo] : Object.keys(EDITS)) await renderEdit(nombre, browser);
} finally {
  await browser.close();
}
