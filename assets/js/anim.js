/* Bollywood Gaillard — animations (désactivées si l'utilisateur préfère réduire les animations) */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- braises d'épices dorées sur le hero ---------- */
  $$("canvas.embers").forEach(function (cv) {
    var ctx = cv.getContext("2d"), host = cv.parentElement, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], running = false, visible = true, raf;
    var COUNT = window.innerWidth < 760 ? 26 : 55;
    function size() { W = host.clientWidth; H = host.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn(p, initial) {
      p.x = Math.random() * W;
      p.y = initial ? Math.random() * H : H + 10;
      p.r = 0.6 + Math.random() * 2.2;
      p.vy = 0.25 + Math.random() * 0.7;
      p.sway = 0.4 + Math.random() * 1.2;
      p.phase = Math.random() * Math.PI * 2;
      p.life = 0; p.max = 380 + Math.random() * 520;
      p.hue = 28 + Math.random() * 22;
      return p;
    }
    for (var i = 0; i < COUNT; i++) parts.push(spawn({}, true));
    function tick() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.life++; p.y -= p.vy; p.phase += 0.012;
        var x = p.x + Math.sin(p.phase) * p.sway * 8;
        var k = p.life / p.max, a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
        if (p.life > p.max || p.y < -10) { spawn(p, false); continue; }
        var g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r * 4);
        g.addColorStop(0, "hsla(" + p.hue + ",95%,70%," + (0.85 * a) + ")");
        g.addColorStop(1, "hsla(" + p.hue + ",95%,55%,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!running && visible && !document.hidden) { running = true; raf = requestAnimationFrame(tick); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    size(); start();
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(host);
  });

  /* ---------- cartes qui s'inclinent en 3D avec reflet doré ---------- */
  if (finePointer) $$("[data-tilt]").forEach(function (card) {
    var rect, raf;
    card.addEventListener("pointerenter", function () { rect = card.getBoundingClientRect(); card.classList.add("tilting"); });
    card.addEventListener("pointermove", function (e) {
      if (!rect) rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        card.style.setProperty("--rx", ((0.5 - y) * 12).toFixed(2) + "deg");
        card.style.setProperty("--ry", ((x - 0.5) * 14).toFixed(2) + "deg");
        card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      });
    });
    card.addEventListener("pointerleave", function () {
      cancelAnimationFrame(raf); rect = null; card.classList.remove("tilting");
      card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
    });
  });

  /* ---------- parallaxe douce ---------- */
  var par = $$("[data-parallax]");
  if (par.length) {
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var off = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0) scale(1.12)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- boutons « magnétiques » ---------- */
  if (finePointer) $$(".btn-magnetic").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
    });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
})();
