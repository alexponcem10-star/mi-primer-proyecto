// Genera todos los archivos de marca de iPonce Store (logos, perfiles de redes y portada).
// Uso: NODE_PATH=$(npm root -g) node marca/fuente/generar.mjs   (requiere playwright y pdftocairo)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');

const FUENTE = dirname(fileURLToPath(import.meta.url));
const MARCA = join(FUENTE, '..');
const TMP = join(FUENTE, '.tmp');

const C = {
  grafito: '#1d1d1f',
  burgundy: '#8c293b',
  burgundyLuz: '#c23a55',
  perla: '#f5f5f7',
  grisClaro: '#6e6e73',
  grisOscuro: '#a1a1a6',
};

// ---------- Geometría del icono (caja de 1000 x 1000) ----------

// Squircle (superelipse) como los íconos de apps: esquinas continuas, no un simple border-radius.
function squircle(size = 1000, n = 4, pts = 720) {
  const a = size / 2;
  const d = [];
  for (let k = 0; k < pts; k++) {
    const t = (k / pts) * 2 * Math.PI;
    const c = Math.cos(t), s = Math.sin(t);
    const x = a + a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = a + a * Math.sign(s) * Math.abs(s) ** (2 / n);
    d.push(`${k ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return d.join('') + 'Z';
}
const SQUIRCLE = squircle();

// Monograma "iP": trazos de grosor uniforme con remates redondos, centrado ópticamente.
function glifo(letra, punto) {
  return `
    <circle cx="283" cy="302" r="64" fill="${punto}"/>
    <g fill="none" stroke="${letra}" stroke-width="112" stroke-linecap="round" stroke-linejoin="round">
      <path d="M283 473V682"/>
      <path d="M482 682V318H605A128.5 128.5 0 0 1 605 575H482"/>
    </g>`;
}

function iconoSVG({ fondo, letra, punto = C.burgundy, tam = 1000, conFondo = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${tam}" height="${tam}">
    ${conFondo ? `<path d="${SQUIRCLE}" fill="${fondo}"/>` : ''}
    ${glifo(letra, punto)}
  </svg>`;
}

// ---------- HTML base ----------

const fontFace = ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'Black']
  .map((w, i) => `@font-face{font-family:'InterD';font-weight:${[300, 400, 500, 600, 700, 900][i]};
    src:url('${pathToFileURL(join(FUENTE, 'fonts', `InterDisplay-${w}.otf`)).href}')}`)
  .join('\n');

const pagina = (w, h, body, css = '', bg = 'transparent') => `<!doctype html><html><head><meta charset="utf-8">
<style>${fontFace}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;background:${bg};overflow:hidden;font-family:'InterD',sans-serif;
  -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.wm{font-weight:700;letter-spacing:-0.035em;line-height:1;white-space:nowrap;display:inline-flex;align-items:baseline}
.wm .s{font-weight:400;margin-left:0.22em;letter-spacing:-0.02em}
.wm .i{position:relative;display:inline-block}
.wm .i b{position:absolute;border-radius:50%;background:${C.burgundy}}
.tag{font-weight:500;letter-spacing:0.32em;text-transform:uppercase;white-space:nowrap}
${css}</style></head><body>${body}
<script>
// La "i" de iPonce se dibuja sin punto (ı) y se le pone el punto burgundy, igual que en el icono.
document.fonts.ready.then(()=>{
  document.querySelectorAll('.wm .i').forEach(el=>{
    const fs=parseFloat(getComputedStyle(el).fontSize);
    const cv=document.createElement('canvas');cv.width=fs*2;cv.height=fs*2;
    const g=cv.getContext('2d');g.font='700 '+fs+'px InterD';g.textBaseline='alphabetic';
    g.fillText('i',fs*0.5,fs*1.5);
    const data=g.getImageData(0,0,cv.width,cv.height).data;
    let top=1e9,bot=-1,l=1e9,r=-1;
    for(let y=0;y<cv.height;y++){let row=false;
      for(let x=0;x<cv.width;x++){if(data[(y*cv.width+x)*4+3]>128){row=true;l=Math.min(l,x);r=Math.max(r,x);}}
      if(row){if(top===1e9)top=y;bot=y;} else if(top!==1e9){break;}}
    const d=bot-top+1, cx=(l+r+1)/2-fs*0.5;
    const b=document.createElement('b');
    const dd=d*1.12;
    b.style.width=b.style.height=dd+'px';
    b.style.left=(cx-dd/2)+'px';
    // posición del punto relativa a la línea base
    const base=el.getBoundingClientRect();
    const probe=document.createElement('span');probe.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(probe);
    const baseY=probe.getBoundingClientRect().top-base.top;
    b.style.top=(baseY-(fs*1.5-(top+bot+1)/2)-dd/2)+'px';
    el.appendChild(b);
  });
  document.body.dataset.listo='1';
});
</script></body></html>`;

const wordmark = (color, gris) =>
  `<span class="wm" style="color:${color}"><span class="i">ı</span>Ponce<span class="s" style="color:${gris}">Store</span></span>`;

// ---------- Render ----------

let browser;
async function render(nombre, w, h, html, { png = [], pdf = false, svg = false, jpg = null } = {}) {
  mkdirSync(TMP, { recursive: true });
  const f = join(TMP, nombre.replace(/\//g, '_') + '.html');
  writeFileSync(f, html);
  for (const [ruta, escala] of png) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: escala });
    await page.goto(pathToFileURL(f).href);
    await page.waitForSelector('body[data-listo="1"]');
    await page.waitForTimeout(150);
    const out = join(MARCA, ruta);
    mkdirSync(dirname(out), { recursive: true });
    await page.screenshot({ path: out, omitBackground: true, type: ruta.endsWith('.jpg') ? 'jpeg' : 'png',
      ...(ruta.endsWith('.jpg') ? { quality: 95 } : {}) });
    await page.close();
  }
  if (pdf || svg) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(pathToFileURL(f).href);
    await page.waitForSelector('body[data-listo="1"]');
    const pdfPath = join(MARCA, pdf || join('.tmp', nombre + '.pdf'));
    mkdirSync(dirname(pdfPath), { recursive: true });
    await page.pdf({ path: pdfPath, width: w + 'px', height: h + 'px', printBackground: true, pageRanges: '1' });
    await page.close();
    if (svg) {
      const out = join(MARCA, svg);
      mkdirSync(dirname(out), { recursive: true });
      // pdftocairo convierte el texto en curvas: el SVG no depende de tener la fuente instalada.
      execFileSync('pdftocairo', ['-svg', pdfPath, out]);
    }
  }
}

