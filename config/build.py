#!/usr/bin/env python3
"""Generates icons, favicon, OG image, the release ZIP and zip-builder.html.

Run from anywhere:  python3 config/build.py
Requires Pillow (pip install pillow) for the PNG/ICO images.
"""
import base64
import json
import os
import zipfile

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASPHALT = (18, 21, 26)
AMBER = (245, 158, 11)
RED = (200, 16, 46)
GOLD = (212, 160, 23)
EMERALD = (16, 185, 129)
WHITE = (243, 244, 246)


def p(*parts):
    return os.path.join(ROOT, *parts)


def draw_bike(d, size, cx, cy, scale, color=WHITE, accent=AMBER):
    """Simple bicycle glyph centred at (cx, cy); scale is wheel radius."""
    r = scale
    w = max(2, int(r * 0.12))
    lw = (cx - r * 1.05, cy)
    rw = (cx + r * 1.05, cy)
    for c in (lw, rw):
        d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=color, width=w)
    bb = (cx - r * 0.1, cy)          # bottom bracket
    seat = (cx - r * 0.35, cy - r * 0.95)
    head = (cx + r * 0.7, cy - r * 0.9)
    d.line([lw, seat], fill=accent, width=w)
    d.line([seat, bb], fill=accent, width=w)
    d.line([bb, head], fill=accent, width=w)
    d.line([seat, head], fill=accent, width=w)
    d.line([head, rw], fill=accent, width=w)
    d.line([seat, (seat[0] - r * 0.12, seat[1] - r * 0.15)], fill=color, width=w)
    d.line([head, (head[0] - r * 0.1, head[1] - r * 0.25)], fill=color, width=w)
    d.line([(head[0] - r * 0.1, head[1] - r * 0.25), (head[0] + r * 0.12, head[1] - r * 0.25)], fill=color, width=w)


def make_icon(size):
    img = Image.new("RGB", (size, size), ASPHALT)
    d = ImageDraw.Draw(img)
    # transit stripe band (red / gold / amber)
    band = size // 14
    y0 = int(size * 0.80)
    for i, col in enumerate((RED, GOLD, AMBER)):
        d.rectangle([0, y0 + i * band, size, y0 + (i + 1) * band], fill=col)
    # sun
    d.ellipse([size * 0.58, size * 0.10, size * 0.88, size * 0.40], fill=AMBER)
    draw_bike(d, size, size * 0.5, size * 0.56, size * 0.19)
    return img


