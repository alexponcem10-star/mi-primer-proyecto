# Música original con "drop" para anuncios (sin letra, sin música de terceros): electro a 128 BPM en Fa menor.
# Antes del precio: bombo 4x4, bajo que bombea (sidechain), palmas, charles y acordes; luego redoble que acelera,
# subida y un instante de silencio. En el precio: drop con golpe grave, acorde "braam" y el beat completo.
# Al final (cierre): queda un colchón filtrado y un último golpe. Efectos de barrido en los cortes y "pops" en los textos.
#
# Uso: python3 contenido/fuente/musica-drop.py <salida.wav> <tiempos.json>
#   tiempos.json: {"fin": s, "total": s, "precio": s, "whoosh": [s...], "pops": [s...]}
import json
import sys
import wave
import numpy as np

SR = 44100
CFG = json.load(open(sys.argv[2]))
FIN, TOTAL, PRECIO = CFG['fin'], CFG['total'], CFG['precio']
BPM = 128
BEAT = 60 / BPM
rng = np.random.default_rng(7)
N = int(TOTAL * SR)
batería = np.zeros((N, 2))
música = np.zeros((N, 2))  # lo que se filtra y bombea con el bombo
efectos = np.zeros((N, 2))
envio = np.zeros((N, 2))


def t_(d):
    return np.arange(int(d * SR)) / SR


def filtro(x, lo=0, hi=SR / 2):
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(x.shape[0], 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi < SR / 2:
        m *= 1 / (1 + (f / hi) ** 4)
    if x.ndim == 2:
        m = m[:, None]
    return np.fft.irfft(X * m, x.shape[0], axis=0)


def poner(bus, s, en, vol=1.0, pan=0.0, rev=0.0):
    i = int(en * SR)
    if i >= N or i + len(s) <= 0:
        return
    if i < 0:
        s, i = s[-i:], 0
    s = s[: N - i] * vol
    if s.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        s = np.stack([s * l, s * r], 1) * np.sqrt(2)
    bus[i : i + len(s)] += s
    envio[i : i + len(s)] += s * rev


def sierra(f, t, armonicos=14):
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, armonicos + 1) if f * k < 12000)


# ---------- Sonidos ----------
def bombo(golpe=1.0):
    t = t_(0.42)
    fase = 2 * np.pi * (48 * t + 120 * 0.035 * (1 - np.exp(-t / 0.035)))
    s = np.sin(fase) * np.exp(-t / 0.15)
    s[:180] += golpe * 0.5 * rng.standard_normal(180) * np.linspace(1, 0, 180)
    return np.tanh(1.8 * s)


def palmas():
    t = t_(0.3)
    env = sum((t >= d) * np.exp(-np.maximum(t - d, 0) / (0.01 if d < 0.02 else 0.09)) for d in (0, 0.01, 0.021))
    return filtro(rng.standard_normal(len(t)), 1000, 6000) * env / 3


def redoble():
    t = t_(0.12)
    return filtro(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.035) + 0.4 * np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.03)


def charles(abierto=False):
    d = 0.22 if abierto else 0.045
    t = t_(d)
    return filtro(rng.standard_normal(len(t)), 7500) * np.exp(-t / (d / 3))


def bajo(f, d):
    t = t_(d)
    s = sierra(f, t, 8) * 0.5 + np.sin(2 * np.pi * f * t)
    env = np.minimum(t / 0.004, 1) * np.minimum((d - t) / 0.02, 1)
    return np.tanh(1.5 * filtro(s * env, 0, 900))


def acorde(fs, d, brillo=2500):
    t = t_(d)
    s = np.zeros((len(t), 2))
    for f in fs:
        for det, lado in ((-0.008, 0), (0.008, 1)):
            s[:, lado] += sierra(f * (1 + det), t, 10)
    env = np.minimum(t / 0.01, 1) * np.exp(-t / (d * 0.6))
    return filtro(s * env[:, None], 120, brillo) / (len(fs) * 3)


def braam(fs, d=1.6):
    t = t_(d)
    s = np.zeros((len(t), 2))
    for f in fs:
        for det, lado in ((-0.012, 0), (0.012, 1)):
            s[:, lado] += sierra(f * (1 + det), t, 18)
    env = np.minimum(t / 0.02, 1) * np.exp(-t / 0.7)
    return np.tanh(filtro(s * env[:, None], 40, 1800) / len(fs) * 1.2)


def boom():
    t = t_(1.8)
    s = np.sin(2 * np.pi * (30 * t + 70 * 0.09 * (1 - np.exp(-t / 0.09)))) * np.exp(-t / 0.6)
    return np.tanh(2.2 * s) + filtro(rng.standard_normal(len(t)), 80, 2500) * np.exp(-t / 0.05) * 0.6


def subida(d):
    t = t_(d)
    ruido = filtro(rng.standard_normal(len(t)), 2000) * (t / d) ** 2.5
    f = 220 * (1600 / 220) ** (t / d)
    tono = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * 0.3
    return ruido * 0.7 + tono


def whoosh(d=0.45):
    t = t_(d)
    s = filtro(rng.standard_normal(len(t)), 400, 5000) * np.sin(np.pi * t / d) ** 3
    pan = np.linspace(-0.9, 0.9, len(t))
    return np.stack([s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)], 1)


def pop():
    t = t_(0.08)
    return np.sin(2 * np.pi * np.cumsum(500 + 900 * t / 0.08) / SR) * np.exp(-t / 0.022)


def brillo_sonido(f):
    t = t_(1.4)
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (0.6 / r)) for r, a in ((1, 1), (2.76, 0.35), (5.4, 0.15)))