// ---------- Piezas ----------

const ICONOS = {
  'icono-grafito': { fondo: C.grafito, letra: '#fff' },
  'icono-perla': { fondo: '#fff', letra: C.grafito },
};

const centro = (inner) => `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${inner}</div>`;

function logoVertical(oscuro) {
  const icono = iconoSVG(oscuro ? { fondo: '#fff', letra: C.grafito, tam: 360 } : { fondo: C.grafito, letra: '#fff', tam: 360 });
  return centro(`<div style="display:flex;flex-direction:column;align-items:center">
    ${icono}
    <div style="font-size:150px;margin-top:70px">${wordmark(oscuro ? '#fff' : C.grafito, oscuro ? C.grisOscuro : C.grisClaro)}</div>
    <div class="tag" style="font-size:34px;margin-top:56px;color:${oscuro ? C.grisOscuro : C.grisClaro};padding-left:0.32em">iPhone originales · Lima</div>
  </div>`);
}

function logoHorizontal(oscuro) {
  const icono = iconoSVG(oscuro ? { fondo: '#fff', letra: C.grafito, tam: 220 } : { fondo: C.grafito, letra: '#fff', tam: 220 });
  return centro(`<div style="display:flex;align-items:center;gap:56px">
    ${icono}
    <div style="font-size:160px;transform:translateY(-6px)">${wordmark(oscuro ? '#fff' : C.grafito, oscuro ? C.grisOscuro : C.grisClaro)}</div>
  </div>`);
}

// Foto de perfil: fondo a sangre (las redes recortan en círculo) y monograma dentro del área segura.
function perfil(variante) {
  const futurista = variante === 'futurista';
  const perla = variante === 'perla';
  const fondo = perla
    ? `background:radial-gradient(circle at 50% 38%,#ffffff 0%,${C.perla} 70%,#e8e8ed 100%)`
    : futurista
      ? `background:radial-gradient(circle at 50% 120%,${C.burgundy}cc 0%,#2a0d14 38%,#0b0b0d 70%),#0b0b0d`
      : `background:radial-gradient(circle at 50% 30%,#2c2c2f 0%,${C.grafito} 60%,#121214 100%)`;
  const anillo = futurista
    ? `<div style="position:absolute;inset:8%;border-radius:50%;border:6px solid transparent;
        background:conic-gradient(from 200deg,${C.burgundyLuz},transparent 30%,#ffffff55 50%,transparent 70%,${C.burgundyLuz}) border-box;
        -webkit-mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.9"></div>`
    : '';
  const glow = futurista ? `filter:drop-shadow(0 0 40px ${C.burgundyLuz}88)` : '';
  return `<div style="position:relative;width:1080px;height:1080px;${fondo}">
    ${anillo}
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;${glow}">
      <svg viewBox="183 163 650 650" width="600" height="600">${glifo(perla ? C.grafito : '#fff', futurista ? C.burgundyLuz : C.burgundy)}</svg>
    </div></div>`;
}

