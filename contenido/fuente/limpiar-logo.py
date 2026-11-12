# Quita el logo de Apple del dorso en los cuadros de video de docs/img: rellena la zona con el color del contorno
# y la funde con un borde suave. Uso: python3 contenido/fuente/limpiar-logo.py <carpeta-salida>
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageStat

RAIZ = Path(__file__).resolve().parents[2]
LOGOS = {'portada': (546, 680), 'borgona': (458, 680), 'glaciar': (397, 723)}  # centro del logo en la foto de 864x1080
RX, RY = 62, 72

salida = Path(sys.argv[1])
salida.mkdir(parents=True, exist_ok=True)
for nombre, (x, y) in LOGOS.items():
    im = Image.open(RAIZ / 'docs' / 'img' / f'{nombre}.jpg').convert('RGB')
    anillo = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(anillo)
    d.ellipse((x - RX - 30, y - RY - 30, x + RX + 30, y + RY + 30), fill=255)
    d.ellipse((x - RX - 8, y - RY - 8, x + RX + 8, y + RY + 8), fill=0)
    color = tuple(int(c) for c in ImageStat.Stat(im, anillo).median)
    relleno = im.copy()
    ImageDraw.Draw(relleno).ellipse((x - RX - 6, y - RY - 6, x + RX + 6, y + RY + 6), fill=color)
    relleno = relleno.filter(ImageFilter.GaussianBlur(18))
    mascara = Image.new('L', im.size, 0)
    ImageDraw.Draw(mascara).ellipse((x - RX - 4, y - RY - 4, x + RX + 4, y + RY + 4), fill=255)
    Image.composite(relleno, im, mascara.filter(ImageFilter.GaussianBlur(10))).save(salida / f'{nombre}.png')
print('Fotos limpias en', salida)
