// Anuncio cinematográfico en 4K con dos videos de unboxing (Borgoña y Glaciar): cortes rápidos, acercamiento lento en cada toma,
// gradación de color, grano y viñeta de cine, capas de marca animadas, precio y cierre. Banda sonora original (sonido-anuncio.py).
// Formatos: 9x16 (2160x3840: TikTok, Reels, Historias) y 4x5 (2160x2700: feed de Facebook e Instagram).
//
// Uso: NODE_PATH=$(npm root -g) node contenido/fuente/anuncio-cine.mjs <borgona.mp4> <glaciar.mp4> <carpeta-salida> [9x16,4x5]
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const [srcA, srcB, dirOut, lista = '9x16,4x5'] = process.argv.slice(2);
if (!srcA || !srcB || !dirOut) {
  console.error('Uso: node anuncio-cine.mjs <borgona.mp4> <glaciar.mp4> <carpeta-salida> [9x16,4x5]');
  process.exit(1);
}
const AQUI = dirname(fileURLToPath(import.meta.url));
const FONTS = join(AQUI, '..', '..', 'marca', 'fuente', 'fonts');
const FPS = 30, CIERRE = 3.6;
const C = { grafito: '#1d1d1f', burgundy: '#8c293b', luz: '#c23a55', rosa: '#f3b6c3', glaciar: '#8fb8e8' };
const OFERTA = { precio: 'S/ 6,200', centimos: '.00', capacidad: '256 GB', whatsapp: '933 493 587' };

// ---------- Montaje: [video, inicio, duración, acercamiento (+ entra / - sale)] ----------
// Cada toma cae dentro de un plano del original (detectados con scdet), así no se cuelan cuadros de otro plano.
const SRC = { a: resolve(srcA), b: resolve(srcB) };
const TOMAS = [
  ['a', 19.55, 1.7, 1], // cámaras Borgoña en primer plano: gancho
  ['a', 0.05, 1.65, 1], // Borgoña en su caja
  ['a', 8.1, 1.1, -1],
  ['a', 12.05, 0.6, 1], // costados
  ['a', 13.35, 0.6, -1],
  ['a', 21.35, 1.1, 1], // cámara en ángulo: 48 MP
  ['a', 22.5, 1.0, -1],
  ['b', 0.05, 1.8, 1], // Glaciar: caja de pie
  ['b', 1.9, 0.8, -1],
  ['b', 8.55, 0.7, 1],
  ['b', 10.72, 0.6, -1],
  ['b', 12.75, 1.4, 1], // pantalla encendida: 6,9″
  ['a', 23.55, 1.1, -1], // confianza
  ['a', 16.35, 2.2, 1], // precio
  ['a', 24.7, 1.65, -1],
  ['b', 14.82, 0.75, 1], // después la cámara pasa a un soporte de carga: se corta antes
];
const T = [];
TOMAS.reduce((t, [, , d]) => { T.push(+t.toFixed(3)); return t + d; }, 0);
const FIN = +TOMAS.reduce((s, [, , d]) => s + d, 0).toFixed(3);
const TOTAL = +(FIN + CIERRE).toFixed(3);

const FORMATOS = {
  '9x16': { w: 1080, h: 1920, recorte: null, // posiciones en px de diseño (se renderiza al doble: 2160 de ancho)
    marca: 150, gancho: 700, capitulo: 1120, dato: 980, chips: 1000, precio: 560, entrega: 1000, barra: 230, cierrePad: 260 },
  '4x5': { w: 1080, h: 1350, recorte: '720:900:0:190',
    marca: 56, gancho: 440, capitulo: 900, dato: 780, chips: 800, precio: 380, entrega: 800, barra: 150, cierrePad: 0 },
};

// ---------- Marca y estilos ----------
const glifo = (letra, punto) => `<circle cx="283" cy="302" r="64" fill="${punto}"/>
  <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
  <path d="M283 473V682"/><path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/></g>`;
const icono = (tam, fondo = '#fff', letra = C.grafito) =>
  `<svg viewBox="0 0 1000 1000" width="${tam}" height="${tam}" style="flex:none"><rect width="1000" height="1000" rx="230" fill="${fondo}"/>${glifo(letra, C.burgundy)}</svg>`;