# ---------- Arreglo ----------
ACORDES = [  # Fa menor: Fm – Db – Ab – Eb, un compás cada uno
    (43.65, (349.23, 415.30, 523.25)),
    (34.65, (277.18, 349.23, 415.30)),
    (51.91, (415.30, 523.25, 622.25)),
    (38.89, (311.13, 392.00, 466.16)),
]
SUBIDA = 1.6  # el redoble y la subida empiezan esto antes del precio
SILENCIO = 0.22  # instante de silencio justo antes del drop
COMPAS = 4 * BEAT
paso = 0
while paso * BEAT < TOTAL:
    t = paso * BEAT
    b = paso % 4
    raiz, triada = ACORDES[(paso // 4) % 4]
    drop = PRECIO <= t < FIN
    if t < FIN and not (PRECIO - SILENCIO <= t < PRECIO):
        en_subida = PRECIO - SUBIDA <= t < PRECIO
        if not en_subida or b in (0, 2):
            poner(batería, bombo(), t, 0.95 if drop else 0.85)
        if b in (1, 3) and not en_subida:
            poner(batería, palmas(), t, 0.55 if drop else 0.45, rev=0.3)
        for k in range(2):
            poner(batería, charles(abierto=k == 1), t + k * BEAT / 2, 0.22 if k else 0.14, pan=0.25 if k else -0.25)
        if drop:  # charles en semicorcheas en el drop
            for k in (1, 3):
                poner(batería, charles(), t + k * BEAT / 4, 0.1, pan=0.4)
        poner(música, bajo(raiz * 2, BEAT / 2 * 0.9), t + BEAT / 2, 0.42 if drop else 0.34)  # bajo a contratiempo
        if b == 0:
            poner(música, acorde(triada, COMPAS * 0.9, 4200 if drop else 2200), t, 0.5 if drop else 0.36, rev=0.35)
        if drop and b in (1, 3):
            poner(música, acorde([f * 2 for f in triada], BEAT * 0.4, 6000), t + BEAT / 4, 0.16, pan=0.3 if b == 1 else -0.3, rev=0.4)
    elif t >= FIN and b == 0:  # cierre: solo colchón filtrado
        poner(música, acorde(triada, COMPAS, 1200), t, 0.42, rev=0.6)
    paso += 1

# Redoble que acelera hasta el drop
golpes = []
ti, gap = PRECIO - SUBIDA, BEAT / 2
while ti < PRECIO - SILENCIO:
    golpes.append(ti)
    ti += gap
    gap = max(BEAT / 8, gap * 0.82)
for k, g in enumerate(golpes):
    poner(batería, redoble(), g, 0.18 + 0.4 * k / max(len(golpes) - 1, 1), pan=0.2 * (-1) ** k, rev=0.2)
poner(efectos, subida(SUBIDA - SILENCIO + 0.1), PRECIO - SUBIDA, 0.5, rev=0.3)

# Drop
poner(efectos, boom(), PRECIO, 0.9, rev=0.3)
poner(música, braam([87.31, 130.81, 174.61]), PRECIO, 0.5, rev=0.3)
poner(efectos, brillo_sonido(1396.9), PRECIO + 0.1, 0.16, pan=-0.3, rev=0.6)
poner(efectos, brillo_sonido(2093.0), PRECIO + 0.22, 0.14, pan=0.3, rev=0.6)

# Inicio con golpe, cortes, textos y cierre
poner(efectos, boom(), 0, 0.55, rev=0.3)
for c in CFG.get('whoosh', []):
    poner(efectos, whoosh(), c - 0.25, 0.36)
for p in CFG.get('pops', []):
    poner(efectos, pop(), p, 0.2, rev=0.2)
poner(efectos, boom(), FIN, 0.6, rev=0.5)
poner(efectos, brillo_sonido(1396.9), FIN + 0.6, 0.14, rev=0.7)
poner(efectos, brillo_sonido(2093.0), FIN + 0.75, 0.12, rev=0.7)

# Sidechain: la música baja con cada bombo (efecto "bombeo")
env = np.ones(N)
paso = 0
while paso * BEAT < FIN:
    i = int(paso * BEAT * SR)
    if not (PRECIO - SUBIDA <= paso * BEAT < PRECIO):
        L = int(0.32 * SR)
        tt = np.arange(min(L, N - i)) / SR
        env[i : i + len(tt)] = np.minimum(env[i : i + len(tt)], 0.25 + 0.75 * (1 - np.exp(-tt / 0.08)))
    paso += 1
música *= env[:, None]

# Durante la subida la música se va apagando (filtro que se cierra) y vuelve entera en el drop
apagada = filtro(música, 0, 700)
abre = 1 - 0.85 * np.clip((np.arange(N) / SR - (PRECIO - SUBIDA)) / SUBIDA, 0, 1) ** 1.5
abre[np.arange(N) / SR >= PRECIO] = 1
abre[np.arange(N) / SR < PRECIO - SUBIDA] = 1
música = apagada * (1 - abre[:, None]) + música * abre[:, None]

mezcla = batería + música + efectos
ir_t = t_(2.0)
ir = filtro(rng.standard_normal(len(ir_t)), 200, 7000) * np.exp(-ir_t / 0.4)
ir /= np.sqrt((ir ** 2).sum())
L = 1 << int(np.ceil(np.log2(N + len(ir))))
for ch in (0, 1):
    mezcla[:, ch] += np.fft.irfft(np.fft.rfft(envio[:, ch], L) * np.fft.rfft(ir, L), L)[:N] * 0.55

mezcla *= np.minimum((TOTAL - np.arange(N) / SR) / 1.0, 1)[:, None]
mezcla = np.tanh(mezcla / np.abs(mezcla).max() * 1.6) * 0.9
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mezcla * 32767).astype('<i2').tobytes())
print('Música lista:', sys.argv[1])
