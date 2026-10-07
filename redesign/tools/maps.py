"""Generate the dotted SVG maps (run once; output is committed in src/). Needs: pip install global-land-mask numpy"""
import numpy as np, pathlib
from global_land_mask import globe
OUT = pathlib.Path(__file__).resolve().parent.parent / "src"
def dots(lon0, lon1, lat0, lat1, step, k, r, cls):
    out = []
    for lat in np.arange(lat1, lat0, -step):
        for lon in np.arange(lon0, lon1, step):
            if globe.is_land(lat, lon):
                out.append(f'<circle cx="{(lon-lon0)*k:.1f}" cy="{(lat1-lat)*k:.1f}" r="{r}"/>')
    return f'<g class="{cls}">' + "".join(out) + "</g>", (lon1-lon0)*k, (lat1-lat0)*k
g, w, h = dots(-4, 94, 2, 62, 1.6, 10, 2.6, "dots")
(OUT/"journey-dots.svg").write_text(g); print("journey", w, h, g.count("<circle"))
g, w, h = dots(3.5, 17.5, 46.5, 55.6, .3, 30, 2.6, "dots")
(OUT/"de-dots.svg").write_text(g); print("de", w, h, g.count("<circle"))
g, w, h = dots(-170, 180, -48, 76, 2.7, 4, 3.1, "dots")
(OUT/"world-dots.svg").write_text(g); print("world", w, h, g.count("<circle"))