const fontFace = ['Medium', 'SemiBold', 'Bold', 'Black'].map((w, i) =>
  `@font-face{font-family:'InterD';font-weight:${[500, 600, 700, 900][i]};src:url('${pathToFileURL(join(FONTS, `InterDisplay-${w}.otf`)).href}')}`).join('');
const css = (F) => `${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${F.w}px;height:${F.h}px;background:transparent;overflow:hidden;font-family:'InterD',sans-serif;color:#fff;-webkit-font-smoothing:antialiased}
@keyframes on{from{opacity:0}to{opacity:1}}
@keyframes off{to{opacity:0;transform:translateY(-14px)}}
@keyframes pop{0%{opacity:0;transform:scale(.8)}60%{opacity:1;transform:scale(1.03)}100%{opacity:1;transform:none}}
@keyframes sube{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
@keyframes izq{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:none}}
@keyframes abre{from{opacity:0;letter-spacing:.4em;filter:blur(12px)}to{opacity:1;letter-spacing:-.045em;filter:blur(0)}}
@keyframes barraA{from{transform:translateY(-100%)}to{transform:none}}
@keyframes barraB{from{transform:translateY(100%)}to{transform:none}}
@keyframes flash{0%{opacity:.7}100%{opacity:0}}
@keyframes luz{0%{opacity:0;transform:translateX(-60%) rotate(18deg)}30%{opacity:.55}100%{opacity:0;transform:translateX(160%) rotate(18deg)}}
@keyframes linea{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes late{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.x{position:absolute;opacity:0}
.marca{left:44px;top:${F.marca}px;display:flex;align-items:center;gap:14px;padding:10px 24px 10px 10px;border-radius:999px;background:rgba(14,14,16,.6);
  backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18);font-size:30px;font-weight:700;letter-spacing:-.02em}
.marca span{color:#c7c7cc;font-weight:500;margin-left:-4px}
.barra{left:0;right:0;height:${F.barra}px;background:#000}
.gancho{left:0;right:0;top:${F.gancho}px;text-align:center;text-shadow:0 10px 40px rgba(0,0,0,.55)}
.gancho .ceja{font-size:30px;font-weight:700;letter-spacing:.42em;color:${C.rosa}}
.gancho h1{font-size:118px;font-weight:900;line-height:1;margin-top:16px;white-space:nowrap}
.cap{left:56px;top:${F.capitulo}px;text-shadow:0 8px 30px rgba(0,0,0,.5)}
.cap .num{font-size:28px;font-weight:700;letter-spacing:.3em;color:#e5e5ea}
.cap .ln{width:120px;height:4px;border-radius:2px;margin:18px 0 20px;transform-origin:left}
.cap h2{display:flex;align-items:center;gap:22px;font-size:120px;font-weight:900;letter-spacing:-.05em;line-height:1}
.cap h2 i{width:50px;height:50px;border-radius:50%;box-shadow:0 0 0 6px rgba(255,255,255,.9)}
.dato{left:56px;top:${F.dato}px;text-shadow:0 10px 40px rgba(0,0,0,.55)}
.dato b{display:block;font-size:200px;font-weight:900;letter-spacing:-.06em;line-height:.95}
.dato p{font-size:40px;font-weight:600;color:#f2f2f7;margin-top:8px}
.chips{left:56px;top:${F.chips}px;display:flex;flex-direction:column;gap:16px}
.chip{display:flex;align-items:center;gap:16px;padding:16px 30px 16px 18px;border-radius:999px;font-size:42px;font-weight:700;letter-spacing:-.02em;opacity:0;width:max-content;
  background:rgba(14,14,16,.66);backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16)}
.chip i{width:50px;height:50px;border-radius:50%;background:${C.burgundy};display:flex;align-items:center;justify-content:center}
.precio{left:48px;right:48px;top:${F.precio}px;padding:36px 40px 40px;border-radius:44px;background:rgba(12,12,14,.72);backdrop-filter:blur(18px);
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.14),0 24px 60px rgba(0,0,0,.45)}
.precio .et{font-size:36px;font-weight:700;color:#d2d2d7}
.pr{display:block;font-size:170px;font-weight:900;letter-spacing:-.055em;line-height:1;margin-top:8px;white-space:nowrap;
  background:linear-gradient(135deg,#fff 40%,${C.rosa});-webkit-background-clip:text;background-clip:text;color:transparent}
.pr small{font-size:80px;letter-spacing:-.03em}
.cols{display:flex;gap:14px;margin-top:20px}
.cols span{display:flex;align-items:center;gap:12px;padding:12px 22px;border-radius:999px;font-size:32px;font-weight:700;background:rgba(255,255,255,.1)}
.cols i{width:24px;height:24px;border-radius:50%;box-shadow:0 0 0 3px rgba(255,255,255,.85)}
.entrega{left:48px;right:48px;top:${F.entrega}px;display:flex;flex-direction:column;gap:14px}
.ent{display:flex;align-items:center;gap:20px;padding:20px 28px;border-radius:30px;background:#fff;color:${C.grafito};opacity:0;font-size:44px;font-weight:900;letter-spacing:-.025em}
.ent small{display:block;font-size:28px;font-weight:600;color:#6e6e73;letter-spacing:0;margin-top:2px}
.ent i{width:68px;height:68px;border-radius:20px;background:${C.burgundy};display:flex;align-items:center;justify-content:center;flex:none}
.flash{inset:0;background:#fff}
.luz{top:-20%;bottom:-20%;left:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,236,220,.9),transparent);mix-blend-mode:screen}
.cierre{inset:0;background:radial-gradient(ellipse 900px 700px at 50% 40%,#3a0f19 0%,#0c0c0e 70%),#0c0c0e;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 60px ${F.cierrePad}px}
.cierre h1{font-size:92px;font-weight:900;letter-spacing:-.045em;line-height:1;margin-top:40px}
.cierre .cols span{background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18)}
.cierre .pr{font-size:150px;margin-top:34px}
.cierre .sub{font-size:38px;font-weight:700;color:#e5e5ea;margin-top:14px}
.wa{display:flex;align-items:center;gap:16px;padding:26px 44px;border-radius:999px;background:#fff;color:${C.grafito};font-size:44px;font-weight:900;margin-top:40px}
.wa i{width:18px;height:18px;border-radius:50%;background:#25d366;box-shadow:0 0 0 6px #25d36633}
`;

