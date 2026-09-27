/* Génération des QR codes des chevalets de table */
(function () {
  "use strict";
  var input = document.getElementById("qr-url");
  if (!input || typeof qrcode !== "function") return;
  var svg = "";
  input.value = location.origin + "/menu/";
  function draw() {
    var qr = qrcode(0, "M");
    qr.addData(input.value.trim() || location.origin + "/menu/");
    qr.make();
    svg = qr.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
    Array.prototype.forEach.call(document.querySelectorAll(".qr-code"), function (el) { el.innerHTML = svg; });
  }
  input.addEventListener("input", draw);
  draw();
  document.getElementById("qr-dl").addEventListener("click", function () {
    var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>' + svg], { type: "image/svg+xml" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "qr-carte-bollywood.svg";
    document.body.appendChild(a); a.click(); a.remove();
  });
})();