// Portada de Facebook 1640 x 624 (se muestra a 820 x 312 en PC; en celular se recortan los lados).
function portada() {
  const lentes = [[0, 0], [0, 1], [1, 0.5]].map(([cx, cy]) =>
    `<div class="lente" style="left:${30 + cx * 74}px;top:${18 + cy * 70}px"></div>`).join('');
  const particulas = Array.from({ length: 70 }, (_, k) => {
    const r = (Math.sin(k * 12.9898) * 43758.5453) % 1, r2 = (Math.sin(k * 78.233) * 12345.678) % 1;
    const x = Math.abs(r) * 1640, y = Math.abs(r2) * 470, s = 1 + (k % 3);
    return `<i style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${s}px;height:${s}px;opacity:${(0.15 + (k % 5) * 0.12).toFixed(2)}"></i>`;
  }).join('');
  const css = `
  .bg{position:absolute;inset:0;background:
     radial-gradient(ellipse 520px 380px at 1080px 300px,${C.burgundy}aa 0%,${C.burgundy}33 45%,transparent 75%),
     radial-gradient(ellipse 900px 260px at 820px 640px,${C.burgundy}55,transparent 70%),
     radial-gradient(ellipse 700px 500px at 300px 120px,#1b1b22 0%,transparent 70%),
     linear-gradient(180deg,#060607 0%,#0a0a0c 60%,#120709 100%)}
  .grid{position:absolute;left:-200px;right:-200px;bottom:-40px;height:330px;perspective:420px;overflow:hidden;
     -webkit-mask:linear-gradient(to top,#000 0%,#000 30%,transparent 100%)}
  .grid div{position:absolute;inset:-300px -400px 0 -400px;transform:rotateX(68deg);transform-origin:50% 100%;
     background-image:linear-gradient(${C.burgundyLuz}66 2px,transparent 2px),linear-gradient(90deg,${C.burgundyLuz}55 2px,transparent 2px);
     background-size:72px 72px}
  .haz{position:absolute;height:2px;background:linear-gradient(90deg,transparent,#fff,transparent);filter:blur(.4px)}
  .parts i{position:absolute;border-radius:50%;background:#fff}
  .escena{position:absolute;left:790px;top:52px;width:560px;height:520px;perspective:1600px}
  .tel{position:absolute;width:250px;height:520px;border-radius:52px;transform-style:preserve-3d}
  .tel .cara{position:absolute;inset:0;border-radius:52px;
     background:linear-gradient(135deg,#3a3a3f 0%,#18181b 35%,#0e0e10 60%,#2a2a2e 100%);
     box-shadow:inset 0 0 0 3px #5a5a60,inset 0 0 0 6px #111,inset 0 2px 20px #ffffff22,0 40px 80px #000c}
  .tel .borde{position:absolute;inset:-2px;border-radius:54px;
     background:linear-gradient(160deg,#fff 0%,#8a8a90 18%,#2a2a2e 40%,${C.burgundyLuz} 85%,#fff 100%);z-index:-1}
  .tel .meseta{position:absolute;left:14px;right:14px;top:16px;height:150px;border-radius:40px;
     background:linear-gradient(160deg,#2c2c31,#121214);box-shadow:inset 0 0 0 2px #ffffff18,0 6px 18px #0009}
  .lente{position:absolute;width:62px;height:62px;border-radius:50%;
     background:radial-gradient(circle at 40% 35%,#4b5a7a 0%,#141a2a 28%,#050507 55%);
     box-shadow:0 0 0 5px #2e2e33,0 0 0 7px #0006,inset 0 0 8px #000}
  .lente::after{content:'';position:absolute;left:16px;top:13px;width:10px;height:10px;border-radius:50%;background:#ffffffaa;filter:blur(1px)}
  .tel .brillo{position:absolute;inset:0;border-radius:52px;
     background:linear-gradient(115deg,transparent 30%,#ffffff1f 42%,transparent 52%)}
  .t1{left:250px;top:10px;transform:rotateY(-24deg) rotateZ(8deg)}
  .t2{left:60px;top:40px;transform:rotateY(22deg) rotateZ(-10deg) scale(.88);filter:brightness(.75)}
  .reflejo{position:absolute;left:800px;top:520px;width:560px;height:90px;border-radius:50%;
     background:radial-gradient(ellipse at center,${C.burgundyLuz}88,transparent 70%);filter:blur(10px)}
  .halo{position:absolute;left:920px;top:40px;width:420px;height:420px;border-radius:50%;
     border:2px solid ${C.burgundyLuz}55;box-shadow:0 0 60px ${C.burgundyLuz}44,inset 0 0 60px ${C.burgundyLuz}33}
  .halo2{position:absolute;left:860px;top:-20px;width:540px;height:540px;border-radius:50%;border:1px solid #ffffff14}
  .txt{position:absolute;left:300px;top:96px;width:620px;color:#fff}
  .chip{display:inline-flex;align-items:center;gap:12px;padding:10px 20px 10px 14px;border-radius:999px;
     font-size:19px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#fff;
     background:linear-gradient(90deg,${C.burgundy}cc,${C.burgundy}44);box-shadow:inset 0 0 0 1px #ffffff33,0 0 30px ${C.burgundy}66}
  .chip .dot{width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 12px #fff}
  h1{font-weight:700;font-size:84px;line-height:.98;letter-spacing:-0.045em;margin-top:26px}
  h1 em{font-style:normal;background:linear-gradient(90deg,#ff7d97 0%,${C.burgundyLuz} 45%,#fff 100%);
     -webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{margin-top:24px;display:flex;gap:22px;font-size:21px;font-weight:500;color:#d2d2d7;letter-spacing:.01em}
  .sub span{display:flex;align-items:center;gap:9px}
  .sub span::before{content:'';width:8px;height:8px;border-radius:50%;background:${C.burgundyLuz};box-shadow:0 0 10px ${C.burgundyLuz}}
  .marca{position:absolute;left:300px;top:42px;display:flex;align-items:center;gap:12px;font-size:28px;opacity:.95}
  .ruido{position:absolute;inset:0;opacity:.06;mix-blend-mode:overlay;
     background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
  .vin{position:absolute;inset:0;box-shadow:inset 0 0 180px #000}`;
  const tel = (cls) => `<div class="tel ${cls}"><div class="borde"></div><div class="cara"></div>
      <div class="meseta">${lentes}</div><div class="brillo"></div></div>`;
  return { css, body: `
  <div class="bg"></div>
  <div class="grid"><div></div></div>
  <div class="parts">${particulas}</div>
  <div class="haz" style="left:-100px;top:470px;width:1100px;transform:rotate(-8deg);opacity:.35"></div>
  <div class="haz" style="left:600px;top:120px;width:900px;transform:rotate(-8deg);opacity:.18"></div>
  <div class="halo2"></div><div class="halo"></div>
  <div class="reflejo"></div>
  <div class="escena">${tel('t2')}${tel('t1')}</div>
  <div class="marca">${iconoSVG({ fondo: '#fff', letra: C.grafito, tam: 40 })}${wordmark('#fff', C.grisOscuro)}</div>
  <div class="txt">
    <div class="chip"><span class="dot"></span>Nueva era · <span style="text-transform:none;letter-spacing:.06em">iPhone 18</span></div>
    <h1>El futuro llega<br><em>primero</em> a Lima.</h1>
    <div class="sub"><span>100% originales</span><span>Garantía iPonce</span><span>Delivery en Lima</span></div>
  </div>
  <div class="ruido"></div><div class="vin"></div>` };
}

