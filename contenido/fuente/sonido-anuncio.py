# Banda sonora original del anuncio (sin música de terceros): beat a 120 BPM en La menor, efectos en cada corte,
# subida antes del precio, impacto + "cha-ching" al mostrar el precio y cierre.
# Los tiempos coinciden con las tomas de anuncio-precio.mjs.
#
# Uso: python3 contenido/fuente/sonido-anuncio.py <salida.wav>
import sys
import wave
import numpy as np

SR = 44100
T = [0, 2.6, 5.6, 8.1, 10.6, 12.4, 15.4]  # inicio de cada toma
FIN, TOTAL = 18.4, 21.8
PRECIO = T[5]
BEAT = 0.5  # 120 BPM
rng = np.random.default_rng(18)

N = int(TOTAL * SR)
mezcla = np.zeros((N, 2))
envio = np.zeros((N, 2))  # lo que va a la reverb


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def filtro(x, lo=0, hi=SR / 2):
    """Pasa-banda suave por FFT."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi < SR / 2:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def poner(sonido, en, vol=1.0, pan=0.0, rev=0.0):
    i = int(en * SR)
    if i >= N:
        return
    s = sonido[: N - i] * vol
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    if s.ndim == 1:
        s = np.stack([s * l, s * r], 1) * np.sqrt(2)
    mezcla[i : i + len(s)] += s
    envio[i : i + len(s)] += s * rev


# ---------- Instrumentos ----------
def bombo(dur=0.45, f0=150, f1=45, golpe=1.0):
    t = t_(dur)
    fase = 2 * np.pi * (f1 * t + (f0 - f1) * 0.04 * (1 - np.exp(-t / 0.04)))
    s = np.sin(fase) * np.exp(-t / 0.16)
    s[: int(0.004 * SR)] += golpe * 0.6 * rng.standard_normal(int(0.004 * SR))
    return np.tanh(1.6 * s)


def palmas():
    t = t_(0.25)
    ruido = filtro(rng.standard_normal(len(t)), 900, 5000)
    env = np.zeros_like(t)
    for d in (0, 0.011, 0.022):  # tres palmadas muy juntas
        env += (t >= d) * np.exp(-np.maximum(t - d, 0) / (0.012 if d < 0.02 else 0.07))
    return ruido * env / 3


def hihat(dur=0.05):
    t = t_(dur)
    return filtro(rng.standard_normal(len(t)), 7000) * np.exp(-t / (dur / 3))


def sub(f, dur):
    t = t_(dur)
    env = np.minimum(t / 0.01, 1) * np.exp(-t / 0.6) * np.minimum((dur - t) / 0.03, 1)
    return np.tanh(1.4 * np.sin(2 * np.pi * f * t)) * env


def pad(fs, dur):
    t = t_(dur)
    env = np.minimum(t / 0.25, 1) * np.minimum((dur - t) / 0.3, 1)
    s = np.zeros((len(t), 2))
    for k, f in enumerate(fs):
        for det, lado in ((-0.006, 0), (0.006, 1)):  # dos voces desafinadas, una por lado
            ff = f * (1 + det)
            onda = sum(np.sin(2 * np.pi * ff * h * t) / h**1.6 for h in (1, 2, 3, 4))
            s[:, lado] += onda
    return s * env[:, None] / (len(fs) * 2)


def pluck(f, dur=0.32):
    t = t_(dur)
    s = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (9 + 5 * h)) / h for h in (1, 2, 3))
    return s * np.minimum(t / 0.003, 1)


def whoosh(dur=0.55):
    t = t_(dur)
    env = np.sin(np.pi * t / dur) ** 2
    s = filtro(rng.standard_normal(len(t)), 300, 4500) * env
    pan = np.linspace(-0.8, 0.8, len(t))
    return np.stack([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)], 1)


def subida(dur):
    t = t_(dur)
    ruido = filtro(rng.standard_normal(len(t)), 1500) * (t / dur) ** 2.2
    f = 180 * (1300 / 180) ** (t / dur)
    tono = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / dur) ** 1.8 * 0.35
    return ruido * 0.6 + tono


def impacto():
    t = t_(1.6)
    boom = np.sin(2 * np.pi * (32 * t + 50 * 0.08 * (1 - np.exp(-t / 0.08)))) * np.exp(-t / 0.45)
    golpe = filtro(rng.standard_normal(len(t)), 100, 3000) * np.exp(-t / 0.06)
    return np.tanh(1.8 * boom) * 0.9 + golpe * 0.5


def campana(f, dur=1.2):
    t = t_(dur)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (0.5 / r)) for r, a in ((1, 1), (2.76, 0.4), (5.4, 0.18)))
    return s * np.minimum(t / 0.002, 1)


def pop():
    t = t_(0.07)
    f = 520 + 600 * t / 0.07
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.02)


# ---------- Arreglo ----------
ACORDES = [  # La menor: Am – F – C – G, un compás (2 s) cada uno
    (55.00, (220.00, 261.63, 329.63)),
    (43.65, (174.61, 220.00, 261.63)),
    (65.41, (261.63, 329.63, 392.00)),
    (49.00, (196.00, 246.94, 293.66)),
]
SILENCIO = (PRECIO - 0.5, PRECIO)  # el beat se corta justo antes del precio


def suena(t):
    return not (SILENCIO[0] <= t < SILENCIO[1]) and t < FIN


compas = 0
t0 = 0.0
while t0 < TOTAL:
    raiz, triada = ACORDES[compas % 4]
    final = t0 >= FIN
    poner(pad(triada, 2.0), t0, 0.16 if not final else 0.2, rev=0.25)
    for b in range(4):
        tb = t0 + b * BEAT
        if not suena(tb) and not final:
            continue
        if final:
            if b == 0 and tb < TOTAL - 1:
                poner(bombo(), tb, 0.55)
            continue
        poner(bombo(), tb, 0.85)
        poner(sub(raiz, BEAT * 0.95), tb, 0.38)
        if b in (1, 3):
            poner(palmas(), tb, 0.5, rev=0.35)
        # charles en corcheas, en semicorcheas después del precio para subir la energía
        pasos = 4 if tb >= PRECIO else 2
        for k in range(pasos):
            th = tb + k * BEAT / pasos
            if suena(th):
                poner(hihat(), th, 0.16 if k % 2 else 0.24, pan=0.3 if k % 2 else -0.3)
        # arpegio
        for k, nota in enumerate((triada[0] * 2, triada[2] * 2)):
            ta = tb + k * BEAT / 2
            if suena(ta):
                poner(pluck(nota), ta, 0.13, pan=-0.4 if k else 0.4, rev=0.4)
    compas += 1
    t0 += 2.0

# Efectos
for c in T[1:] + [FIN]:
    poner(whoosh(), c - 0.3, 0.32)
poner(impacto(), 0.0, 0.55, rev=0.3)
poner(subida(1.0), PRECIO - 1.0, 0.45, rev=0.3)
poner(impacto(), PRECIO, 0.85, rev=0.4)
poner(campana(1318.5), PRECIO + 0.12, 0.22, pan=-0.2, rev=0.5)  # cha-
poner(campana(1760.0), PRECIO + 0.24, 0.26, pan=0.2, rev=0.5)  # -ching
for k in range(3):
    poner(pop(), T[4] + 0.1 + k * 0.35, 0.22, rev=0.2)
for d in (0.1, 0.5):
    poner(pop(), T[6] + d, 0.22, rev=0.2)
poner(impacto(), FIN, 0.55, rev=0.4)
poner(campana(1318.5), FIN + 0.6, 0.2, rev=0.6)
poner(campana(1760.0), FIN + 0.72, 0.24, rev=0.6)

# Reverb: ruido con caída exponencial, convolución por FFT
ir_t = t_(1.8)
ir = filtro(rng.standard_normal(len(ir_t)), 200, 6000) * np.exp(-ir_t / 0.35)
ir /= np.sqrt((ir**2).sum())
L = 1 << int(np.ceil(np.log2(N + len(ir))))
for ch in (0, 1):
    mezcla[:, ch] += np.fft.irfft(np.fft.rfft(envio[:, ch], L) * np.fft.rfft(ir, L), L)[:N] * 0.6

# Fundido final y límite suave
fade = np.minimum((TOTAL - np.arange(N) / SR) / 1.2, 1)
mezcla *= fade[:, None]
mezcla = np.tanh(mezcla / np.abs(mezcla).max() * 1.3) * 0.89

with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mezcla * 32767).astype('<i2').tobytes())
print('Sonido listo:', sys.argv[1])
