"""Expand image/icon macros in src/index.tpl.html → index.html."""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SVC = [  # What We Do: one photo per service, same order as SERVICES in app.js
 ("1600880292203-757bb62b4baf","Two colleagues celebrating with a high-five over a laptop"),
 ("1434030216411-0b793f4b4173","A student writing answers in an exam booklet"),
 ("1607237138185-eedd9c632b0b","A modern university campus building under a clear sky"),
 ("1450101499163-c8848c66ca85","Hands signing an official document"),
 ("1581553673739-c4906b5d0de8","An open passport filled with colourful visa stamps"),
 ("1783114910394-84dc874a373e","An airport terminal at sunset, an aircraft tail beyond the glass"),
 ("1579621970563-ebec7560ff3e","A young plant growing from a pile of coins"),
 ("1528728329032-2972f65dfb3f","Berlin at night, with the TV tower and lit streets along the Spree"),
 ("1467269204594-9661b134dd2b","A colourful old town street with half-timbered houses"),
]
def url(i, w, h=None, q=80):
    u = f"https://images.unsplash.com/photo-{i}?auto=format&fit=crop&w={w}&q={q}"
    return u + (f"&h={h}" if h else "")
def srcset(i, ws): return ", ".join(f"{url(i,w)} {w}w" for w in ws)
def img(i, alt, sizes, attrs=""):
    ws = [480, 800, 1200, 1600, 2200] if "100vw" in sizes else [320, 640, 960, 1400]
    if sizes.endswith("px") and "," not in sizes: ws = [400, 800, 1200]  # small cards: enough pixels for 2–3x screens + hover zoom
    return (f'<img src="{url(i, ws[-2])}" srcset="{srcset(i, ws)}" sizes="{sizes}" alt="{alt}" decoding="async" {attrs}>').replace(" >", ">")
CITIES = [  # university explorer backgrounds, same order as CITIES in app.js
 ("1577462281852-279bf4986f7b","Munich's Marienplatz and town hall lit up at night"),
 ("1561835674-4fe6ec5b0d43","A grand neoclassical university building in Berlin"),
 ("1632660609710-ca2ee0c3425b","Heidelberg's old town, bridge and castle above the river Neckar"),
 ("1666534777208-06fbfe86a112","Aachen's cathedral and town hall towers"),
 ("1651048911431-d466ca7b05a4","Karlsruhe Palace and its gardens"),
 ("1553547274-0df401ae03c9","The Elbphilharmonie concert hall on Hamburg's waterfront"),
 ("1653808761879-2b78cc876bf5","Dresden's baroque skyline across the river Elbe"),
]
DEST = [  # world map destinations — order matches DEST in app.js
 ("1641531339739-1d4f309980e1","The Reichstag in Berlin with the German flag"),
 ("1486299267070-83823f5448dd","Big Ben and the Houses of Parliament in London"),
 ("1499092346589-b9b6be3e94b2","The Manhattan skyline and Brooklyn Bridge"),
 ("1507992781348-310259076fe0","The Toronto skyline with the CN Tower at sunset"),
 ("1506973035872-a4ec16b8e8d9","Sydney Opera House and harbour"),
 ("1595125990323-885cec5217ff","The Auckland skyline across the harbour"),
 ("1549918864-48ac978761a4","A Dublin street lined with Georgian buildings"),
 ("1502602898657-3e91760cbb34","The Eiffel Tower over Paris at dusk"),
 ("1538332576228-eb5b4c4de6f5","Helsinki Cathedral above the harbour"),
 ("1607427293702-036933bbf746","Warsaw's Old Town market square"),
 ("1525625293386-3f8f99389edd","Marina Bay Sands and the Singapore skyline"),
 ("1566914447826-bf04e54bf1be","The Petronas Twin Towers in Kuala Lumpur"),
 ("1512453979798-5ea266f8880c","The Burj Khalifa above the Dubai skyline"),
 ("1513415277900-a62401e19be4","Mauritius coastline and lagoon from above"),
]
UNIV = [  # university discovery — order matches UNIV in app.js
 ("1577462281852-279bf4986f7b","Munich's Marienplatz lit up at night"),
 ("1595867818082-083862f3d630","Munich's old town from above at sunset"),
 ("1632660609710-ca2ee0c3425b","Heidelberg's old town and bridge over the Neckar"),
 ("1666534777208-06fbfe86a112","Aachen's cathedral and town hall towers"),
 ("1651048911431-d466ca7b05a4","Karlsruhe Palace"),
 ("1561835674-4fe6ec5b0d43","A neoclassical university building in Berlin"),
 ("1599946347371-68eb71b16afc","Berlin from above with the Spree and TV tower"),
 ("1553547274-0df401ae03c9","The Elbphilharmonie on Hamburg's waterfront"),
 ("1653808761879-2b78cc876bf5","Dresden's baroque skyline across the Elbe"),
]
def stack(items, cls, sizes):
    return "".join(f'<div class="{cls}{" on" if k==0 else ""}">{img(i, alt, sizes, "" if k==0 else "loading=\"lazy\"")}</div>' for k,(i,alt) in enumerate(items))
