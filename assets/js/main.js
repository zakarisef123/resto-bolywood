/* Bollywood Gaillard — interactions communes */
(function () {
  "use strict";
  var C = window.BW_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  /* ---------- en-tête ---------- */
  var header = $(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) { document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); burger.focus(); }
    });
  }

  /* ---------- horaires & statut ---------- */
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(t) { return t.replace(":", "h"); }
  function status(now) {
    now = now || new Date();
    var d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    var slots = C.hours[d] || [];
    for (var i = 0; i < slots.length; i++) {
      var o = toMin(slots[i][0]), c = toMin(slots[i][1]);
      if (m >= o && m < c) return { open: true, text: c - m <= 30 ? "Ouvert · ferme bientôt (" + fmt(slots[i][1]) + ")" : "Ouvert maintenant · jusqu'à " + fmt(slots[i][1]) };
      if (m < o) return { open: false, soon: o - m <= 60, text: "Fermé · ouvre à " + fmt(slots[i][0]) };
    }
    for (var k = 1; k <= 7; k++) {
      var nd = (d + k) % 7;
      if ((C.hours[nd] || []).length) return { open: false, text: "Fermé · ouvre " + (k === 1 ? "demain" : DAYS[nd].toLowerCase()) + " à " + fmt(C.hours[nd][0][0]) };
    }
    return { open: false, text: "Fermé" };
  }
  $$("[data-status]").forEach(function (el) {
    var s = status();
    el.classList.toggle("open", s.open);
    el.classList.toggle("soon", !!s.soon);
    var t = $(".status-text", el); if (t) t.textContent = s.text;
  });
  var today = new Date().getDay();
  $$(".hours li[data-day='" + today + "']").forEach(function (li) { li.classList.add("today"); });

  /* ---------- apparitions ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("in"); });

  /* ---------- toast ---------- */
  var toastEl;
  window.BW_toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  };

  /* ---------- lightbox ---------- */
  var lb, lbImg, lbCap, lbList = [], lbIdx = 0, lbReturn;
  function ensureLb() {
    if (lb) return;
    lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo agrandie");
    lb.innerHTML = '<img alt=""><p></p>' +
      '<button class="lb-btn lb-close" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Photo précédente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button class="lb-btn lb-next" aria-label="Photo suivante"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>';
    document.body.appendChild(lb);
    lbImg = $("img", lb); lbCap = $("p", lb);
    $(".lb-close", lb).onclick = closeLb;
    $(".lb-prev", lb).onclick = function () { showLb(lbIdx - 1); };
    $(".lb-next", lb).onclick = function () { showLb(lbIdx + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(lbIdx - 1);
      if (e.key === "ArrowRight") showLb(lbIdx + 1);
    });
  }
  function showLb(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx].src; lbImg.alt = lbList[lbIdx].cap || ""; lbCap.textContent = lbList[lbIdx].cap || "";
    var multi = lbList.length > 1;
    $(".lb-prev", lb).style.display = multi ? "" : "none"; $(".lb-next", lb).style.display = multi ? "" : "none";
  }
  function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; if (lbReturn) lbReturn.focus(); }
  window.BW_lightbox = function (list, i, from) {
    ensureLb(); lbList = list; lbReturn = from; showLb(i || 0);
    lb.classList.add("open"); document.body.style.overflow = "hidden"; $(".lb-close", lb).focus();
  };
  var gal = $$(".gallery [data-full]");
  if (gal.length) {
    var list = gal.map(function (b) { return { src: b.getAttribute("data-full"), cap: b.getAttribute("data-cap") }; });
    gal.forEach(function (b, i) { b.addEventListener("click", function () { window.BW_lightbox(list, i, b); }); });
  }

  /* ---------- créneaux horaires ---------- */
  window.BW_slots = function (dateStr, minLeadMin) {
    if (!dateStr) return [];
    var p = dateStr.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    var slots = C.hours[d.getDay()] || [], out = [];
    var now = new Date(), isToday = d.toDateString() === now.toDateString();
    var nowMin = now.getHours() * 60 + now.getMinutes() + (minLeadMin || 0);
    slots.forEach(function (s) {
      for (var m = toMin(s[0]); m <= toMin(s[1]) - 30; m += 15) {
        if (isToday && m < nowMin) continue;
        out.push(("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2));
      }
    });
    return out;
  };
  window.BW_isoDate = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  window.BW_frDate = function (s) {
    var p = s.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  };

  /* ---------- envoi des formulaires ----------
     Si C.formEndpoint est renseigné (Formspree, Web3Forms, etc.), les demandes y sont envoyées.
     Sinon, on ouvre l'application e-mail du visiteur avec un message pré-rempli. */
  window.BW_send = function (subject, fields, done) {
    var lines = Object.keys(fields).filter(function (k) { return fields[k]; }).map(function (k) { return k + " : " + fields[k]; });
    if (C.formEndpoint) {
      var body = {}; Object.keys(fields).forEach(function (k) { body[k] = fields[k]; });
      body._subject = subject;
      fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { if (!r.ok) throw 0; done(true); })
        .catch(function () { mail(); done(false); });
    } else { mail(); done(false); }
    function mail() {
      window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n") + "\n\n— Envoyé depuis le site bollywoodgaillard.com");
    }
  };

  /* ---------- réservation ---------- */
  var rf = $("#booking-form");
  if (rf) {
    var date = $("#b-date", rf), time = $("#b-time", rf);
    var t0 = new Date(); date.min = window.BW_isoDate(t0);
    var max = new Date(); max.setDate(max.getDate() + 90); date.max = window.BW_isoDate(max);
    // première date ouverte
    var first = new Date();
    for (var i = 0; i < 8; i++) { if (window.BW_slots(window.BW_isoDate(first), 60).length) break; first.setDate(first.getDate() + 1); }
    date.value = window.BW_isoDate(first);
    function fillTimes() {
      var s = window.BW_slots(date.value, 60);
      var hint = $("#b-date-hint");
      if (!s.length) {
        var p = date.value.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
        time.innerHTML = '<option value="">—</option>'; time.disabled = true;
        hint.textContent = (C.hours[d.getDay()] || []).length ? "Plus de créneau disponible ce jour-là, choisissez une autre date." : "Nous sommes fermés le " + DAYS[d.getDay()].toLowerCase() + ".";
        hint.style.color = "var(--chili)";
        return;
      }
      hint.textContent = "Service de 11h30 à 14h30 et de 18h30 à 22h30."; hint.style.color = "";
      time.disabled = false;
      var prev = time.value;
      var html = "", g = "";
      s.forEach(function (t) {
        var grp = +t.slice(0, 2) < 16 ? "Déjeuner" : "Dîner";
        if (grp !== g) { if (g) html += "</optgroup>"; html += '<optgroup label="' + grp + '">'; g = grp; }
        html += '<option value="' + t + '">' + t.replace(":", "h") + "</option>";
      });
      time.innerHTML = html + "</optgroup>";
      if (s.indexOf(prev) > -1) time.value = prev; else if (s.indexOf("19:30") > -1) time.value = "19:30"; else if (s.indexOf("12:30") > -1) time.value = "12:30";
    }
    date.addEventListener("change", fillTimes); fillTimes();
    rf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!rf.reportValidity()) return;
      var fd = new FormData(rf);
      var f = {
        "Nom": fd.get("name"), "Téléphone": fd.get("phone"), "E-mail": fd.get("email"),
        "Date": window.BW_frDate(fd.get("date")), "Heure": (fd.get("time") || "").replace(":", "h"),
        "Personnes": fd.get("guests"), "Occasion": fd.get("occasion"), "Message": fd.get("message")
      };
      window.BW_send("Demande de réservation — " + f["Date"] + " " + f["Heure"] + " — " + f["Personnes"] + " pers.", f, function (sent) {
        var ok = $("#booking-success");
        $(".ok-summary", ok).textContent = f["Personnes"] + " personne(s), " + f["Date"] + " à " + f["Heure"] + ".";
        $(".ok-mode", ok).textContent = sent ? "Votre demande nous a bien été transmise." : "Votre messagerie s'est ouverte avec votre demande pré-remplie : il ne reste plus qu'à l'envoyer.";
        ok.classList.add("show"); ok.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  /* ---------- contact ---------- */
  var cf = $("#contact-form");
  if (cf) cf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!cf.reportValidity()) return;
    var fd = new FormData(cf);
    window.BW_send("Message du site — " + (fd.get("subject") || "Contact"), { "Nom": fd.get("name"), "E-mail": fd.get("email"), "Téléphone": fd.get("phone"), "Sujet": fd.get("subject"), "Message": fd.get("message") }, function (sent) {
      var ok = $("#contact-success");
      $(".ok-mode", ok).textContent = sent ? "Merci ! Nous vous répondrons très vite." : "Votre messagerie s'est ouverte avec votre message pré-rempli : il ne reste plus qu'à l'envoyer.";
      ok.classList.add("show");
    });
  });

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
