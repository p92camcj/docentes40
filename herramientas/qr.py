"""Pone en un recurso el QR que lleva a su página del site (no a GitHub).

Uso:  python3 herramientas/qr.py recursos/binario-ascii/index.html https://sites.google.com/...
Necesita segno (pip install segno). El QR va como SVG dentro del HTML,
entre <!--QR-INICIO--> y <!--QR-FIN-->, así que funciona sin internet.
"""
import html
import io
import re
import sys

import segno

ruta, url = sys.argv[1], sys.argv[2]
qr = segno.make(url, error='m')
buf = io.BytesIO()
qr.save(buf, kind='svg', scale=1, border=2, dark='#000', light='#fff', xmldecl=False, svgns=True, nl=False)
svg = buf.getvalue().decode('utf-8')
svg = re.sub(r'<svg ', '<svg class="qr-svg" role="img" aria-label="Código QR de la página" ', svg, count=1)
svg = re.sub(r' width="\d+" height="\d+"', '', svg, count=1)
w = qr.symbol_size(scale=1, border=2)[0]
if 'viewBox' not in svg:
    svg = svg.replace('<svg ', '<svg viewBox="0 0 %d %d" ' % (w, w), 1)
bloque = '<!--QR-INICIO-->%s<div class="qr-url">%s</div><!--QR-FIN-->' % (svg, html.escape(url))
s = open(ruta, encoding='utf-8').read()
s2, n = re.subn(r'<!--QR-INICIO-->.*?<!--QR-FIN-->', lambda m: bloque, s, flags=re.S)
assert n == 1, 'No encuentro las marcas del QR'
open(ruta, 'w', encoding='utf-8').write(s2)
print('QR puesto:', url)