W5 = [
 ("1541339907198-e08756dedf3f","Graduates throwing their caps into the air at sunset"),
 ("1521295121783-8a321d551ad2","A desk globe on a table, ready to be spun"),
 ("1607237138185-eedd9c632b0b","A modern university campus building under a clear sky"),
 ("1581553673739-c4906b5d0de8","An open passport filled with colourful visa stamps"),
 ("1528728329032-2972f65dfb3f","Berlin at night, with the TV tower and lit streets"),
]
def exbgs():
    return "".join(f'<div class="ex__bg{" on" if k==0 else ""}">{img(i, alt, "100vw", "" if k==0 else "loading=\"lazy\"")}</div>' for k,(i,alt) in enumerate(CITIES))
ARROW = '<span class="ar" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>'
DIAG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
def svcimgs():
    out = []
    for k, (i, alt) in enumerate(SVC):
        lazy = '' if k == 0 else 'loading="lazy"'
        out.append(f'<div class="svc__img{" on" if k == 0 else ""}" data-i="{k}">{img(i, alt, "(max-width:900px) 100vw, 50vw", lazy)}</div>')
    return "\n          ".join(out)
t = (ROOT / "src/index.tpl.html").read_text()
t = t.replace("{{deonly}}", (ROOT/"src/de-only.svg").read_text()).replace("{{journeydots}}", (ROOT/"src/journey-dots.svg").read_text()).replace("{{dedots}}", (ROOT/"src/de-dots.svg").read_text()).replace("{{exbgs}}", exbgs()).replace("{{worlddots}}", (ROOT/"src/world-dots.svg").read_text()).replace("{{wmimgs}}", stack(DEST,"wm__im","(max-width:900px) 100vw, 45vw")).replace("{{w5imgs}}", stack(W5,"w5__bg","100vw")).replace("{{w5frames}}", stack(W5,"w5__im","(max-width:900px) 100vw, 45vw")).replace("{{udbgs}}", stack(UNIV,"ud__bg","100vw"))
t = t.replace("{{arrow}}", ARROW).replace("{{diag}}", DIAG).replace("{{svcimgs}}", svcimgs())
t = re.sub(r"\{\{url (\S+) (\d+)(?: (\d+))?\}\}", lambda m: url(m[1], m[2], m[3]), t)
t = re.sub(r"\{\{srcset (\S+) ([\d,]+)\}\}", lambda m: srcset(m[1], m[2].split(",")), t)
t = re.sub(r"\{\{img ([^|]+)\|([^|]*)\|([^|]*)\|?([^}]*)\}\}", lambda m: img(m[1], m[2], m[3], m[4]), t)
assert "{{" not in t, re.findall(r"\{\{[^}]*\}\}", t)
t = t.replace("{{deonly}}", (ROOT/"src/de-only.svg").read_text())
(ROOT / "index.html").write_text(t)
print("ok", len(t))

u = (ROOT/"src/universities.tpl.html").read_text().replace("{{deonly}}", (ROOT/"src/de-only.svg").read_text()).replace("{{arrow}}", ARROW)
(ROOT/"universities.html").write_text(u)