// Vista previa: cómo se ve cada pieza recortada por las redes.
function vistaPrevia() {
  const ruta = (p) => pathToFileURL(join(MARCA, p)).href;
  return `<div style="width:1800px;height:1240px;background:#e9e9ee;padding:50px;font-family:InterD;color:${C.grafito}">
    <div style="font-size:40px;font-weight:700;letter-spacing:-.02em">iPonce Store · vista previa en redes</div>
    <div style="margin-top:28px;position:relative;width:1640px;height:624px;border-radius:14px;overflow:hidden">
      <img src="${ruta('portada/facebook-portada-1640x624.png')}" style="width:1640px;height:624px;display:block">
      <div style="position:absolute;top:0;bottom:0;left:265px;width:1110px;border:4px dashed #ffffffcc;border-top:none;border-bottom:none"></div>
      <div style="position:absolute;right:300px;bottom:14px;color:#fff;font-size:18px;opacity:.85">líneas punteadas = lo que se ve en celular</div>
    </div>
    <div style="display:flex;gap:60px;margin-top:50px;align-items:flex-end">
      ${[['perfil/instagram-perfil-1080x1080.png', 'Instagram'], ['perfil/tiktok-perfil-1080x1080.png', 'TikTok'],
         ['perfil/facebook-perfil-2048x2048.png', 'Facebook'], ['perfil/whatsapp-perfil-640x640.png', 'WhatsApp'],
         ['perfil/variantes/perfil-futurista-1080x1080.png', 'Futurista'], ['perfil/variantes/perfil-perla-1080x1080.png', 'Perla']]
        .map(([p, n]) => `<div style="text-align:center;font-size:22px;font-weight:600">
          <img src="${ruta(p)}" style="width:220px;height:220px;border-radius:50%;display:block;box-shadow:0 10px 30px #0003">
          <div style="margin-top:14px">${n}</div></div>`).join('')}
    </div></div>`;
}