const A = (n, ini, dur = 0.5, curva = 'cubic-bezier(.2,.9,.3,1.1)', fill = 'both') => `${n} ${dur}s ${curva} ${ini}s ${fill}`;
const ven = (a, b, entrada = 'pop', d = 0.5) => `animation:${A(entrada, a, d)},${A('off', b - 0.3, 0.3, 'ease', 'forwards')}`;
const check = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const svg = (d) => `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const BILLETE = svg('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>');
const PIN = svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>');
const colores = `<span><i style="background:${C.burgundy}"></i>Borgoña</span><span><i style="background:${C.glaciar}"></i>Glaciar</span>`;
const capitulo = (a, b, num, nombre, color) => `<div class="x cap" style="${ven(a, b, 'izq', 0.55)}">
  <div class="num">${num}</div><div class="ln" style="background:${color};animation:${A('linea', a + 0.15, 0.5, 'ease-out')}"></div>
  <h2><i style="background:${color}"></i>${nombre}</h2></div>`;

function overlay() {
  return `
  <div class="x marca" style="animation:${A('izq', 1.75, 0.5)},${A('off', FIN - 0.3, 0.3, 'ease', 'forwards')}">${icono(54)}iPonce<span>Store</span></div>

  <div class="x barra" style="top:0;opacity:1;animation:${A('barraA', 0, 0.6, 'ease-out')},${A('off', T[1] - 0.25, 0.25, 'ease', 'forwards')}"></div>
  <div class="x barra" style="bottom:0;opacity:1;animation:${A('barraB', 0, 0.6, 'ease-out')},${A('off', T[1] - 0.25, 0.25, 'ease', 'forwards')}"></div>
  <div class="x gancho" style="animation:${A('on', 0.2, 0.01)},${A('off', T[1] - 0.25, 0.25, 'ease', 'forwards')};opacity:1">
    <div class="ceja" style="animation:${A('sube', 0.25, 0.6)}">NUEVO</div>
    <h1 style="animation:${A('abre', 0.35, 1.0, 'cubic-bezier(.2,.8,.2,1)')}">iPhone 18 Pro Max</h1></div>

  ${capitulo(T[1] + 0.2, T[3], '01', 'Borgoña', C.burgundy)}
  <div class="x dato" style="${ven(T[5] + 0.1, T[7], 'sube')}"><b>48 MP</b><p>Cámara con apertura variable</p></div>
  ${capitulo(T[7] + 0.2, T[9], '02', 'Glaciar', C.glaciar)}
  <div class="x dato" style="${ven(T[11] + 0.1, T[12], 'sube')}"><b>6,9″</b><p>Pantalla OLED de 120 Hz</p></div>

  <div class="x chips" style="animation:${A('on', T[12], 0.01)},${A('off', T[13] - 0.2, 0.2, 'ease', 'forwards')}">
    ${['Caja sellada', '100% original', 'Garantía Apple'].map((c, k) => `<div class="chip" style="animation:${A('izq', T[12] + 0.05 + k * 0.28, 0.38)}"><i>${check}</i>${c}</div>`).join('')}</div>

  <div class="x precio" style="${ven(T[13] + 0.1, FIN)}">
    <div class="et">iPhone 18 Pro Max · ${OFERTA.capacidad}</div><b class="pr">${OFERTA.precio}<small>${OFERTA.centimos}</small></b>
    <div class="cols">${colores}</div></div>
  <div class="x entrega" style="animation:${A('on', T[14], 0.01)},${A('off', FIN - 0.3, 0.3, 'ease', 'forwards')}">
    <div class="ent" style="animation:${A('sube', T[14] + 0.1, 0.45)}"><i>${BILLETE}</i><div>Pago contraentrega<small>Pagas cuando lo recibes</small></div></div>
    <div class="ent" style="animation:${A('sube', T[14] + 0.45, 0.45)}"><i>${PIN}</i><div>O recojo<small>Coordina por WhatsApp</small></div></div></div>

  ${[T[1], T[13]].map((t) => `<div class="x flash" style="animation:${A('flash', t, 0.22, 'ease-out', 'none')}"></div>`).join('')}
  ${[T[7], FIN - 0.4].map((t) => `<div class="x luz" style="animation:${A('luz', t - 0.2, 0.7, 'ease-in-out', 'none')}"></div>`).join('')}

  <div class="x cierre" style="animation:${A('on', FIN - 0.05, 0.45, 'ease')}">
    <div style="filter:drop-shadow(0 30px 80px ${C.luz}88);animation:${A('pop', FIN + 0.2, 0.6)}">${icono(200)}</div>
    <h1 style="animation:${A('sube', FIN + 0.35, 0.5)}">iPhone 18 Pro Max</h1>
    <div class="cols" style="animation:${A('sube', FIN + 0.45, 0.5)}">${colores}</div>
    <b class="pr" style="animation:${A('pop', FIN + 0.6, 0.55)}">${OFERTA.precio}<small>${OFERTA.centimos}</small></b>
    <div class="sub" style="animation:${A('sube', FIN + 0.8, 0.5)}">Garantía Apple · Contraentrega o recojo</div>
    <div class="wa" style="animation:${A('sube', FIN + 1, 0.5)},${A('late', FIN + 1.6, 1, 'ease-in-out', 'infinite')}"><i></i>WhatsApp ${OFERTA.whatsapp}</div>
  </div>`;
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const tmpBase = join(AQUI, '.tmp-anuncio-cine');
rmSync(tmpBase, { recursive: true, force: true });
mkdirSync(resolve(dirOut), { recursive: true });

// Banda sonora (la misma para los dos formatos)
const tiempos = join(tmpBase, 'tiempos.json');
mkdirSync(tmpBase, { recursive: true });
writeFileSync(tiempos, JSON.stringify({
  T, fin: FIN, total: TOTAL, precio: T[13], whoosh: [T[1], T[5], T[7], T[11], T[12], FIN],
  pops: [0, 1, 2].map((k) => T[12] + 0.05 + k * 0.28).concat([T[14] + 0.1, T[14] + 0.45]),
}));
const wav = join(tmpBase, 'sonido.wav');
execFileSync('python3', [join(AQUI, 'sonido-anuncio.py'), wav, tiempos], { stdio: 'inherit' });
const wavN = join(tmpBase, 'sonido-n.wav');
ffmpeg(['-i', wav, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '48000', wavN]);

const browser = await chromium.launch();
try {
  for (const id of lista.split(',')) {
    const F = FORMATOS[id];
    const W = F.w * 2, H = F.h * 2;
    const tmp = join(tmpBase, id);
    mkdirSync(tmp, { recursive: true });

    // Capas de marca, cuadro por cuadro, al doble de resolución
    writeFileSync(join(tmp, 'o.html'), `<!doctype html><html><head><meta charset="utf-8"><style>${css(F)}</style></head><body>${overlay()}
