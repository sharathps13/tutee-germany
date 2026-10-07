"""Bundle index.html + local assets into one self-contained preview file (remote photos stay as Unsplash URLs)."""
import base64, glob, os, pathlib, sys
R = pathlib.Path(__file__).resolve().parent.parent
d = lambda p, m: 'data:%s;base64,%s' % (m, base64.b64encode((R/p).read_bytes()).decode())
h = (R/'index.html').read_text(); css = (R/'assets/css/style.css').read_text(); js = (R/'assets/js/app.js').read_text()
logo = 'var LOGO={' + ','.join("'%s':'%s'" % (os.path.basename(f)[:-5], d(os.path.relpath(f, R), 'image/webp')) for f in glob.glob(str(R/'assets/img/loan/*.webp'))) + '};'
js = js.replace("""'<img src="assets/img/loan/' + k + '.webp" alt=""", """'<img src="' + LOGO[k] + '" alt=""")
h = h.replace('<link rel="stylesheet" href="assets/css/style.css">', '<style>' + css + '</style>')
for f in ['land','globe4']:
    h = h.replace('<script src="assets/js/%s.js" defer></script>' % f, '<script>' + (R/('assets/js/%s.js' % f)).read_text() + '</script>')
h = h.replace('<script src="assets/js/app.js" defer></script>', '<script>' + logo + js.replace('</script', '<\\/script') + '</script>')
for f in ['icon.png', 'logo.png']: h = h.replace('assets/img/' + f, d('assets/img/' + f, 'image/png'))
h = h.replace('href="universities.html"', 'href="https://tuteeconnect.com/"')
assert 'assets/' not in h
out = sys.argv[1]; pathlib.Path(out).write_text(h); print(out, len(h))
