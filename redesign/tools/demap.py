"""Germany-only dotted map + outline for the University Explorer (same projection as de-dots: x=(lon-3.5)*30, y=(55.6-lat)*30)."""
import pathlib, numpy as np, geopandas as gp
from shapely.geometry import Point
R = pathlib.Path(__file__).resolve().parent.parent
w = gp.read_file(gp.datasets.get_path('naturalearth_lowres')); de = w[w.name == 'Germany'].geometry.iloc[0]
P = lambda lon, lat: ((lon-3.5)*30, (55.6-lat)*30)
out = []
for lat in np.arange(55.1, 47.2, -.2):
    for lon in np.arange(5.8, 15.2, .2 / np.cos(np.radians(51))*.62):
        if de.contains(Point(lon, lat)):
            x, y = P(lon, lat); out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.7"/>')
polys = [de] if de.geom_type == 'Polygon' else list(de.geoms)
path = "".join("M" + "L".join(f"{P(*c)[0]:.1f},{P(*c)[1]:.1f}" for c in p.exterior.coords) + "Z" for p in polys)
(R/'src/de-only.svg').write_text(f'<path class="deo" d="{path}"/><g class="dots">{"".join(out)}</g>'); print(len(out))
