/* perf: pause CSS loops (marquee, pings, pulses, spinners) in sections that are off screen */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); }); }, { rootMargin: '200px 0px' });
  document.querySelectorAll('main > section, main > div, footer').forEach(function (el) { io.observe(el); });
})();