def font(size, bold=True):
    for name in ("DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def make_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), ASPHALT)
    d = ImageDraw.Draw(img)
    d.ellipse([820, -120, 1320, 380], fill=(60, 40, 8))
    d.ellipse([880, -60, 1260, 320], fill=AMBER)
    draw_bike(d, W, 930, 400, 120)
    for i, col in enumerate((RED, GOLD, AMBER)):
        d.rectangle([0, H - 60 + i * 20, W, H - 40 + i * 20], fill=col)
    d.text((60, 120), "Discovery & Jebel Ali", font=font(72), fill=WHITE)
    d.text((60, 205), "Pedal", font=font(72), fill=AMBER)
    d.text((60, 320), "Urban & Industrial Dubai", font=font(38), fill=(163, 171, 184))
    d.text((60, 370), "Cycling Manual", font=font(38), fill=(163, 171, 184))
    d.text((60, 470), "Offline PWA  |  140+ tips  |  SOS  |  Checklist", font=font(28), fill=EMERALD)
    return img


def build_images():
    os.makedirs(p("assets"), exist_ok=True)
    big = make_icon(512)
    big.save(p("icon-512.png"), optimize=True)
    big.resize((192, 192), Image.LANCZOS).save(p("icon-192.png"), optimize=True)
    big.save(p("favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    make_og().save(p("assets", "og-image.png"), optimize=True)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<rect width="64" height="64" fill="#12151A"/><circle cx="46" cy="18" r="9" fill="#F59E0B"/>'
        '<circle cx="19" cy="38" r="10" fill="none" stroke="#F3F4F6" stroke-width="3"/>'
        '<circle cx="45" cy="38" r="10" fill="none" stroke="#F3F4F6" stroke-width="3"/>'
        '<path d="M19 38 L28 24 L32 38 L43 26 L45 38 M28 24 L43 26" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linejoin="round"/>'
        '<rect y="54" width="64" height="3" fill="#C8102E"/><rect y="57" width="64" height="3" fill="#D4A017"/>'
        "</svg>\n"
    )
    with open(p("assets", "icons.svg"), "w", encoding="utf-8") as f:
        f.write(svg)


def project_files():
    out = []
    skip_dirs = {".git", "node_modules", "dist"}
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for name in files:
            full = os.path.join(base, name)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            if rel.endswith(".zip") or rel == "zip-builder.html":
                continue
            out.append(rel)
    return sorted(out)


ZIP_BUILDER_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>ZIP Builder | Dubai Pedal</title>
<style>
  body{margin:0;padding:calc(20px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));background:#12151A;color:#F3F4F6;font:16px/1.5 -apple-system,BlinkMacSystemFont,sans-serif}
  main{max-width:640px;margin:0 auto}
  h1{font-size:1.5rem;margin:0 0 6px}
  p,li{color:#A3ABB8}
  button{width:100%;min-height:54px;border:0;border-radius:14px;background:#F59E0B;color:#12151A;font-weight:700;font-size:1.05rem;margin:14px 0}
  #log{font:13px ui-monospace,Menlo,monospace;background:#1A1F27;border-radius:12px;padding:12px;white-space:pre-wrap;max-height:260px;overflow:auto;color:#10B981}
  a{color:#F59E0B}
</style>
</head>
<body>
<main>
  <h1>Dubai Pedal ZIP Builder</h1>
  <p>This page contains every project file. Tap the button to create a ready-to-upload ZIP on your iPhone. No internet needed.</p>
  <button id="go" type="button">Build ZIP (__COUNT__ files)</button>
  <p id="out"></p>
  <div id="log" aria-live="polite">Ready.</div>
  <ol>
    <li>Tap Build ZIP, then Download. Save to Files.</li>
    <li>Tap the ZIP in Files to extract it.</li>
    <li>In Safari, create a GitHub repository and use Add file, then Upload files.</li>
    <li>Select everything from the extracted folder and commit.</li>
  </ol>
</main>
<script>
(function () {
  "use strict";
  var FILES = __FILES_JSON__;

  var table = (function () {
    var t = [], c, n, k;
    for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = table[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function b64ToBytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function u16(v) { return [v & 255, (v >>> 8) & 255]; }
  function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
  function utf8(s) { return new TextEncoder().encode(s); }

  // Store-only ZIP writer (no compression, maximum compatibility).
  function buildZip(files) {
    var parts = [], central = [], offset = 0;
    var d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = utf8(f.path), data = b64ToBytes(f.b64), crc = crc32(data);
      var local = [].concat([0x50, 0x4B, 3, 4], u16(20), u16(0x0800), u16(0), u16(time), u16(date),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      parts.push(new Uint8Array(local), name, data);
      var cen = [].concat([0x50, 0x4B, 1, 2], u16(20), u16(20), u16(0x0800), u16(0), u16(time), u16(date),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0),
        u32(0), u32(offset));
      central.push(new Uint8Array(cen), name);
      offset += local.length + name.length + data.length;
    });
    var cdSize = 0;
    central.forEach(function (c) { cdSize += c.length; });
    var end = new Uint8Array([].concat([0x50, 0x4B, 5, 6], u16(0), u16(0), u16(files.length), u16(files.length),
      u32(cdSize), u32(offset), u16(0)));
    return new Blob(parts.concat(central, [end]), { type: "application/zip" });
  }

  var log = document.getElementById("log");
  document.getElementById("go").addEventListener("click", function () {
    try {
      log.textContent = "Building " + FILES.length + " files...\n";
      var blob = buildZip(FILES);
      var url = URL.createObjectURL(blob);
      var out = document.getElementById("out");
      out.innerHTML = "";
      var a = document.createElement("a");
      a.href = url; a.download = "dubai-cycling-manual.zip";
      a.textContent = "Download dubai-cycling-manual.zip (" + Math.round(blob.size / 1024) + " KB)";
      a.style.cssText = "display:block;padding:14px;border:2px solid #10B981;border-radius:14px;text-align:center;font-weight:700";
      out.appendChild(a);
      FILES.forEach(function (f) { log.textContent += "+ " + f.path + "\n"; });
      log.textContent += "Done. Tap the green link above.";
    } catch (e) {
      log.textContent = "Error: " + e.message;
    }
  });
})();
</script>
</body>
</html>
"""


def build_zip_builder():
    entries = []
    for rel in project_files():
        with open(p(*rel.split("/")), "rb") as f:
            entries.append({"path": rel, "b64": base64.b64encode(f.read()).decode("ascii")})
    html = ZIP_BUILDER_TEMPLATE.replace("__COUNT__", str(len(entries))).replace(
        "__FILES_JSON__", json.dumps(entries).replace("</", "<\\/")
    )
    with open(p("zip-builder.html"), "w", encoding="utf-8") as f:
        f.write(html)
    return len(entries)


def build_zip():
    dist = os.path.abspath(os.path.join(ROOT, "..", "dist"))
    os.makedirs(dist, exist_ok=True)
    target = os.path.join(dist, "dubai-cycling-manual.zip")
    names = project_files()
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in names + ["zip-builder.html"]:
            z.write(p(*rel.split("/")), rel)
    return target


if __name__ == "__main__":
    build_images()
    n = build_zip_builder()
    target = build_zip()
    print("Images generated. zip-builder.html embeds", n, "files.")
    print("ZIP written to", target)
