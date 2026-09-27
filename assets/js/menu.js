/* Bollywood Gaillard — carte interactive & commande à emporter */
(function () {
  "use strict";
  var root = document.getElementById("menu-root");
  if (!root) return;
  var C = window.BW_CONFIG, MENU = window.BW_MENU, BASE = root.getAttribute("data-base") || "";
  var ORDER = root.getAttribute("data-mode") === "order";
  var EN = document.documentElement.lang === "en", t = window.BW_t;
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DRINKS = { "softs-jus": 1, "eaux-minerales": 1 };
  var ICON = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chili: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.6 3.4c-.4-.4-1-.4-1.4 0l-1.1 1.1c-1-.5-2.2-.4-3.1.3-1.8 1.4-2.4 3.2-3.6 5.1-1.5 2.4-3.9 4.6-8.2 5.6-.8.2-1.1 1.1-.6 1.7 1.7 2 4.4 3.3 7.4 3 5.8-.5 9.8-5.8 10-11.2 0-.9-.3-1.8-.9-2.4l1.5-1.5c.4-.4.4-1 0-1.4z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19l7-7"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>'
  };
  var eur = function (n) { return EN ? "€" + n.toFixed(2).replace(".00", "") : n.toFixed(2).replace(".", ",").replace(",00", "") + " €"; };
  var eur2 = function (n) { return EN ? "€" + n.toFixed(2) : n.toFixed(2).replace(".", ",") + " €"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe"); };
  var nm = function (o) { return EN && o.name_en ? o.name_en : o.name; };
  var ds = function (o) { return EN && o.desc_en != null ? o.desc_en : o.desc; };

  var byId = {};
  MENU.forEach(function (c) { c.items.forEach(function (it) { it.cat = c; it.key = c.id + "/" + it.id; byId[it.key] = it; }); });
  var takeawayPrice = function (it) { return it.cat.takeaway ? Math.round(it.price * 90) / 100 : it.price; };

  /* ---------- rendu ---------- */
  var HOT = EN ? ["", "Medium", "Hot", "Very hot"] : ["", "Relevé", "Piquant", "Très piquant"];
  function chili(n) { var s = ""; for (var i = 0; i < n; i++) s += ICON.chili; return '<span class="tag tag-hot"><span class="chili">' + s + "</span>" + HOT[n] + "</span>"; }
  function itemHTML(it) {
    var drink = DRINKS[it.cat.id];
    var img = !drink && it.img ? '<button type="button" class="mi-thumb" data-zoom="' + BASE + it.img + '" aria-label="' + t("Voir la photo : ", "View photo: ") + esc(nm(it)) + '"><img src="' + BASE + it.img + '" alt="" loading="lazy" decoding="async" width="84" height="84"></button>' : "";
    var price = ORDER ? takeawayPrice(it) : it.price;
    var meta = [];
    it.tags.forEach(function (tg) { if (tg === "veg") meta.push('<span class="tag tag-veg">' + ICON.leaf + t("Végétarien", "Vegetarian") + "</span>"); else meta.push(chili(tg)); });
    if (it.note) meta.push('<span class="tag tag-gift">' + t(it.note, "Free with takeaway orders over €20") + "</span>");
    if (!ORDER && it.cat.takeaway) meta.push('<span class="takeaway">' + t("À emporter ", "Takeaway ") + "<b>" + eur(takeawayPrice(it)) + "</b></span>");
    if (ORDER && it.cat.takeaway) meta.push('<span class="takeaway"><s>' + eur(it.price) + "</s> −10 %</span>");
    var action = ORDER ? '<span class="mi-action"><span class="qty-badge" hidden></span><button type="button" class="add-btn" data-add="' + it.key + '" aria-label="' + t("Ajouter ", "Add ") + esc(nm(it)) + '">' + ICON.plus + "</button></span>" : "";
    var d = ds(it);
    return '<article class="menu-item' + (img ? "" : " no-img") + '" data-key="' + it.key + '" data-search="' + esc(norm(it.name + " " + (it.name_en || "") + " " + it.desc + " " + (it.desc_en || ""))) + '" data-veg="' + (it.tags.indexOf("veg") > -1 ? 1 : 0) + '" data-hot="' + (it.tags.some(function (x) { return x > 0; }) ? 1 : 0) + '">' +
      img + '<div><div class="mi-top"><h3 class="mi-name">' + esc(nm(it)) + '</h3><span class="mi-dots"></span><span class="mi-price">' + eur(price) + "</span></div>" +
      (d ? '<p class="mi-desc">' + esc(d) + "</p>" : "") +
      ((meta.length || action) ? '<div class="mi-meta">' + meta.join("") + action + "</div>" : "") + "</div></article>";
  }
  var html = "";
  MENU.forEach(function (c) {
    var cd = ds(c);
    html += '<section class="menu-section" id="' + c.id + '">' +
      '<div class="menu-section-head">' + (c.img ? '<img src="' + BASE + c.img + '" alt="" loading="lazy" width="88" height="88">' : "<span></span>") +
      "<div><h2>" + esc(nm(c)) + "</h2>" + (cd ? "<p>" + esc(cd) + "</p>" : "") + "</div></div>" +
      '<div class="' + (DRINKS[c.id] ? "drinks-grid" : "menu-grid") + ' stagger">' + c.items.map(itemHTML).join("") + "</div></section>";
  });
  root.innerHTML = html + '<p class="empty-state" id="menu-empty">' + t("Aucun plat ne correspond à votre recherche.", "No dish matches your search.") + "</p>";

  // apparition en cascade des plats
  if ("IntersectionObserver" in window && !REDUCED) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$(".menu-item", e.target).forEach(function (el, i) { el.style.transitionDelay = Math.min(i, 10) * 45 + "ms"; });
        e.target.classList.add("in"); so.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -5% 0px" });
    $$(".stagger", root).forEach(function (g) { so.observe(g); });
  } else $$(".stagger", root).forEach(function (g) { g.classList.add("in"); });

  /* ---------- puces catégories + scrollspy ---------- */
  var chips = $("#menu-chips");
  if (chips) {
    chips.innerHTML = MENU.map(function (c) { return '<a class="chip" href="#' + c.id + '" data-chip="' + c.id + '">' + esc(nm(c)) + "</a>"; }).join("");
    var setActive = function (id) {
      $$(".chip", chips).forEach(function (a) {
        var on = a.getAttribute("data-chip") === id;
        a.classList.toggle("active", on);
        if (on) chips.scrollTo({ left: a.offsetLeft - chips.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
      });
    };
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: "-40% 0px -55% 0px" });
      $$(".menu-section", root).forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------- filtres ---------- */
  var q = $("#menu-search"), fVeg = $("#f-veg"), fHot = $("#f-hot");
  function applyFilter() {
    var term = q ? norm(q.value.trim()) : "", veg = fVeg && fVeg.getAttribute("aria-pressed") === "true", hot = fHot && fHot.getAttribute("aria-pressed") === "true";
    var any = false;
    $$(".menu-section", root).forEach(function (sec) {
      var vis = 0;
      $$(".menu-item", sec).forEach(function (el) {
        var ok = (!term || el.getAttribute("data-search").indexOf(term) > -1) && (!veg || el.getAttribute("data-veg") === "1") && (!hot || el.getAttribute("data-hot") === "1");
        el.hidden = !ok; if (ok) vis++;
      });
      sec.hidden = !vis; if (vis) any = true;
    });
    $("#menu-empty").style.display = any ? "none" : "block";
    if (chips) $$(".chip", chips).forEach(function (a) { var s = document.getElementById(a.getAttribute("data-chip")); a.hidden = s && s.hidden; });
  }
  if (q) q.addEventListener("input", applyFilter);
  [fVeg, fHot].forEach(function (b) {
    if (b) b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); applyFilter(); });
  });

  /* ---------- zoom photo ---------- */
  root.addEventListener("click", function (e) {
    var z = e.target.closest("[data-zoom]");
    if (z) { var it = byId[z.closest(".menu-item").getAttribute("data-key")]; window.BW_lightbox([{ src: z.getAttribute("data-zoom"), cap: nm(it) }], 0, z); }
  });

  if (!ORDER) return;

  /* =========================================================
     PANIER
     ========================================================= */
  var KEY = "bw_cart_v1", cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(function (k) { if (!byId[k] || !(cart[k] > 0)) delete cart[k]; });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }

  var body = $("#cart-body"), totalEl = $("#cart-total"), savingEl = $("#cart-saving"), countEls = $$("[data-cart-count]"), fab = $("#cart-fab"), checkout = $("#cart-checkout");
  function totals() {
    var sub = 0, full = 0, food = 0, n = 0;
    Object.keys(cart).forEach(function (k) {
      var it = byId[k], qn = cart[k];
      sub += takeawayPrice(it) * qn; full += it.price * qn; n += qn;
      if (it.cat.takeaway) food += takeawayPrice(it) * qn;
    });
    return { sub: Math.round(sub * 100) / 100, saving: Math.round((full - sub) * 100) / 100, food: food, n: n, gift: food >= C.giftThreshold };
  }
  function render() {
    var keys = Object.keys(cart), tt = totals();
    if (!keys.length) {
      body.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>' + t("Votre commande est vide.<br>Ajoutez des plats avec le bouton <b>+</b>", "Your order is empty.<br>Add dishes with the <b>+</b> button") + "</div>";
    } else {
      body.innerHTML = keys.map(function (k) {
        var it = byId[k];
        return '<div class="cart-line"><span class="n">' + esc(nm(it)) + '</span><span class="p">' + eur2(takeawayPrice(it) * cart[k]) + '</span>' +
          '<span class="stepper"><button type="button" data-dec="' + k + '" aria-label="' + t("Retirer un ", "Remove one ") + esc(nm(it)) + '">−</button><span>' + cart[k] + '</span><button type="button" data-inc="' + k + '" aria-label="' + t("Ajouter un ", "Add one ") + esc(nm(it)) + '">+</button></span><span></span></div>';
      }).join("") +
        (tt.gift ? '<div class="cart-gift">' + ICON.gift + t("1 Riz Kashmiri offert avec votre commande !", "1 free Kashmiri rice with your order!") + "</div>"
          : '<div class="cart-progress">' + t("Plus que <b>" + eur2(C.giftThreshold - tt.food) + "</b> de plats pour recevoir un Riz Kashmiri offert", "Only <b>" + eur2(C.giftThreshold - tt.food) + "</b> more for a free Kashmiri rice") + '<div class="bar"><i style="width:' + Math.min(100, tt.food / C.giftThreshold * 100) + '%"></i></div></div>');
    }
    totalEl.textContent = eur2(tt.sub);
    savingEl.textContent = tt.saving > 0 ? t("Vous économisez " + eur2(tt.saving) + " grâce à la remise à emporter", "You save " + eur2(tt.saving) + " with the takeaway discount") : t("−10 % sur tous les plats à emporter", "−10% on all takeaway dishes");
    countEls.forEach(function (el) { el.textContent = tt.n; });
    if (fab) { fab.classList.toggle("hidden", !tt.n); $(".fab-total", fab).textContent = eur2(tt.sub); }
    checkout.disabled = !tt.n;
    $$(".menu-item", root).forEach(function (el) {
      var k = el.getAttribute("data-key"), b = $(".qty-badge", el);
      if (b) { b.hidden = !cart[k]; b.textContent = "×" + (cart[k] || 0); }
    });
  }
  function bump(el) { if (!el || REDUCED) return; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  function add(k, d) {
    cart[k] = (cart[k] || 0) + d;
    if (cart[k] <= 0) delete cart[k];
    save(); render();
  }

  /* l'assiette « vole » jusqu'au panier */
  function flyToCart(fromEl, imgSrc) {
    var cartBox = $(".cart"), target = (fab && getComputedStyle(fab).display !== "none") ? fab : $(".cart-head", cartBox);
    if (REDUCED || !target || !fromEl.animate) return bump(target);
    var a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    var ghost = document.createElement(imgSrc ? "img" : "div");
    ghost.className = "fly-ghost";
    if (imgSrc) ghost.src = imgSrc;
    var size = imgSrc ? 64 : 22;
    ghost.style.cssText = "left:" + (a.left + a.width / 2 - size / 2) + "px;top:" + (a.top + a.height / 2 - size / 2) + "px;width:" + size + "px;height:" + size + "px";
    document.body.appendChild(ghost);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    ghost.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: "translate(" + dx * 0.45 + "px," + (dy * 0.45 - 90) + "px) scale(.9)", opacity: 1, offset: 0.5 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.25)", opacity: 0.4 }
    ], { duration: 720, easing: "cubic-bezier(.5,0,.3,1)" }).onfinish = function () { ghost.remove(); bump(target); };
    setTimeout(function () { if (ghost.parentNode) ghost.remove(); }, 1200);
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var k = b.getAttribute("data-add"), it = byId[k];
    add(k, 1);
    var thumb = $(".mi-thumb", b.closest(".menu-item"));
    flyToCart(thumb || b, it.img && !DRINKS[it.cat.id] ? BASE + it.img : null);
    b.classList.add("added"); b.innerHTML = ICON.check;
    setTimeout(function () { b.classList.remove("added"); b.innerHTML = ICON.plus; }, 900);
    window.BW_toast(nm(it) + t(" ajouté", " added"));
  });
  body.addEventListener("click", function (e) {
    var i = e.target.closest("[data-inc]"), d = e.target.closest("[data-dec]");
    if (i) add(i.getAttribute("data-inc"), 1);
    if (d) add(d.getAttribute("data-dec"), -1);
  });
  if (fab) fab.addEventListener("click", function () { document.body.classList.add("cart-open"); $(".cart .cart-close").focus(); });
  $(".cart .cart-close").addEventListener("click", function () { document.body.classList.remove("cart-open"); });
  document.addEventListener("click", function (e) { if (document.body.classList.contains("cart-open") && !e.target.closest(".cart") && !e.target.closest("#cart-fab")) document.body.classList.remove("cart-open"); });
  var clear = $("#cart-clear");
  if (clear) clear.addEventListener("click", function () { if (confirm(t("Vider la commande ?", "Clear your order?"))) { cart = {}; save(); render(); } });

  /* ---------- validation ---------- */
  var dlg = $("#order-dialog"), form = $("#order-form");
  function pickupOptions() {
    var sel = $("#o-time"), out = [], d = new Date(), fmt = window.BW_fmtTime;
    var st = window.BW_slots(window.BW_isoDate(d), C.prepMinutes);
    var nowMin = d.getHours() * 60 + d.getMinutes(), openNow = (C.hours[d.getDay()] || []).some(function (s) { var o = +s[0].slice(0, 2) * 60 + +s[0].slice(3), c = +s[1].slice(0, 2) * 60 + +s[1].slice(3); return nowMin >= o && nowMin < c - C.prepMinutes; });
    if (openNow) out.push('<option value="' + t("Dès que possible (~25 min)", "As soon as possible (~25 min)") + '">' + t("Dès que possible (~25 min)", "As soon as possible (~25 min)") + "</option>");
    for (var i = 0; i < 7 && out.length < 2; i++) {
      var iso = window.BW_isoDate(d), s = i === 0 ? st : window.BW_slots(iso, 0);
      if (s.length) {
        var label = i === 0 ? t("Aujourd'hui", "Today") : i === 1 ? t("Demain", "Tomorrow") : window.BW_frDate(iso);
        out.push('<optgroup label="' + label + '">' + s.map(function (x) { return '<option value="' + label + " " + t("à", "at") + " " + fmt(x) + '">' + fmt(x) + "</option>"; }).join("") + "</optgroup>");
      }
      d.setDate(d.getDate() + 1);
    }
    sel.innerHTML = out.join("");
  }
  function orderLines(display) {
    var tt = totals(), lines = Object.keys(cart).map(function (k) { return cart[k] + " × " + (display ? nm(byId[k]) : byId[k].name) + " — " + eur2(takeawayPrice(byId[k]) * cart[k]); });
    if (tt.gift) lines.push("1 × Riz Kashmiri — " + t("offert", "free"));
    return lines;
  }
  checkout.addEventListener("click", function () {
    var tt = totals();
    $("#o-recap").innerHTML = orderLines(true).map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + '<li class="tot"><b>Total : ' + eur2(tt.sub) + "</b></li>";
    pickupOptions();
    $("#order-form-wrap").hidden = false; $("#order-success").classList.remove("show");
    document.body.classList.remove("cart-open");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  });
  $$("[data-close-dialog]").forEach(function (b) { b.addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); }); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var fd = new FormData(form), tt = totals(), lines = orderLines();
    $("[name=commande]", form).value = lines.join("\n");
    $("[name=total]", form).value = eur2(tt.sub) + " (" + (EN ? "English" : "Français") + ")";
    window.BW_send(form, "Commande à emporter — " + fd.get("name") + " — " + fd.get("time"), {
      "Nom": fd.get("name"), "Téléphone": fd.get("phone"), "Retrait": fd.get("time"),
      "Commande": "\n  " + lines.join("\n  "), "Total": eur2(tt.sub), "Remarque": fd.get("note")
    }, function (sent) {
      $("#order-form-wrap").hidden = true;
      var ok = $("#order-success"); ok.classList.add("show");
      $(".ok-mode", ok).textContent = sent ? t("Votre commande nous a été transmise. Nous vous rappelons si besoin.", "Your order has been sent. We'll call you if needed.") : t("Votre messagerie s'est ouverte avec la commande pré-remplie : envoyez-la pour la valider. Pour une commande urgente, appelez-nous.", "Your e-mail app has opened with the order pre-filled — send it to confirm. For urgent orders, please call us.");
      cart = {}; save(); render();
    });
  });
  render();
})();