// ---------- Ejecutar ----------

browser = await chromium.launch();
try {
  for (const [n, opt] of Object.entries(ICONOS)) {
    const html = pagina(1000, 1000, iconoSVG(opt));
    await render(n, 1000, 1000, html, {
      png: [[`logo/png/${n}-4096.png`, 4.096], [`logo/png/${n}-1024.png`, 1.024]],
      pdf: `logo/vector/${n}.pdf`, svg: `logo/vector/${n}.svg`,
    });
  }
  for (const oscuro of [false, true]) {
    // El nombre dice en qué fondo se usa: la versión blanca es invisible sobre blanco.
    const sfx = oscuro ? 'para-fondo-oscuro' : 'para-fondo-claro';
    const fondo = oscuro ? C.grafito : C.perla;
    await render(`vertical-${sfx}`, 1000, 880, pagina(1000, 880, logoVertical(oscuro)), {
      png: [[`logo/png/logo-vertical-${sfx}-3000.png`, 3]], pdf: `logo/vector/logo-vertical-${sfx}.pdf`, svg: `logo/vector/logo-vertical-${sfx}.svg`,
    });
    await render(`horizontal-${sfx}`, 1200, 320, pagina(1200, 320, logoHorizontal(oscuro)), {
      png: [[`logo/png/logo-horizontal-${sfx}-2400.png`, 2]], pdf: `logo/vector/logo-horizontal-${sfx}.pdf`, svg: `logo/vector/logo-horizontal-${sfx}.svg`,
    });
    // Versiones con el fondo ya puesto, listas para usar en cualquier lado.
    const fondoSfx = oscuro ? 'fondo-grafito' : 'fondo-perla';
    await render(`vertical-${fondoSfx}`, 1000, 880, pagina(1000, 880, logoVertical(oscuro), '', fondo), {
      png: [[`logo/png/con-fondo/logo-vertical-${fondoSfx}-3000.png`, 3]],
    });
    await render(`horizontal-${fondoSfx}`, 1200, 320, pagina(1200, 320, logoHorizontal(oscuro), '', fondo), {
      png: [[`logo/png/con-fondo/logo-horizontal-${fondoSfx}-2400.png`, 2]],
    });
  }

  const clasico = pagina(1080, 1080, perfil('clasico'));
  await render('perfil-clasico', 1080, 1080, clasico, {
    png: [['perfil/instagram-perfil-1080x1080.png', 1], ['perfil/tiktok-perfil-1080x1080.png', 1],
          ['perfil/facebook-perfil-2048x2048.png', 2048 / 1080], ['perfil/whatsapp-perfil-640x640.png', 640 / 1080]],
  });
  await render('perfil-futurista', 1080, 1080, pagina(1080, 1080, perfil('futurista')), {
    png: [['perfil/variantes/perfil-futurista-1080x1080.png', 1]],
  });
  await render('perfil-perla', 1080, 1080, pagina(1080, 1080, perfil('perla')), {
    png: [['perfil/variantes/perfil-perla-1080x1080.png', 1]],
  });

  const p = portada();
  await render('portada', 1640, 624, pagina(1640, 624, p.body, p.css, '#060607'), {
    png: [['portada/facebook-portada-1640x624.png', 1], ['portada/facebook-portada-3280x1248-alta.png', 2]],
  });
  await render('portada-jpg', 1640, 624, pagina(1640, 624, p.body, p.css, '#060607'), {
    png: [['portada/facebook-portada-1640x624.jpg', 1]],
  });

  await render('vista-previa', 1800, 1240, pagina(1800, 1240, vistaPrevia()), { png: [['vista-previa.png', 1]] });
} finally {
  await browser.close();
  rmSync(TMP, { recursive: true, force: true });
}
console.log('Listo: archivos generados en', MARCA);
