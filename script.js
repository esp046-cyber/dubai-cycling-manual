(function () {
  "use strict";

  var TIPS = window.DJP_TIPS || [];
  var CATS = window.DJP_CATEGORIES || [];
  var LS = { saved: "djp.saved.v1", checks: "djp.checks.v1" };

  var CHECKLIST = [
    "Helmet fitted and chin strap snug",
    "High-visibility vest or reflective gear on",
    "Tyres pressure checked (start slightly below max in heat)",
    "Front and rear brakes bite firmly",
    "Chain clean and lightly lubricated, no sand paste",
    "Quick releases / axle bolts tight",
    "Front light and red rear light charged and working",
    "Two spare tubes, levers, pump or CO2 packed",
    "At least one litre of water per hour, plus electrolytes",
    "Sunscreen, sunglasses and neck buff",
    "Phone charged, offline map saved, power bank packed",
    "ID, emergency contact and bike lock carried",
    "Route and return time shared with someone",
    "Checked weather: heat, wind, dust, humidity"
  ];

  var COORDS = [
    { label: "Discovery Gardens (area centre)", value: "25.0390, 55.1450" },
    { label: "Jebel Ali Village (area centre)", value: "25.0300, 55.1330" },
    { label: "Festival Plaza (approx.)", value: "25.0270, 55.1250" },
    { label: "Jebel Ali Free Zone (approx.)", value: "25.0000, 55.0600" },
    { label: "Jebel Ali Port (approx., restricted perimeter)", value: "25.0110, 55.0270" }
  ];

  var GPX_TIPS = [
    { label: "Record at 1 second intervals", value: "Set your cycling app to record every 1 second for accurate turns near junctions." },
    { label: "Name waypoints by hazard", value: "Use names like SPEEDBUMP, E11-BRIDGE, SAND-EDGE, NO-LIGHT for quick recognition." },
    { label: "Add water stops", value: "Mark WATER waypoints every 5 to 8 km so refills are planned, not improvised." },
    { label: "Download offline before you go", value: "Save map tiles offline; import the GPX to your app while on Wi-Fi." },
    { label: "Avoid restricted perimeters", value: "Never route along port or secure fences. Verify access before you ride." }
  ];

  var GPX_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<gpx version="1.1" creator="Discovery &amp; Jebel Ali Pedal" xmlns="http://www.topografix.com/GPX/1/1">\n' +
    '  <metadata><name>Discovery Gardens to Festival Plaza (starter)</name></metadata>\n' +
    '  <wpt lat="25.0390" lon="55.1450"><name>START Discovery Gardens</name></wpt>\n' +
    '  <wpt lat="25.0300" lon="55.1330"><name>Jebel Ali Village</name></wpt>\n' +
    '  <wpt lat="25.0270" lon="55.1250"><name>Festival Plaza</name></wpt>\n' +
    '  <wpt lat="25.0300" lon="55.1330"><name>WATER refill (verify)</name></wpt>\n' +
    '  <rte><name>Starter route (confirm on map)</name>\n' +
    '    <rtept lat="25.0390" lon="55.1450"/>\n' +
    '    <rtept lat="25.0300" lon="55.1330"/>\n' +
    '    <rtept lat="25.0270" lon="55.1250"/>\n' +
    '  </rte>\n</gpx>\n';

  var state = { cat: "all", query: "", saved: load(LS.saved, []), checks: load(LS.checks, {}) };

  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage blocked */ }
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function catLabel(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label; return id; }

  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); toast(ok ? "Copied" : "Copy failed");
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied"); }, fallback);
    } else { fallback(); }
  }

  function matches(t) {
    if (state.cat === "saved") { if (state.saved.indexOf(t.id) < 0) return false; }
    else if (state.cat !== "all" && t.cat !== state.cat) return false;
    if (!state.query) return true;
    var hay = (t.title + " " + t.text + " " + catLabel(t.cat)).toLowerCase();
    return state.query.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }

  function renderTabs() {
    var counts = { all: TIPS.length, saved: state.saved.length };
    TIPS.forEach(function (t) { counts[t.cat] = (counts[t.cat] || 0) + 1; });
    var items = [{ id: "all", label: "All" }].concat(CATS, [{ id: "saved", label: "Saved" }]);
    $("tabs").innerHTML = items.map(function (c) {
      return '<button class="tab" role="tab" type="button" data-cat="' + c.id + '" aria-selected="' + (state.cat === c.id) + '">' +
        esc(c.label) + '<span class="n">' + (counts[c.id] || 0) + "</span></button>";
    }).join("");
  }

  function renderTips() {
    var list = TIPS.filter(matches);
    $("tips").innerHTML = list.map(function (t) {
      var on = state.saved.indexOf(t.id) >= 0;
      return '<article class="card cat-' + t.cat + '"><h3>' + esc(t.title) + "</h3><p>" + esc(t.text) + "</p>" +
        '<div class="card-foot"><span class="tag">' + esc(catLabel(t.cat)) + "</span>" +
        '<button class="icon-btn" type="button" data-save="' + t.id + '" aria-pressed="' + on + '" aria-label="' + (on ? "Remove bookmark" : "Bookmark tip") + '">' + (on ? "★" : "☆") + "</button></div></article>";
    }).join("");
    $("empty").hidden = list.length > 0;
    $("tipCounter").textContent = list.length + (list.length === TIPS.length ? " tips" : " of " + TIPS.length + " tips");
  }

  function renderChecklist() {
    $("checklist").innerHTML = CHECKLIST.map(function (txt, i) {
      return '<li><label><input type="checkbox" data-ck="' + i + '"' + (state.checks[i] ? " checked" : "") + "><span>" + esc(txt) + "</span></label></li>";
    }).join("");
    updateProgress();
  }

  function updateProgress() {
    var done = CHECKLIST.filter(function (_, i) { return state.checks[i]; }).length;
    $("clProgress").textContent = done + "/" + CHECKLIST.length;
    $("clBar").style.width = (done / CHECKLIST.length * 100) + "%";
  }

  function renderCopyList(id, items) {
    $(id).innerHTML = items.map(function (c, i) {
      return '<li><div><span class="lbl">' + esc(c.label) + '</span><span class="val">' + esc(c.value) +
        '</span></div><button class="copy" type="button" data-copy="' + id + ":" + i + '">Copy</button></li>';
    }).join("");
  }

  function updateNet() {
    var el = $("netStatus"), on = navigator.onLine;
    el.textContent = on ? "Online" : "Offline mode";
    el.className = "badge " + (on ? "online" : "offline");
  }

  document.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-cat]");
    if (tab) { state.cat = tab.getAttribute("data-cat"); renderTabs(); renderTips(); return; }
    var sv = e.target.closest("[data-save]");
    if (sv) {
      var id = sv.getAttribute("data-save"), i = state.saved.indexOf(id);
      if (i >= 0) state.saved.splice(i, 1); else state.saved.push(id);
      save(LS.saved, state.saved); renderTabs(); renderTips(); return;
    }
    var cp = e.target.closest("[data-copy]");
    if (cp) {
      var parts = cp.getAttribute("data-copy").split(":");
      var src = parts[0] === "coords" ? COORDS : GPX_TIPS;
      copyText(src[+parts[1]].value);
    }
  });

  document.addEventListener("change", function (e) {
    var ck = e.target.closest("[data-ck]");
    if (ck) { state.checks[ck.getAttribute("data-ck")] = ck.checked; save(LS.checks, state.checks); updateProgress(); }
  });

  $("search").addEventListener("input", function (e) { state.query = e.target.value.trim().toLowerCase(); renderTips(); });
  $("clReset").addEventListener("click", function () { state.checks = {}; save(LS.checks, state.checks); renderChecklist(); toast("Checklist reset"); });
  $("copyGpx").addEventListener("click", function () { copyText(GPX_TEMPLATE); });
  window.addEventListener("online", updateNet);
  window.addEventListener("offline", updateNet);

  renderTabs(); renderTips(); renderChecklist();
  renderCopyList("coords", COORDS); renderCopyList("gpxTips", GPX_TIPS);
  updateNet();
})();
