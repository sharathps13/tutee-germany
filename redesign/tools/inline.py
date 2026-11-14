"""Bundle index.html + local assets into one self-contained preview file (remote photos stay as Unsplash URLs)."""
import base64, glob, os, pathlib, sys
R = pathlib.Path(__file__).resolve().parent.parent
d = lambda p, m: 'data:%s;base64,%s' % (m, base64.b64encode((R/p).read_bytes()).decode())
h = __import__('re').sub(r'\?v=\d+"', '"', (R/'index.html').read_text()); css = (R/'assets/css/style.css').read_text(); js = (R/'assets/js/app.js').read_text()
logo = 'var LOGO={' + ','.join("'%s':'%s'" % (os.path.basename(f)[:-5], d(os.path.relpath(f, R), 'image/webp')) for f in glob.glob(str(R/'assets/img/loan/*.webp'))) + '};'
js = js.replace("""'<img src="assets/img/loan/' + k + '.webp" alt=""", """'<img src="' + LOGO[k] + '" alt=""")
js = js.replace("t.src = 'assets/img/loan/' + k + '.webp';", "if (LOGO[k]) t.src = LOGO[k];")
h = h.replace('<link rel="stylesheet" href="assets/css/style.css">', '<style>' + css + '</style>')
for f in ['land','globe5','unis-de','advisor','form-ui','news-de','news','perf','flock']:
    h = h.replace('<script src="assets/js/%s.js" defer></script>' % f, '<script>' + (R/('assets/js/%s.js' % f)).read_text() + '</script>')
h = h.replace('<script src="assets/js/app.js" defer></script>', '<script>' + logo + js.replace('</script', '<\\/script') + '</script>')
for f in ['favicon-32.png', 'favicon-192.png', 'apple-touch-icon.png', 'icon.png', 'logo.png', 'logo-master.png']: h = h.replace('assets/img/' + f, d('assets/img/' + f, 'image/png'))
import re as _re
h = _re.sub(r'srcset="assets/img/hero/[^"]*"\s*', '', h)
h = _re.sub(r'srcset="assets/img/band/[^"]*"\s*', '', h)
h = h.replace('assets/img/band/berlin-1920.webp', d('assets/img/band/berlin-1920.webp', 'image/webp'))
h = h.replace('assets/img/earth/earth-2k.jpg', d('assets/img/earth/earth-2k.jpg', 'image/jpeg')).replace('assets/img/earth/earth-4k.jpg', d('assets/img/earth/earth-4k.jpg', 'image/jpeg'))
h = _re.sub(r'srcset="assets/img/fly/[^"]*"\s*', '', h)
h = h.replace('assets/img/fly/brandenburg-1600.webp', d('assets/img/fly/brandenburg-1600.webp', 'image/webp'))
h = h.replace('assets/img/fly/eligible-1600.webp', d('assets/img/fly/eligible-1600.webp', 'image/webp'))
h = h.replace('assets/img/fly/funding-2000.webp', d('assets/img/fly/funding-1000.webp', 'image/webp'))
h = h.replace('assets/img/fly/work-1472.webp', d('assets/img/fly/work-736.webp', 'image/webp'))
h = _re.sub(r'srcset="assets/img/logo/tc-logo[^"]*"\s*', '', h)
h = h.replace('assets/img/logo/tc-logo-800.webp', d('assets/img/logo/tc-logo-800.webp', 'image/webp'))
h = h.replace('assets/img/fly/takeoff-1600.webp', d('assets/img/fly/takeoff-1600.webp', 'image/webp'))
h = h.replace('assets/img/hero/cover-1920.webp', d('assets/img/hero/cover-1920.webp', 'image/webp'))
h = h.replace('<link rel="icon" href="/favicon.ico" sizes="any">\n', '')
h = h.replace('href="universities.html"', 'href="https://tuteeconnect.com/"')
assert 'assets/' not in h
out = sys.argv[1]; pathlib.Path(out).write_text(h); print(out, len(h))