<script>document.fonts.ready.then(()=>{document.getAnimations().forEach(a=>a.pause());document.body.dataset.listo=1});
window.ir=t=>document.getAnimations().forEach(a=>{a.currentTime=t*1000});</script></body></html>`);
    const page = await browser.newPage({ viewport: { width: F.w, height: F.h }, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(join(tmp, 'o.html')).href);
    await page.waitForSelector('body[data-listo="1"]');
    const n = Math.round(TOTAL * FPS);
    for (let f = 0; f < n; f++) {
      await page.evaluate((s) => window.ir(s), f / FPS);
      await page.screenshot({ path: join(tmp, `f${String(f).padStart(4, '0')}.png`), omitBackground: true });
    }
    await page.evaluate((s) => window.ir(s), T[13] + 1.2);
    await page.screenshot({ path: join(tmp, 'portada.png'), omitBackground: true });
    await page.close();

    // Paso 1: cada toma mejorada a 4K con acercamiento lento; luego se unen, se gradúan y se congela el final bajo el cierre.
    const entradas = TOMAS.flatMap(([v, ss, d]) => ['-ss', String(ss), '-t', String(d + 0.1), '-i', SRC[v]]);
    const cadena = TOMAS.map(([, , d, dir], i) => {
      const N = Math.round(d * FPS);
      const z = dir > 0 ? `1+0.07*on/${N}` : `1.07-0.07*on/${N}`;
      return `[${i}:v]fps=${FPS},trim=end_frame=${N},setpts=PTS-STARTPTS,${F.recorte ? `crop=${F.recorte},` : ''}hqdn3d=1.5:1.5:6:6,`
        + `scale=${W}:${H}:flags=lanczos,zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS},setsar=1[s${i}]`;
    }).join(';');
    const base = join(tmp, 'base.mp4');
    ffmpeg([...entradas, '-filter_complex',
      `${cadena};${TOMAS.map((_, i) => `[s${i}]`).join('')}concat=n=${TOMAS.length}:v=1:a=0,`
      + `unsharp=7:7:0.7:5:5:0,eq=contrast=1.07:saturation=1.08:gamma=0.98,vignette=angle=PI/5,noise=alls=3:allf=t,`
      + `tpad=stop_mode=clone:stop_duration=${CIERRE + 1}[v]`,
      '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', base]);

    // Paso 2: capas encima + sonido
    const out = join(resolve(dirOut), `iponce-anuncio-cine-${id}-4k.mp4`);
    ffmpeg(['-i', base, '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'), '-i', wavN,
      '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v]', '-map', '[v]', '-map', '2:a', '-t', String(TOTAL),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-profile:v', 'high', '-level', '5.1', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
    // Portada: la toma del precio con su tarjeta
    ffmpeg(['-ss', String(T[13] + 1.2), '-i', base, '-i', join(tmp, 'portada.png'), '-filter_complex', '[0:v][1:v]overlay', '-frames:v', '1', '-q:v', '2',
      out.replace(/\.mp4$/, '-portada.jpg')]);
    if (!process.env.CONSERVAR) rmSync(tmp, { recursive: true, force: true });
    console.log(`Listo: ${out} (${TOTAL} s)`);
  }
} finally {
  await browser.close();
  if (!process.env.CONSERVAR) rmSync(tmpBase, { recursive: true, force: true });
}
