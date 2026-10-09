"""Build ONE self-contained preview file holding both pages (landing + University Explorer) with hash routing:
   #/                     → landing page
   #/universities?u=tum   → University Explorer
Usage: python3 tools/app.py OUT.html"""
import pathlib, base64, json, subprocess, sys, tempfile
R = pathlib.Path(__file__).resolve().parent.parent
tmp = tempfile.mktemp(suffix='.html'); subprocess.run([sys.executable, str(R/'tools/inline.py'), tmp], check=True, capture_output=True)
land = pathlib.Path(tmp).read_text()
h = (R/'universities.html').read_text().replace('<link rel="stylesheet" href="assets/css/explorer.css">', '<style>' + (R/'assets/css/explorer.css').read_text() + '</style>')
for f in ['unis-de.js', 'explorer.js']:
    h = h.replace(f'<script src="assets/js/{f}" defer></script>', '<script>' + (R/'assets/js'/f).read_text().replace('</script', '<\\/script') + '</script>')
h = h.replace('assets/img/logo-master.png', 'data:image/png;base64,' + base64.b64encode((R/'assets/img/logo-master.png').read_bytes()).decode())
h = h.replace('assets/img/icon.png', 'data:image/png;base64,' + base64.b64encode((R/'assets/img/icon.png').read_bytes()).decode())
SHELL = r'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tutee Connect — Study in Germany</title>
<style>html,body{margin:0;height:100%;background:#071a1a;overflow:hidden}iframe{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}</style></head><body>
<iframe id="v" title="Tutee Connect"></iframe>
<script>
var PAGES={home:__HOME__,universities:__UNI__};
var v=document.getElementById('v'),cur=null,quiet=false;
function parse(url){var m=String(url).match(/^(index\.html|universities\.html)?(\?[^#]*)?(#.*)?$/);if(!m)return null;return{p:m[1]==='universities.html'?'universities':(m[1]==='index.html'?'home':null),q:m[2]||'',h:m[3]||''};}
function hashFor(r){var p=r.p||cur||'home';return '#/'+(p==='home'?'':'universities')+r.q+(r.h?'|'+r.h.slice(1):'');}
function render(p,q,h){
  var boot='<script>window.__Q='+JSON.stringify(q)+';window.__H='+JSON.stringify(h)+';<\/script>';
  v.onload=function(){var d=v.contentDocument;cur=p;
    d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var r=parse(a.getAttribute('href'));if(!r||!r.p)return;e.preventDefault();window.__nav(a.getAttribute('href'));},true);
    if(h&&h.length>1)setTimeout(function(){var t=d.getElementById(h.slice(1));if(t)t.scrollIntoView();},300);
    try{document.title=d.title;}catch(e){}
  };
  v.srcdoc=PAGES[p].replace(/<head>/i,'<head>'+boot);
}
window.__nav=function(url){var r=parse(url);if(r)location.hash=hashFor(r);};
/* keep the address in step with in-page selection so a refresh restores it (no re-render) */
window.__sync=function(url){var r=parse(url);if(!r)return;var n=hashFor(r);if(location.hash!==n)history.replaceState(null,'',n);};
function route(){var x=location.hash.replace(/^#\/?/,''),hash='';var i=x.indexOf('|');if(i>=0){hash='#'+x.slice(i+1);x=x.slice(0,i);}
  var p=/^universities/.test(x)?'universities':'home';render(p,x.replace(/^universities/,''),hash);}
addEventListener('hashchange',route);route();
</script></body></html>'''
enc = lambda s: json.dumps(s).replace('</', '<\\/')
pathlib.Path(sys.argv[1]).write_text(SHELL.replace('__HOME__', enc(land)).replace('__UNI__', enc(h)))
print(sys.argv[1])
