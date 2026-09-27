/* Bollywood Gaillard — interactions communes */
(function () {
  "use strict";
  var C = window.BW_CONFIG;
  var EN = document.documentElement.lang === "en";
  var t = window.BW_t = function (fr, en) { return EN ? en : fr; };
  var LOCALE = EN ? "en-GB" : "fr-FR";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DAYS = EN ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] : ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  /* ---------- en-tête ---------- */
  var header = $(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = $(".burger");
  if (burger) {
    var closeNav = function () { document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); };
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", closeNav); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) { closeNav(); burger.focus(); }
    });
  }

  /* ---------- horaires & statut ---------- */
  function toMin(s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(s) { return EN ? s : s.replace(":", "h"); }
  function status(now) {
    now = now || new Date();
    var d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    var slots = C.hours[d] || [];
    for (var i = 0; i < slots.length; i++) {
      var o = toMin(slots[i][0]), c = toMin(slots[i][1]);
      if (m >= o && m < c) return { open: true, text: c - m <= 30 ? t("Ouvert · ferme bientôt (", "Open · closing soon (") + fmt(slots[i][1]) + ")" : t("Ouvert maintenant · jusqu'à ", "Open now · until ") + fmt(slots[i][1]) };
      if (m < o) return { open: false, soon: o - m <= 60, text: t("Fermé · ouvre à ", "Closed · opens at ") + fmt(slots[i][0]) };
    }
    for (var k = 1; k <= 7; k++) {
      var nd = (d + k) % 7;
      if ((C.hours[nd] || []).length) return { open: false, text: t("Fermé · ouvre ", "Closed · opens ") + (k === 1 ? t("demain", "tomorrow") : DAYS[nd]) + t(" à ", " at ") + fmt(C.hours[nd][0][0]) };
    }
    return { open: false, text: t("Fermé", "Closed") };
  }
  $$("[data-status]").forEach(function (el) {
    var s = status();
    el.classList.toggle("open", s.open);
    el.classList.toggle("soon", !!s.soon);
    var tx = $(".status-text", el); if (tx) tx.textContent = s.text;
  });
  var today = new Date().getDay();
  $$(".hours li[data-day='" + today + "']").forEach(function (li) { li.classList.add("today"); });

  /* ---------- apparitions ---------- */
  var reveals = $$(".reveal, .reveal-mask");
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
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", t("Photo agrandie", "Enlarged photo"));
    lb.innerHTML = '<img alt=""><p></p>' +
      '<button class="lb-btn lb-close" aria-label="' + t("Fermer", "Close") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="' + t("Photo précédente", "Previous photo") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button class="lb-btn lb-next" aria-label="' + t("Photo suivante", "Next photo") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>';
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

  /* ---------- dates & créneaux ---------- */
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
  window.BW_fmtTime = fmt;
  window.BW_isoDate = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  window.BW_frDate = function (s) {
    var p = s.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
  };

  /* ---------- envoi des formulaires ----------
     C.forms === "netlify" : envoi à Netlify Forms (les demandes arrivent dans le tableau de bord
     Netlify et par e-mail). En cas d'échec (ou en local), on ouvre la messagerie du visiteur
     avec un message pré-rempli, pour ne jamais perdre une demande. */
  window.BW_send = function (form, subject, readable, done) {
    function mail() {
      var lines = Object.keys(readable).filter(function (k) { return readable[k]; }).map(function (k) { return k + " : " + readable[k]; });
      window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n") + "\n\n— " + t("Envoyé depuis le site", "Sent from the website"));
    }
    var btn = $("[type=submit]", form); if (btn) btn.disabled = true;
    var finish = function (ok) { if (btn) btn.disabled = false; if (!ok) mail(); done(ok); };
    if (C.forms === "netlify") {
      var body = new URLSearchParams(new FormData(form));
      body.set("subject", subject);
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function (r) { finish(r.ok); }).catch(function () { finish(false); });
    } else finish(false);
  };
  var lang = function () { return EN ? "English" : "Français"; };

  /* ---------- réservation ---------- */
  var rf = $("#booking-form");
  if (rf) {
    var date = $("#b-date", rf), time = $("#b-time", rf), hint = $("#b-date-hint");
    date.min = window.BW_isoDate(new Date());
    var max = new Date(); max.setDate(max.getDate() + 90); date.max = window.BW_isoDate(max);
    var first = new Date();
    for (var i = 0; i < 8; i++) { if (window.BW_slots(window.BW_isoDate(first), 60).length) break; first.setDate(first.getDate() + 1); }
    date.value = window.BW_isoDate(first);
    var fillTimes = function () {
      var s = window.BW_slots(date.value, 60);
      if (!s.length) {
        var p = date.value.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
        time.innerHTML = '<option value="">—</option>'; time.disabled = true;
        hint.textContent = (C.hours[d.getDay()] || []).length ? t("Plus de créneau disponible ce jour-là, choisissez une autre date.", "No more times available that day — please pick another date.") : t("Nous sommes fermés le " + DAYS[d.getDay()] + ".", "We are closed on " + DAYS[d.getDay()] + "s.");
        hint.style.color = "var(--chili)";
        return;
      }
      hint.textContent = t("Service de 11h30 à 14h30 et de 18h30 à 22h30.", "Lunch 11:30–14:30 · Dinner 18:30–22:30."); hint.style.color = "";
      time.disabled = false;
      var prev = time.value, html = "", g = "";
      s.forEach(function (x) {
        var grp = +x.slice(0, 2) < 16 ? t("Déjeuner", "Lunch") : t("Dîner", "Dinner");
        if (grp !== g) { if (g) html += "</optgroup>"; html += '<optgroup label="' + grp + '">'; g = grp; }
        html += '<option value="' + x + '">' + fmt(x) + "</option>";
      });
      time.innerHTML = html + "</optgroup>";
      if (s.indexOf(prev) > -1) time.value = prev; else if (s.indexOf("19:30") > -1) time.value = "19:30"; else if (s.indexOf("12:30") > -1) time.value = "12:30";
    };
    date.addEventListener("change", fillTimes); fillTimes();
    rf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!rf.reportValidity()) return;
      var fd = new FormData(rf);
      var when = window.BW_frDate(fd.get("date")) + " " + t("à", "at") + " " + fmt(fd.get("time") || "");
      $("[name=resume]", rf).value = fd.get("guests") + " pers. — " + when + " (" + lang() + ")";
      var r = {
        "Nom": fd.get("name"), "Téléphone": fd.get("phone"), "E-mail": fd.get("email"),
        "Date": when, "Personnes": fd.get("guests"), "Occasion": fd.get("occasion"), "Message": fd.get("message")
      };
      window.BW_send(rf, "Réservation — " + when + " — " + fd.get("guests") + " pers.", r, function (sent) {
        var ok = $("#booking-success");
        $(".ok-summary", ok).textContent = fd.get("guests") + " " + t("personne(s)", "guest(s)") + ", " + when + ".";
        $(".ok-mode", ok).textContent = sent ? t("Votre demande nous a bien été transmise. Nous vous confirmons la table rapidement.", "Your request has been sent. We will confirm your table shortly.") : t("Votre messagerie s'est ouverte avec votre demande pré-remplie : il ne reste plus qu'à l'envoyer.", "Your e-mail app has opened with your request pre-filled — just press send.");
        if (sent) rf.hidden = true;
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
    window.BW_send(cf, "Message du site — " + (fd.get("topic") || "Contact"), { "Nom": fd.get("name"), "E-mail": fd.get("email"), "Téléphone": fd.get("phone"), "Sujet": fd.get("topic"), "Message": fd.get("message") }, function (sent) {
      var ok = $("#contact-success");
      $(".ok-mode", ok).textContent = sent ? t("Merci ! Nous vous répondrons très vite.", "Thank you! We'll get back to you very soon.") : t("Votre messagerie s'est ouverte avec votre message pré-rempli : il ne reste plus qu'à l'envoyer.", "Your e-mail app has opened with your message pre-filled — just press send.");
      if (sent) cf.hidden = true;
      ok.classList.add("show");
    });
  });

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
